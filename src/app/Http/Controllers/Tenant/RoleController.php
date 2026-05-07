<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function index()
    {
        try {
            $roles = DB::table('roles')->orderBy('created_at', 'desc')->get();
            
            $permissions = DB::table('role_permissions')->get()->groupBy('role_id');

            $data = $roles->map(function ($role) use ($permissions) {
                return [
                    'id'           => $role->id,
                    'name'         => $role->name,
                    'display_name' => $role->display_name,
                    'description'  => $role->description,
                    'is_active'    => (bool) $role->is_active,
                    // Pluck hanya nama permission-nya saja jadi array flat: ['pos', 'members']
                    'permissions'  => isset($permissions[$role->id]) 
                                        ? $permissions[$role->id]->pluck('permission')->toArray() 
                                        : []
                ];
            });

            return ApiResponse::success($data, 'Data roles berhasil dimuat');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal memuat data roles: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Simpan role baru beserta permissions-nya
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|unique:roles,name', // ex: branch_manager
            'display_name' => 'required|string',                   // ex: Branch Manager
            'description'  => 'nullable|string',
            'permissions'  => 'required|array',
            'permissions.*'=> 'string' // ex: 'pos', 'members', dll
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            $roleId = Str::uuid()->toString();

            // 1. Insert ke tabel roles
            DB::table('roles')->insert([
                'id'           => $roleId,
                'name'         => $request->name,
                'display_name' => $request->display_name,
                'description'  => $request->description,
                'is_active'    => true,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // 2. Insert ke tabel role_permissions
            $permissionsData = [];
            foreach ($request->permissions as $permission) {
                $permissionsData[] = [
                    'id'         => Str::uuid()->toString(),
                    'role_id'    => $roleId,
                    'permission' => $permission,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($permissionsData)) {
                DB::table('role_permissions')->insert($permissionsData);
            }

            DB::commit();

            return ApiResponse::success(['id' => $roleId], 'Role dan permissions berhasil dibuat', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal membuat role: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Lihat detail satu role
     */
    public function show($id)
    {
        $role = DB::table('roles')->where('id', $id)->first();

        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        $permissions = DB::table('role_permissions')
            ->where('role_id', $id)
            ->pluck('permission')
            ->toArray();

        $data = [
            'id'           => $role->id,
            'name'         => $role->name,
            'display_name' => $role->display_name,
            'description'  => $role->description,
            'is_active'    => (bool) $role->is_active,
            'permissions'  => $permissions
        ];

        return ApiResponse::success($data, 'Detail role berhasil dimuat');
    }

    /**
     * Update role dan sinkronisasi (sync) ulang permissions-nya
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|unique:roles,name,' . $id,
            'display_name' => 'required|string',
            'description'  => 'nullable|string',
            'is_active'    => 'boolean',
            'permissions'  => 'required|array',
            'permissions.*'=> 'string'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        $role = DB::table('roles')->where('id', $id)->first();
        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        // Proteksi tambahan: Jangan biarkan Owner diotak-atik!
        if ($role->name === 'owner') {
            return ApiResponse::error('Role Owner tidak dapat diubah!', null, 403);
        }

        try {
            DB::beginTransaction();

            // 1. Update tabel roles
            DB::table('roles')->where('id', $id)->update([
                'name'         => $request->name,
                'display_name' => $request->display_name,
                'description'  => $request->description,
                'is_active'    => $request->has('is_active') ? $request->is_active : $role->is_active,
                'updated_at'   => now(),
            ]);

            // 2. "Sync" tabel role_permissions (Hapus yang lama, masukkan yang baru)
            DB::table('role_permissions')->where('role_id', $id)->delete();

            $permissionsData = [];
            foreach ($request->permissions as $permission) {
                $permissionsData[] = [
                    'id'         => Str::uuid()->toString(),
                    'role_id'    => $id,
                    'permission' => $permission,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($permissionsData)) {
                DB::table('role_permissions')->insert($permissionsData);
            }

            DB::commit();

            return ApiResponse::success(null, 'Role berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal memperbarui role: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Hapus role
     */
    public function destroy($id)
    {
        $role = DB::table('roles')->where('id', $id)->first();
        
        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        // Proteksi owner
        if ($role->name === 'owner') {
            return ApiResponse::error('Role Owner tidak dapat dihapus!', null, 403);
        }

        try {
            DB::table('roles')->where('id', $id)->delete();

            return ApiResponse::success(null, 'Role berhasil dihapus');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal menghapus role: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Assign atau Sync permissions ke sebuah role
     * Endpoint: PUT /roles/{id}/permissions
     */
    public function syncPermissions(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'permissions'   => 'required|array',
            'permissions.*' => 'string'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        $role = DB::table('roles')->where('id', $id)->first();
        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        // Proteksi mutlak: Owner punya kuasa penuh, tidak boleh diotak-atik
        if ($role->name === 'owner') {
            return ApiResponse::error('Permission untuk Role Owner tidak dapat diubah!', null, 403);
        }

        try {
            DB::beginTransaction();

            // 1. Bersihkan semua permission lama untuk role ini
            DB::table('role_permissions')->where('role_id', $id)->delete();

            // 2. Siapkan data permission baru
            $permissionsData = [];
            foreach ($request->permissions as $permission) {
                $permissionsData[] = [
                    'id'         => Str::uuid()->toString(),
                    'role_id'    => $id,
                    'permission' => $permission,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($permissionsData)) {
                DB::table('role_permissions')->insert($permissionsData);
            }

            DB::commit();

            return ApiResponse::success(null, 'Permissions berhasil di-assign ke role');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal assign permissions: ' . $e->getMessage(), null, 500);
        }
    }
}