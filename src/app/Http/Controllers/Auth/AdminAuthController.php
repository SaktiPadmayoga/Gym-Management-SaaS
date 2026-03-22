<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminResource;
use App\Models\Admin;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

        // Revoke semua token lama
        $admin->tokens()->delete();

        // Update last_login_at
        $admin->update(['last_login_at' => now()]);

        $token = $admin->createToken('admin-token')->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'admin' => new AdminResource($admin),
        ], 'Login successful');
    }

    /**
     * Logout admin
     */
    public function logout(Request $request)
    {
        $request->user('admin')->currentAccessToken()->delete();
        return ApiResponse::success(null, 'Logged out successfully');
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
}