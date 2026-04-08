<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\StaffResource;
use App\Models\Branch;
use App\Models\Tenant\Staff;
use App\Models\Tenant;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class StaffAuthController extends Controller
{
    // =============================================
    // Helpers
    // =============================================

    private function getBranchesForStaff(Staff $staff): array
    {
        if ($staff->isOwner()) {
            return Branch::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn($b) => [
                    'id'          => $b->id,
                    'name'        => $b->name,
                    'branch_code' => $b->branch_code,
                    'address'     => $b->address,
                    'city'        => $b->city,
                    'role'        => 'owner',
                ])
                ->toArray();
        }

        return $staff->staffBranches()
            ->with('branch')
            ->where('is_active', true)
            ->get()
            ->map(fn($sb) => [
                'id'          => $sb->branch->id,
                'name'        => $sb->branch->name,
                'branch_code' => $sb->branch->branch_code,
                'address'     => $sb->branch->address,
                'city'        => $sb->branch->city,
                'role'        => $sb->role,
            ])
            ->toArray();
    }

    private function getDashboardPath(Staff $staff): string
    {
        return $staff->isOwner() ? '/owner/dashboard' : '/dashboard';
    }

    /**
     * Callback URL selalu ke domain auth central — satu URL untuk semua tenant.
     * Local:      http://gymbaru.localhost/api/tenant-auth/google/callback
     * Production: https://auth.gymbaru.com/api/tenant-auth/google/callback
     */
    private function getCallbackUrl(): string
{
    $url = env('GOOGLE_REDIRECT_URL');

    if (!$url) {
        throw new \RuntimeException('GOOGLE_REDIRECT_URL is not set in .env');
    }

    return $url;
}

    /**
     * Frontend URL diambil dari request host + port FE
     * Ini untuk redirect balik setelah callback
     * e.g. http://gymbali.localhost:3000
     */
    private function getFrontendUrl(Request $request): string
    {
        $scheme       = $request->getScheme();
        $host         = $request->getHost();
        $frontendPort = env('FRONTEND_PORT');
        $isLocal      = str_contains($host, 'localhost');

        // Production tidak perlu port
        return $isLocal
            ? "{$scheme}://{$host}:{$frontendPort}"
            : "{$scheme}://{$host}";
    }

    // =============================================
    // Email/Password Login
    // =============================================

    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $staff = Staff::where('email', $request->email)->first();

        if (!$staff || !Hash::check($request->password, $staff->password)) {
            return ApiResponse::error('Invalid email or password', null, 401);
        }

        if (!$staff->is_active) {
            return ApiResponse::error('Your account has been deactivated', null, 403);
        }

        $staff->tokens()->delete();
        $staff->update(['last_login_at' => now()]);

        $token    = $staff->createToken('staff-token')->plainTextToken;
        $branches = $this->getBranchesForStaff($staff);

        return ApiResponse::success([
            'token'          => $token,
            'staff'          => new StaffResource($staff),
            'branches'       => $branches,
            'global_role'    => $staff->role,
            'dashboard_path' => $this->getDashboardPath($staff),
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        $request->user('staff')->currentAccessToken()->delete();
        return ApiResponse::success(null, 'Logged out successfully');
    }

    public function me(Request $request)
    {
        $staff    = $request->user('staff');
        $branchId = $request->header('X-Branch-Id');

        return ApiResponse::success([
            'staff'          => new StaffResource($staff),
            'global_role'    => $staff->role,
            'current_role'   => $branchId ? $staff->getRoleInBranch($branchId) : null,
            'dashboard_path' => $this->getDashboardPath($staff),
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $staff = $request->user('staff');

        if (!Hash::check($request->current_password, $staff->password)) {
            return ApiResponse::error('Current password is incorrect', null, 422);
        }

        $staff->update(['password' => Hash::make($request->new_password)]);
        $staff->tokens()->delete();

        return ApiResponse::success(null, 'Password changed. Please login again.');
    }

    // =============================================
    // Google OAuth
    // =============================================

    /**
     * Step 1 — Frontend minta URL Google
     * Encode info tenant & frontend URL ke state parameter
     */
    public function redirectToGoogle(Request $request)
    {
        $state = base64_encode(json_encode([
            'tenant_host'  => $request->getHost(),
            'frontend_url' => $this->getFrontendUrl($request),
        ]));

        $url = Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirectUrl($this->getCallbackUrl())
            ->redirect()
            ->getTargetUrl();

        return ApiResponse::success(['url' => $url]);
    }

    /**
     * Step 2 — Google redirect balik ke sini (selalu URL yang sama)
     * Decode state untuk tahu dari tenant mana dan kemana redirect FE
     *
     * Route ini ada di central/auth domain:
     * Local:      gymbaru.localhost/api/tenant-auth/google/callback
     * Production: auth.gymbaru.com/api/tenant-auth/google/callback
     *
     * Karena callback di central domain, tenancy TIDAK aktif di sini.
     * Kita perlu initialize tenant manual dari state.
     */
    public function handleGoogleCallback(Request $request)
    {
        $state       = json_decode(base64_decode($request->get('state', '')), true) ?? [];
        $tenantHost  = $state['tenant_host']  ?? null;
        $frontendUrl = $state['frontend_url'] ?? env('FRONTEND_URL', 'http://localhost');

        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->redirectUrl($this->getCallbackUrl())
                ->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/tenant-auth/callback?error=google_failed");
        }

        // Initialize tenant dari host yang disimpan di state
        if ($tenantHost) {
            $tenant = \App\Models\Tenant::whereHas('domains', function ($q) use ($tenantHost) {
                $q->where('domain', $tenantHost);
            })->first();

            if (!$tenant) {
                return redirect("{$frontendUrl}/tenant-auth/callback?error=tenant_not_found");
            }

            tenancy()->initialize($tenant);
        }

        // Sekarang query staff dari tenant DB yang sudah diinisialisasi
        $staff = Staff::where('email', $googleUser->getEmail())->first();

        if (!$staff) {
            $staff = Staff::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => Hash::make(Str::random(32)),
                'role'              => 'staff',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
        }

        if (!$staff->is_active) {
            return redirect("{$frontendUrl}/tenant-auth/callback?error=inactive");
        }

        $staff->update([
            'last_login_at' => now(),
            'avatar'        => $googleUser->getAvatar() ?? $staff->avatar,
        ]);

        $staff->tokens()->delete();
        $token    = $staff->createToken('staff-token')->plainTextToken;
        $branches = $this->getBranchesForStaff($staff);

        $staffEncoded    = urlencode(json_encode(new StaffResource($staff)));
        $branchesEncoded = urlencode(json_encode($branches));
        $globalRole      = urlencode($staff->role);
        $dashboardPath   = urlencode($this->getDashboardPath($staff));

        // Redirect balik ke frontend tenant (bukan auth domain)
        return redirect(
            "{$frontendUrl}/tenant-auth/callback" .
            "?token={$token}" .
            "&staff={$staffEncoded}" .
            "&branches={$branchesEncoded}" .
            "&global_role={$globalRole}" .
            "&dashboard_path={$dashboardPath}"
        );
    }
}