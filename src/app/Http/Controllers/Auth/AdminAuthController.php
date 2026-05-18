<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminResource;
use App\Models\Admin;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\CookieService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminResetPasswordMail;

class AdminAuthController extends Controller
{
    /**
     * Login admin
     */
    

    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return ApiResponse::error('Invalid email or password', null, 401);
        }

        if (!$admin->is_active) {
            return ApiResponse::error('Your account has been deactivated', null, 403);
        }

        $admin->tokens()->delete();
        $admin->update(['last_login_at' => now()]);

        $token = $admin->createToken('admin-token')->plainTextToken;

        return ApiResponse::success([
            'admin' => new AdminResource($admin),
            // token TIDAK di body
        ], 'Login successful')->withCookie(CookieService::makeAdminCookie($token));
    }

    public function logout(Request $request)
    {
        $request->user('admin')->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logged out successfully')
            ->withCookie(CookieService::clearAdminCookie());
    }

    /**
     * Get current authenticated admin
     */
    public function me(Request $request)
    {
        return ApiResponse::success(new AdminResource($request->user('admin')));
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin = $request->user('admin');

        if (!Hash::check($request->current_password, $admin->password)) {
            return ApiResponse::error('Current password is incorrect', null, 422);
        }

        $admin->update(['password' => Hash::make($request->new_password)]);

        // Revoke semua token — paksa login ulang
        $admin->tokens()->delete();

        return ApiResponse::success(null, 'Password changed successfully. Please login again.');
    }

    /**
     * Send password reset email
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin) {
            // Kita return success untuk security reasons agar tidak memberitahu apakah email terdaftar atau tidak
            return ApiResponse::success(null, 'Jika email terdaftar, link reset kata sandi telah dikirim.');
        }

        $token = Str::random(60);

        DB::connection('central')->table('admin_password_reset_tokens')->updateOrInsert(
            ['email' => $admin->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        Mail::to($admin->email)->send(new AdminResetPasswordMail($token, $admin->email));

        return ApiResponse::success(null, 'Jika email terdaftar, link reset kata sandi telah dikirim.');
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $resetToken = DB::connection('central')->table('admin_password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetToken) {
            return ApiResponse::error('Token tidak valid atau sudah kedaluwarsa.', null, 422);
        }

        // Cek kedaluwarsa (1 jam)
        if (now()->diffInMinutes($resetToken->created_at) > 60) {
            DB::connection('central')->table('admin_password_reset_tokens')->where('email', $request->email)->delete();
            return ApiResponse::error('Token sudah kedaluwarsa. Silakan minta link reset baru.', null, 422);
        }

        if (!Hash::check($request->token, $resetToken->token)) {
            return ApiResponse::error('Token tidak valid.', null, 422);
        }

        $admin = Admin::where('email', $request->email)->first();
        if (!$admin) {
            return ApiResponse::error('Admin tidak ditemukan.', null, 404);
        }

        $admin->update(['password' => Hash::make($request->password)]);

        // Hapus semua token login & reset token
        $admin->tokens()->delete();
        DB::connection('central')->table('admin_password_reset_tokens')->where('email', $request->email)->delete();

        return ApiResponse::success(null, 'Kata sandi berhasil direset. Silakan login kembali.');
    }
}