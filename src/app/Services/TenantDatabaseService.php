<!-- <?php
// app/Services/TenantDatabaseService.php

// namespace App\Services;

// use App\Models\Tenant;
// use App\Models\TenantDatabase;
// use Illuminate\Support\Facades\Artisan;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Str;

// class TenantDatabaseService
// {
//     /**
//      * Provision database baru untuk tenant
//      */
//     public function provision(Tenant $tenant): TenantDatabase
//     {
//         $dbName = 'gym_tenant_' . $tenant->id;
//         $dbPassword = Str::random(32);

//         // Create database di PostgreSQL
//         $this->createDatabase($dbName);

//         // Create database record
//         $tenantDb = TenantDatabase::create([
//             'id' => Str::uuid(),
//             'tenant_id' => $tenant->id,
//             'db_name' => $dbName,
//             'db_host' => env('DB_HOST'),
//             'db_port' => env('DB_PORT'),
//             'db_username' => env('DB_USERNAME'),
//             'db_password' => $dbPassword,
//             'db_status' => 'provisioning',
//             'provisioned_at' => now(),
//         ]);

//         // Update status to active
//         $tenantDb->update(['db_status' => 'active']);

//         return $tenantDb;
//     }

//     /**
//      * Create actual database di PostgreSQL
//      */
//     private function createDatabase(string $dbName): void
//     {
//         $connection = DB::connection('central');
        
//         // Disable foreign key checks temporarily
//         $connection->statement("CREATE DATABASE {$dbName}");
//     }

//     /**
//      * Run migrations untuk tenant database
//      */
//     public function migrate(Tenant $tenant): void
//     {
//         // Set tenant context
//         \Stancl\Tenancy\Tenancy::initialize($tenant);

//         // Run tenant migrations
//         Artisan::call('tenants:migrate', [
//             '--tenant' => $tenant->id,
//         ]);

//         // Seed initial data
//         Artisan::call('tenants:seed', [
//             '--tenant' => $tenant->id,
//             '--class' => 'Database\Seeders\Tenant\TenantDatabaseSeeder',
//         ]);
//     }
// }
?> -->