<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Http\Resources\AdminResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $admins = Admin::query()
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->paginate($request->per_page ?? 10);

        return ApiResponse::success(
            AdminResource::collection($admins),
            'Admins fetched successfully',
            ApiResponse::paginated(
                $admins->total(),
                $admins->perPage(),
                $admins->currentPage(),
                $admins->lastPage()
            )
        );
    }

    public function store(StoreAdminRequest $request)
    {
        $admin = Admin::create([
            ...$request->validated(),
            'password' => Hash::make($request->password),
        ]);

        return ApiResponse::success(new AdminResource($admin), 'Admin created', null, 201);
    }

    public function show($id)
    {
    $admin = Admin::find($id);

        return ApiResponse::success(new AdminResource($admin), 'Admin detail');
    }

    public function update(UpdateAdminRequest $request, $id)
    {
        $admin = Admin::find($id);
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $admin->update($data);

        return ApiResponse::success(new AdminResource($admin), 'Admin updated');
    }

    public function destroy($id)
    {
        $admin = Admin::find($id);
        $admin->delete();
        return ApiResponse::success(null, 'Admin deleted');
    }
}