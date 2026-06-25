with open('app/Http/Middleware/InjectTokenFromCookie.php', 'r') as f:
    content = f.read()

old_code = """    public function handle(Request $request, Closure $next): mixed
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
}"""

new_code = """    public function handle(Request $request, Closure $next): mixed
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
}"""

content = content.replace(old_code, new_code)

with open('app/Http/Middleware/InjectTokenFromCookie.php', 'w') as f:
    f.write(content)

