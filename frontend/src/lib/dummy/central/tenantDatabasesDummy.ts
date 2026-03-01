import { TenantDatabasesData } from "@/types/tenant/tenant-users";

export const DUMMY_TENANT_DATABASES: TenantDatabasesData[] = [
    {
        id: "TDB-001",
        tenantId: "TENANT-001",

        dbName: "tenant_alpha_gym",
        dbHost: "10.0.0.11",
        dbPort: "3306",
        dbUsername: "alpha_user",
        dbPassword: "********",

        dbStatus: "provisioning",
        provisionedAt: undefined,
        lastMigratedAt: undefined,

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "TDB-002",
        tenantId: "TENANT-002",

        dbName: "tenant_beta_fitness",
        dbHost: "10.0.0.12",
        dbPort: "3306",
        dbUsername: "beta_user",
        dbPassword: "********",

        dbStatus: "active",
        provisionedAt: new Date("2025-12-15"),
        lastMigratedAt: new Date("2026-01-01"),

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "TDB-003",
        tenantId: "TENANT-003",

        dbName: "tenant_gamma_health",
        dbHost: "10.0.0.13",
        dbPort: "3306",
        dbUsername: "gamma_user",
        dbPassword: "********",

        dbStatus: "active",
        provisionedAt: new Date("2025-11-01"),
        lastMigratedAt: new Date("2025-12-20"),

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "TDB-004",
        tenantId: "TENANT-004",

        dbName: "tenant_omega_gym",
        dbHost: "10.0.0.14",
        dbPort: "3306",
        dbUsername: "omega_user",
        dbPassword: "********",

        dbStatus: "suspended",
        provisionedAt: new Date("2025-01-01"),
        lastMigratedAt: new Date("2025-12-01"),

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "TDB-005",
        tenantId: "TENANT-005",

        dbName: "tenant_old_archived",
        dbHost: "10.0.0.20",
        dbPort: "3306",
        dbUsername: "archived_user",
        dbPassword: "********",

        dbStatus: "archived",
        provisionedAt: new Date("2023-01-01"),
        lastMigratedAt: new Date("2024-01-01"),

        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
    },
];
