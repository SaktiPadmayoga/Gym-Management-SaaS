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

        // Member & admin routes punya cookie khusus
        if (preg_match('#^/api/member(/|$)#', $path)) {
            $cookieName = 'member_token';
            $token = $request->cookie($cookieName);
        } elseif (preg_match('#^/api/admin(/|$)#', $path)) {
            $cookieName = 'admin_token';
            $token = $request->cookie($cookieName);
        } else {
            // Staff & owner route: coba owner_token dulu, fallback ke staff_token.
            // Ini memungkinkan owner & staff login bersamaan di tab berbeda
            // karena masing-masing punya cookie terpisah.
            $ownerToken = $request->cookie('owner_token');
            $staffToken = $request->cookie('staff_token');
            $token      = $ownerToken ?? $staffToken;
            $cookieName = $ownerToken ? 'owner_token' : 'staff_token';
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