<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Menggunakan Eager Loading untuk performa jika data profil dibutuhkan
        $users = User::with(['memberProfile', 'staff'])->latest()->get();

        return response()->json([
            'message' => 'List users retrieved successfully',
            'data' => UserResource::collection($users)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => $request->boolean('isActive', true), // Default true jika tidak dikirim
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): JsonResponse
    {
        // Load relasi user detail (profile/staff)
        $user->load(['memberProfile', 'staff']);

        return response()->json([
            'message' => 'User detail retrieved successfully',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // Siapkan data update
        $dataToUpdate = [
            'email' => $request->email,
            'role' => $request->role,
            'is_active' => $request->boolean('isActive'),
        ];

        // Hanya update password jika field password diisi
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        $user->update($dataToUpdate);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        // Soft delete sesuai model
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}