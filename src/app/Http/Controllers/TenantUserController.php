<?php

namespace App\Http\Controllers;

use App\Models\TenantUser;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\TenantUserResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class TenantUserController extends Controller
{
    public function index()
    {
        $users = TenantUser::paginate(10);

        return ApiResponse::success(
            TenantUserResource::collection($users),
            'List tenant users',
            ApiResponse::paginated(
                $users->total(),
                $users->perPage(),
                $users->currentPage(),
                $users->lastPage()
            )
        );
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid|exists:tenants,id',
            'name' => 'required|string|max:150',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'role' => 'required|in:owner,admin,finance,support',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation error', $validator->errors(), 422);
        }

        $user = TenantUser::create([
            'tenant_id' => $request->tenant_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);

        return ApiResponse::success(
            new TenantUserResource($user),
            'Tenant user created',
            null,
            201
        );
    }

    public function show($id)
    {
        $user = TenantUser::find($id);

        if (!$user) {
            return ApiResponse::error('Tenant user not found', null, 404);
        }

        return ApiResponse::success(
            new TenantUserResource($user),
            'Tenant user detail'
        );
    }

    public function update(Request $request, $id)
    {
        $user = TenantUser::find($id);

        if (!$user) {
            return ApiResponse::error('Tenant user not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:150',
            'email' => 'sometimes|email',
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|in:owner,admin,finance,support',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation error', $validator->errors(), 422);
        }

        $data = $request->only([
            'name',
            'email',
            'role',
            'is_active',
        ]);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return ApiResponse::success(
            new TenantUserResource($user),
            'Tenant user updated'
        );
    }

    public function destroy($id)
    {
        $user = TenantUser::find($id);

        if (!$user) {
            return ApiResponse::error('Tenant user not found', null, 404);
        }

        $user->delete();

        return ApiResponse::success(null, 'Tenant user deleted');
    }
}