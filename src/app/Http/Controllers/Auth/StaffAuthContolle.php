<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\StaffResource;
use App\Models\Branch;
use App\Models\Staff;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class StaffAuthController extends Controller
{
    // =============================================
    // Helpers
    // =============================================

    /**
     * Ambil daftar branch yang bisa diakses staff
     * Owner → semua branch aktif
     * Staff → hanya branch yang di-assign & aktif
     */
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
                'role'        => $sb->role, // branch_manager | trainer | receptionist | cashier
            ])
            ->toArray();
    }

    /**
     * Tentukan redirect path berdasarkan role global staff
     * owner → /owner/dashboard
     * staff → /dashboard
     */
    private function getDashboardPath(Staff $staff): string
    {
        return $staff->isOwner() ? '/owner/dashboard' : '/dashboard';
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

        // Cari staff di tabel 'staffs' (tenant DB)
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
            'global_role'    => $staff->role,        // 'owner' | 'staff'
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

    public function redirectToGoogle()
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return ApiResponse::success(['url' => $url]);
    }

    public function handleGoogleCallback(Request $request)
    {

        $frontendUrl = 'http://' . $request->getHost(); // ambil dari subdomain request

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/auth/callback?error=google_failed");
        }

        $staff = Staff::where('email', $googleUser->getEmail())->first();

        if (!$staff) {
            // Auto-register — default role 'staff', owner harus diset manual oleh super admin
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
            return redirect("{$frontendUrl}/auth/callback?error=inactive");
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

        return redirect(
            "{$frontendUrl}/auth/callback" .
            "?token={$token}" .
            "&staff={$staffEncoded}" .
            "&branches={$branchesEncoded}" .
            "&global_role={$globalRole}" .
            "&dashboard_path={$dashboardPath}"
        );
    }
}