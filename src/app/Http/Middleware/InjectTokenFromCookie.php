<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class InjectTokenFromCookie
{
    public function handle(Request $request, Closure $next): mixed
{
    Log::info('[InjectToken] bearer sebelum inject', [
        'has_bearer' => !empty($request->bearerToken()),
        'path'       => $request->getPathInfo(),
    ]);

    if (!$request->bearerToken()) {
        $token = $this->resolveTokenFromCookie($request);
        if ($token) {
            // CSRF Protection for Cookie Auth
            if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                if (!$request->hasHeader('X-Requested-With') || $request->header('X-Requested-With') !== 'XMLHttpRequest') {
                    // Allow external webhooks to bypass CSRF check
                    if (!$request->is('api/webhook/*') && !$request->is('api/payment/webhook')) {
                        return response()->json([
                            'success' => false,
                            'message' => 'CSRF token mismatch. Missing X-Requested-With header.'
                        ], 419);
                    }
                }
            }

            $request->headers->set('Authorization', "Bearer {$token}");
            Log::info('[InjectToken] berhasil inject Authorization header');
        } else {
            Log::warning('[InjectToken] token null, tidak inject');
        }
    }

    return $next($request);
}

    private function resolveTokenFromCookie(Request $request): ?string
    {
        $path = $request->getPathInfo();

        // Member routes → member_token
        if (preg_match('#^/api/member(/|$)#', $path)) {
            $cookieName = 'member_token';
            $token = $request->cookie($cookieName);
        }
        // Admin routes — mencakup SEMUA path yang digunakan admin SaaS:
        //   /api/admin/*          (auth, CRUD admins)
        //   /api/central/*        (dashboard, reports, notifications)
        //   /api/tenants*         (tenant CRUD)
        //   /api/plans*           (plan CRUD)
        //   /api/subscriptions*   (subscription management)
        //   /api/payments*        (payment management)
        //   /api/invoices*        (invoice management)
        //   /api/domains*         (domain management)
        //   /api/domain-requests* (domain request management)
        //   /api/tenant-users*    (tenant user management)
        elseif (preg_match('#^/api/(admin|central|tenants|plans|subscriptions|payments|invoices|domains|domain-requests|tenant-users)(/|$|\?)#', $path)) {
            $cookieName = 'admin_token';
            $token = $request->cookie($cookieName);

            // Fallback: jika admin_token tidak ada, coba owner/staff token
            // (beberapa route seperti /api/domains bisa diakses oleh admin DAN staff)
            if (!$token) {
                $ownerToken = $request->cookie('owner_token');
                $staffToken = $request->cookie('staff_token');
                $token = $ownerToken ?? $staffToken;
                $cookieName = $ownerToken ? 'owner_token' : ($staffToken ? 'staff_token' : 'admin_token');
            }
        } else {
            // Staff & owner route: coba sesuai header X-Auth-Role jika dikirim, fallback ke owner_token/staff_token.
            // Ini memungkinkan owner & staff login bersamaan di tab berbeda karena masing-masing punya cookie terpisah.
            $authRole = $request->header('X-Auth-Role');
            $ownerToken = $request->cookie('owner_token');
            $staffToken = $request->cookie('staff_token');

            if ($authRole === 'owner') {
                $token = $ownerToken;
                $cookieName = 'owner_token';
            } elseif ($authRole === 'staff') {
                $token = $staffToken;
                $cookieName = 'staff_token';
            } else {
                $token = $ownerToken ?? $staffToken;
                $cookieName = $ownerToken ? 'owner_token' : 'staff_token';
            }
        }

        Log::info('[Cookie Check]', [
            'path'        => $path,
            'cookie_name' => $cookieName,
            'all_cookies' => array_keys($request->cookies->all()),
        ]);

        Log::info('[Cookie Step 1] via request->cookie()', [
            'cookie_name' => $cookieName,
            'found'       => !empty($token),
            'prefix'      => $token ? substr($token, 0, 15) : null,
        ]);

        if ($token && str_starts_with($token, 'eyJpdiI')) {
            try {
                // Token is still encrypted, decrypt it manually
                $token = \Illuminate\Support\Facades\Crypt::decryptString($token);

                // Laravel's EncryptCookies middleware adds a CookieValuePrefix to the string before encrypting.
                // The prefix is hash_hmac('sha1', $cookieName, $key) . '|' which is exactly 41 characters.
                // We need to strip this prefix to get the actual Sanctum token.
                if (strpos($token, '|') === 40) {
                    $token = substr($token, 41);
                }

                Log::info('[Cookie Step 2] decrypt sukses', ['prefix' => substr($token, 0, 15)]);
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                Log::error('[Cookie Step 2] decrypt GAGAL', ['error' => $e->getMessage()]);
                return null;
            }
        }

        // Cek apakah Authorization header berhasil di-set
        Log::info('[Cookie] final token', ['prefix' => substr($token ?? '', 0, 15)]);
        return $token;
    }
}