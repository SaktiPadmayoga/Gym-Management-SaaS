<?php

declare(strict_types=1);

use Stancl\Tenancy\Database\Models\Domain;
use App\Models\Tenant;

return [
    'tenant_model' => Tenant::class,
    'id_generator' => Stancl\Tenancy\UUIDGenerator::class,

    'domain_model' => Domain::class,



    /**
     * The list of domains hosting your central app.
     * 
     * UPDATE: Add localhost & development domains
     */
    'central_domains' => [
        '127.0.0.1',
        'localhost',
        'localhost:80',
    ],

    /**
     * Tenancy bootstrappers are executed when tenancy is initialized.
     */
    'bootstrappers' => [
        Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper::class,
        Stancl\Tenancy\Bootstrappers\QueueTenancyBootstrapper::class,
        // Stancl\Tenancy\Bootstrappers\RedisTenancyBootstrapper::class, // Enable when using Redis
    ],

    'cache' => [
    'tag_base' => 'tenant',
],

    /**
     * Database tenancy config. Used by DatabaseTenancyBootstrapper.
     */
    'database' => [
        'central_connection' => env('DB_CONNECTION', 'pgsql'), // CHANGE: PostgreSQL as central

        /**
         * Connection used as a "template" for the dynamically created tenant database connection.
         */
        'template_tenant_connection' => 'pgsql', // CHANGE: PostgreSQL template

        /**
         * Tenant database names are created like this:
         * prefix + tenant_id + suffix.
         * 
         * Example: gym_tenant_gym1, gym_tenant_gym2
         */
        'prefix' => 'gym_tenant_',
        'suffix' => '',

        /**
         * TenantDatabaseManagers handle creation & deletion of tenant databases.
         */
        'managers' => [
            'sqlite' => Stancl\Tenancy\TenantDatabaseManagers\SQLiteDatabaseManager::class,
            'mysql' => Stancl\Tenancy\TenantDatabaseManagers\MySQLDatabaseManager::class,
            'pgsql' => Stancl\Tenancy\TenantDatabaseManagers\PostgreSQLDatabaseManager::class,
            // Uncomment to separate by schema instead of database (alternative approach)
            // 'pgsql' => Stancl\Tenancy\TenantDatabaseManagers\PostgreSQLSchemaManager::class,
        ],
    ],

    /**
     * Cache tenancy config. Used by CacheTenancyBootstrapper.
     * 
     * Each cache key will have a tenant tag applied to scope data per tenant.
     */
    'cache' => [
        'tag_base' => 'tenant',
    ],

    /**
     * Filesystem tenancy config. Used by FilesystemTenancyBootstrapper.
     * 
     * Each tenant gets isolated storage directories.
     * Example: storage/app/tenant_gym1/, storage/app/tenant_gym2/
     */
    'filesystem' => [
        'suffix_base' => 'tenant',
        'disks' => [
            'local',
            'public',
            // 's3', // Enable when using S3
        ],

        /**
         * Local disk roots are suffixed with tenant_id
         */
        'root_override' => [
            'local' => '%storage_path%/app/',
            'public' => '%storage_path%/app/public/',
        ],

        /**
         * Should storage_path() be suffixed per tenant.
         * 
         * Keep TRUE for local file storage per tenant.
         */
        'suffix_storage_path' => true,

        /**
         * Asset helper tenancy - makes asset() calls tenant-aware.
         * 
         * Keep TRUE so each tenant can have unique assets/images.
         */
        'asset_helper_tenancy' => true,
    ],

    /**
     * Redis tenancy config. Used by RedisTenancyBootstrapper.
     * 
     * Enable when using Redis for caching/sessions.
     */
    'redis' => [
        'prefix_base' => 'tenant',
        'prefixed_connections' => [
            // 'default', // Uncomment to enable Redis tenancy
        ],
    ],

    /**
     * Features provide additional functionality beyond core tenancy.
     */
    'features' => [
        // Stancl\Tenancy\Features\UserImpersonation::class,
        // Stancl\Tenancy\Features\TelescopeTags::class,
        // Stancl\Tenancy\Features\UniversalRoutes::class,
        // Stancl\Tenancy\Features\TenantConfig::class,
        // Stancl\Tenancy\Features\CrossDomainRedirect::class,
        // Stancl\Tenancy\Features\ViteBundler::class,
    ],

    /**
     * Should tenancy routes be registered.
     * 
     * Keep TRUE for automatic tenant asset routes.
     */
    'routes' => true,

    /**
     * Parameters used by the tenants:migrate command.
     * 
     * IMPORTANT: This path points to tenant-specific migrations.
     */
    'migration_parameters' => [
        '--force' => true,
        '--path' => [database_path('migrations/tenant')],
        '--realpath' => true,
    ],

    /**
     * Parameters used by the tenants:seed command.
     */
    'seeder_parameters' => [
        '--class' => 'DatabaseSeeder',
        // '--force' => true, // Enable in production
    ],
];