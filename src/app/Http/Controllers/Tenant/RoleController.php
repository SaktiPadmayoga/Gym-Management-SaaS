<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\Permission;
use App\Models\Tenant\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RoleController extends Controller
{

    public function index()
    {
        try {
            $roles = Role::with('permissions')->orderBy('created_at', 'desc')->get();

            $data = $roles->map(function ($role) {
                return [
                    'id'           => $role->id,
                    'name'         => $role->name,
                    'display_name' => $role->display_name,
                    'description'  => $role->description,
                    'is_active'    => (bool) $role->is_active,
                    'permissions'  => $role->permissionList(),
                    'permission_ids' => $role->permissionIds(),
                ];
            });

            return ApiResponse::success($data, 'Data roles berhasil dimuat');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal memuat data roles: ' . $e->getMessage(), null, 500);
        }
    }


    public function show($id)
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        $data = [
            'id'             => $role->id,
            'name'           => $role->name,
            'display_name'   => $role->display_name,
            'description'    => $role->description,
            'is_active'      => (bool) $role->is_active,
            'permissions'    => $role->permissionList(),
            'permission_ids' => $role->permissionIds(),
        ];

        return ApiResponse::success($data, 'Detail role berhasil dimuat');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|unique:roles,name',
            'display_name'   => 'required|string',
            'description'    => 'nullable|string',
            'permission_ids' => 'sometimes|array',
            'permission_ids.*' => 'uuid|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            $role = Role::create([
                'name'         => $request->name,
                'display_name' => $request->display_name,
                'description'  => $request->description,
                'is_active'    => true,
            ]);

            if ($request->has('permission_ids')) {
                $role->permissions()->sync($request->permission_ids);
            }

            DB::commit();

            return ApiResponse::success([
                'id' => $role->id,
            ], 'Role berhasil dibuat', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal membuat role: ' . $e->getMessage(), null, 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|unique:roles,name,' . $id,
            'display_name'   => 'required|string',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
            'permission_ids' => 'sometimes|array',
            'permission_ids.*' => 'uuid|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        $role = Role::find($id);
        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        if ($role->name === 'owner') {
            return ApiResponse::error('Role Owner tidak dapat diubah!', null, 403);
        }

        try {
            DB::beginTransaction();

            $role->update([
                'name'         => $request->name,
                'display_name' => $request->display_name,
                'description'  => $request->description,
                'is_active'    => $request->has('is_active') ? $request->is_active : $role->is_active,
            ]);

            if ($request->has('permission_ids')) {
                $role->permissions()->sync($request->permission_ids);
            }

            DB::commit();

            return ApiResponse::success(null, 'Role berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal memperbarui role: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * DELETE /roles/{id}
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        if ($role->name === 'owner') {
            return ApiResponse::error('Role Owner tidak dapat dihapus!', null, 403);
        }

        try {
            $role->delete();
            return ApiResponse::success(null, 'Role berhasil dihapus');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal menghapus role: ' . $e->getMessage(), null, 500);
        }
    }

    public function syncPermissions(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'uuid|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        $role = Role::find($id);
        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        if ($role->name === 'owner') {
            return ApiResponse::error('Permission untuk Role Owner tidak dapat diubah!', null, 403);
        }

        try {
            $role->permissions()->sync($request->permission_ids);
            return ApiResponse::success(null, 'Permissions berhasil di-assign ke role');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal assign permissions: ' . $e->getMessage(), null, 500);
        }
    }

    public function updateAccessLevel(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'group' => 'required|string',
            'level' => 'required|in:none,view,manage',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        $role = Role::find($id);
        if (!$role) {
            return ApiResponse::error('Role tidak ditemukan', null, 404);
        }

        if ($role->name === 'owner') {
            return ApiResponse::error('Permission untuk Role Owner tidak dapat diubah!', null, 403);
        }

        $group = $request->group;
        $level = $request->level;

        $groupPermissions = Permission::where('group', $group)->get();
        if ($groupPermissions->isEmpty()) {
            return ApiResponse::error("Group '{$group}' tidak ditemukan", null, 404);
        }

        $viewPerm   = $groupPermissions->firstWhere('action', 'view');
        $managePerm = $groupPermissions->firstWhere('action', 'manage');

        try {
            $groupPermissionIds = $groupPermissions->pluck('id')->toArray();
            $role->permissions()->detach($groupPermissionIds);

            if ($level === 'view' && $viewPerm) {
                $role->permissions()->attach($viewPerm->id);
            } elseif ($level === 'manage') {
                $attachIds = [];
                if ($viewPerm) $attachIds[] = $viewPerm->id;
                if ($managePerm) $attachIds[] = $managePerm->id;
                $role->permissions()->attach($attachIds);
            }
 
            $role->load('permissions');

            return ApiResponse::success([
                'permissions'    => $role->permissionList(),
                'permission_ids' => $role->permissionIds(),
            ], 'Access level berhasil diperbarui');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal memperbarui access level: ' . $e->getMessage(), null, 500);
        }
    }

    public function availablePermissions()
    {
        try {
            $permissions = Permission::orderBy('sort_order')->get();
            $groupLabels = Permission::groupLabels();

            $grouped = $permissions->groupBy('group')->map(function ($perms, $group) use ($groupLabels) {
                $viewPerm = $perms->firstWhere('action', 'view');
                $dynamicLabel = $viewPerm ? str_replace('Lihat ', '', $viewPerm->display_name) : ucfirst($group);

                return [
                    'group'       => $group,
                    'label'       => $groupLabels[$group] ?? $dynamicLabel,
                    'permissions' => $perms->map(fn($p) => [
                        'id'           => $p->id,
                        'name'         => $p->name,
                        'display_name' => $p->display_name,
                        'action'       => $p->action,
                    ])->values(),
                ];
            })->values();

            return ApiResponse::success($grouped, 'Permissions berhasil dimuat');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal memuat permissions: ' . $e->getMessage(), null, 500);
        }
    }

    public function storePermission(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'group'       => ['required', 'string', 'regex:/^[a-z0-9_]+$/'],
            'label'       => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ], [
            'group.regex' => 'Kode modul harus berupa huruf kecil, angka, atau underscore saja (slug).'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validasi gagal', $validator->errors(), 422);
        }

        $group = $request->group;
        $label = $request->label;
        $description = $request->description;

        $exists = Permission::where('group', $group)->exists();
        if ($exists) {
            return ApiResponse::error("Kode modul '{$group}' sudah digunakan", null, 422);
        }

        try {
            DB::beginTransaction();

            $maxSort = Permission::max('sort_order') ?? 0;
            $nextSort = $maxSort + 1;

            $viewId = (string) Str::uuid();
            Permission::create([
                'id'           => $viewId,
                'group'        => $group,
                'name'         => "{$group}.view",
                'display_name' => "Lihat {$label}",
                'action'       => 'view',
                'description'  => $description ? "Izin melihat {$description}" : "Izin melihat modul {$label}",
                'sort_order'   => $nextSort,
            ]);

            $manageId = (string) Str::uuid();
            Permission::create([
                'id'           => $manageId,
                'group'        => $group,
                'name'         => "{$group}.manage",
                'display_name' => "Kelola {$label}",
                'action'       => 'manage',
                'description'  => $description ? "Izin mengelola {$description}" : "Izin mengelola modul {$label}",
                'sort_order'   => $nextSort + 1,
            ]);

            DB::commit();

            return ApiResponse::success([
                'group' => $group,
                'label' => $label,
            ], 'Modul izin akses baru berhasil dibuat', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal membuat modul izin akses: ' . $e->getMessage(), null, 500);
        }
    }
}