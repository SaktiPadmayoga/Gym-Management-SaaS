<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    /**
     * Master permission definitions: group => [action => display_name]
     */
    private function getPermissionDefinitions(): array
    {
        return [
            'pos'         => ['view' => 'View POS',              'manage' => 'Manage POS'],
            'members'     => ['view' => 'View Members',          'manage' => 'Manage Members'],
            'check_ins'   => ['view' => 'View Check-ins',        'manage' => 'Manage Check-ins'],
            'bookings'    => ['view' => 'View Bookings',         'manage' => 'Manage Bookings'],
            'pt_sessions' => ['view' => 'View PT Sessions',      'manage' => 'Manage PT Sessions'],
            'schedules'   => ['view' => 'View Schedules',        'manage' => 'Manage Schedules'],
            'staff'       => ['view' => 'View Staff',            'manage' => 'Manage Staff'],
            'reports'     => ['view' => 'View Reports'],
            'settings'    => ['view' => 'View Settings',         'manage' => 'Manage Settings'],
            'memberships' => ['view' => 'View Memberships',      'manage' => 'Manage Memberships'],
            'master_data' => ['view' => 'View Master Data',      'manage' => 'Manage Master Data'],
        ];
    }

    public function up(): void
    {
        // 1. Create master permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('group');              // "members", "pos", etc.
            $table->string('name')->unique();     // "members.view", "members.manage"
            $table->string('display_name');       // "View Members"
            $table->string('action');             // "view" or "manage"
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('group');
            $table->index('action');
        });

        // 2. Seed master permissions
        $sortOrder = 0;
        $permissionMap = []; // name => id, for data migration later

        foreach ($this->getPermissionDefinitions() as $group => $actions) {
            foreach ($actions as $action => $displayName) {
                $id = Str::uuid()->toString();
                $name = "{$group}.{$action}";
                $permissionMap[$name] = $id;

                DB::table('permissions')->insert([
                    'id'           => $id,
                    'group'        => $group,
                    'name'         => $name,
                    'display_name' => $displayName,
                    'action'       => $action,
                    'sort_order'   => $sortOrder++,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }

        // 3. Add permission_id column to role_permissions (nullable first for migration)
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->uuid('permission_id')->nullable()->after('role_id');
        });

        // 4. Migrate existing data: flat "members" → "members.view" + "members.manage"
        $existingPermissions = DB::table('role_permissions')->get();

        foreach ($existingPermissions as $rp) {
            $group = $rp->permission; // e.g. "members"

            // Map the old coarse permission to the view permission
            $viewName = "{$group}.view";
            if (isset($permissionMap[$viewName])) {
                DB::table('role_permissions')
                    ->where('id', $rp->id)
                    ->update(['permission_id' => $permissionMap[$viewName]]);
            }

            // Also grant manage permission for the same group (backward compat: old perms had full access)
            $manageName = "{$group}.manage";
            if (isset($permissionMap[$manageName])) {
                DB::table('role_permissions')->insert([
                    'id'            => Str::uuid()->toString(),
                    'role_id'       => $rp->role_id,
                    'permission'    => $rp->permission, // keep old column for now
                    'permission_id' => $permissionMap[$manageName],
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }

        // 5. Remove rows that couldn't be mapped (orphan permissions not in our list)
        DB::table('role_permissions')->whereNull('permission_id')->delete();

        // 6. Drop old column, set FK, update constraints
        Schema::table('role_permissions', function (Blueprint $table) {
            // Drop old unique constraint and column
            $table->dropUnique(['role_id', 'permission']);
            $table->dropIndex(['permission']);
            $table->dropColumn('permission');
        });

        Schema::table('role_permissions', function (Blueprint $table) {
            // Set permission_id NOT NULL + FK
            $table->uuid('permission_id')->nullable(false)->change();
            $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete();
            $table->unique(['role_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        // Reverse: add back old column, drop permission_id, drop permissions table
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropUnique(['role_id', 'permission_id']);
            $table->dropForeign(['permission_id']);
            $table->string('permission')->default('');
        });

        // Migrate back: permission_id → group name
        $rolePermissions = DB::table('role_permissions')
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->select('role_permissions.id', 'permissions.group')
            ->get();

        foreach ($rolePermissions as $rp) {
            DB::table('role_permissions')
                ->where('id', $rp->id)
                ->update(['permission' => $rp->group]);
        }

        // Remove duplicates (since we expanded 1 → 2)
        DB::statement('
            DELETE rp1 FROM role_permissions rp1
            INNER JOIN role_permissions rp2
            ON rp1.role_id = rp2.role_id AND rp1.permission = rp2.permission AND rp1.id > rp2.id
        ');

        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropColumn('permission_id');
            $table->unique(['role_id', 'permission']);
            $table->index('permission');
        });

        Schema::dropIfExists('permissions');
    }
};
