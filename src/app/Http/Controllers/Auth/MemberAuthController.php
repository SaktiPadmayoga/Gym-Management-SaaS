<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\MemberResource;
use App\Models\Tenant\Member;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class MemberAuthController extends Controller
{
    // =============================================
    // Helpers
    // =============================================

    /**
     * Callback URL KHUSUS untuk Member.
     * Pastikan ini didaftarkan di Google Cloud Console.
     * Local:      http://gymbaru.localhost/api/tenant-auth/member/google/callback
     */
    private function getCallbackUrl(): string
    {
        $url = env('GOOGLE_MEMBER_REDIRECT_URL');

        if (!$url) {
            throw new \RuntimeException('GOOGLE_MEMBER_REDIRECT_URL is not set in .env');
        }

        return $url;
    }

    private function getFrontendUrl(Request $request): string
    {
        $scheme       = $request->getScheme();
        $host         = $request->getHost();
        $frontendPort = env('FRONTEND_PORT');
        $isLocal      = str_contains($host, 'localhost');

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

        $member = Member::where('email', $request->email)->first();

        if (!$member || !Hash::check($request->password, $member->password)) {
            return ApiResponse::error('Invalid email or password', null, 401);
        }

        if (!$member->is_active) {
            return ApiResponse::error('Your account has been deactivated. Please contact gym staff.', null, 403);
        }

        // Hapus token lama & update waktu login
        $member->tokens()->delete();
        $member->update(['last_login_at' => now()]);

        // Berikan scope/ability khusus member agar tidak bisa tembus API Staff
        $token = $member->createToken('member-token', ['role:member'])->plainTextToken;

        return ApiResponse::success([
            'token'  => $token,
            'member' => new MemberResource($member->load(['activeMembership.branch', 'activeMembership.plan'])),
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ApiResponse::success(null, 'Logged out successfully');
    }

    public function me(Request $request)
    {
        $member = $request->user()->load(['activeMembership.homeBranch', 'activeMembership.plan']);
        return ApiResponse::success(new MemberResource($member));
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $member = $request->user();

        if (!Hash::check($request->current_password, $member->password)) {
            return ApiResponse::error('Current password is incorrect', null, 422);
        }

        $member->update(['password' => Hash::make($request->new_password)]);
        $member->tokens()->delete();

        return ApiResponse::success(null, 'Password changed. Please login again.');
    }

    // =============================================
    // Google OAuth
    // =============================================

    public function redirectToGoogle(Request $request)
    {
        // Menyimpan konteks tenant & aplikasi frontend ke dalam state
        $state = base64_encode(json_encode([
            'tenant_host'  => $request->getHost(),
            'frontend_url' => $this->getFrontendUrl($request),
            'user_type'    => 'member' // Opsional untuk verifikasi ekstra
        ]));

        $url = Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirectUrl($this->getCallbackUrl())
            ->redirect()
            ->getTargetUrl();

        return ApiResponse::success(['url' => $url]);
    }

    public function handleGoogleCallback(Request $request)
    {
        $state       = json_decode(base64_decode($request->get('state', '')), true) ?? [];
        $tenantHost  = $state['tenant_host']  ?? null;
        // Arahkan fallback ke halaman login member jika gagal
        $frontendUrl = $state['frontend_url'] ?? env('FRONTEND_URL', 'http://localhost') . '/member/login';

        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->redirectUrl($this->getCallbackUrl())
                ->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/tenant-auth/member/callback?error=google_failed");
        }

        // 1. Inisialisasi Database Tenant
        if ($tenantHost) {
            $tenant = \App\Models\Tenant::whereHas('domains', function ($q) use ($tenantHost) {
                $q->where('domain', $tenantHost);
            })->first();

            if (!$tenant) {
                return redirect("{$frontendUrl}/tenant-auth/member/callback?error=tenant_not_found");
            }

            tenancy()->initialize($tenant);
        }

        // 2. Query atau Auto-Register Member di Database Tenant
        $member = Member::where('email', $googleUser->getEmail())->first();

        if (!$member) {
            // Jika akun baru via Google, buatkan data.
            // is_active = true (bisa login app), status = inactive (karena belum beli paket)
            $member = Member::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => Hash::make(Str::random(32)), 
                'status'            => 'inactive',
                'is_active'         => true,
                'member_since'      => now()->toDateString(),
            ]);
        }

        if (!$member->is_active) {
            return redirect("{$frontendUrl}/tenant-auth/member/callback?error=account_banned");
        }

        // Update avatar jika ada perubahan di Google
        $member->update([
            'last_login_at' => now(),
            'avatar'        => $googleUser->getAvatar() ?? $member->avatar,
        ]);

        // 3. Generate Sanctum Token khusus Member
        $member->tokens()->delete();
        $token = $member->createToken('member-token', ['role:member'])->plainTextToken;

        // 4. Siapkan Data untuk URL Redirect
        $member->load(['homeBranch', 'activeMembership.plan']);
        $memberEncoded = urlencode(json_encode(new MemberResource($member)));

        // 5. Redirect ke Frontend Member dengan Token
        // Ganti path sesuai routing Svelte kamu untuk aplikasi member
        return redirect(
            "{$frontendUrl}/tenant-auth/member/callback" .
            "?token={$token}" .
            "&member={$memberEncoded}"
        );
    }
}