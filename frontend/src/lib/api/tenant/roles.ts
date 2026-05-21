// File: src/lib/api/tenant/roles.ts
import tenantApiClient from "@/lib/tenant-api-client";
import { Role, RoleCreateRequest, PermissionGroup, AccessLevel } from "@/types/tenant/roles";

export const rolesApi = {
    // ─── Roles CRUD ────────────────────────────────────────────────────────

    getRoles: async (): Promise<Role[]> => {
        const response = await tenantApiClient.get("/roles");
        return response.data?.data || [];
    },

    getRoleById: async (id: string): Promise<Role | null> => {
        const response = await tenantApiClient.get(`/roles/${id}`);
        return response.data?.data || null;
    },

    createRole: async (payload: RoleCreateRequest): Promise<any> => {
        const response = await tenantApiClient.post("/roles", payload);
        return response.data;
    },

    updateRole: async (id: string, payload: Partial<RoleCreateRequest>): Promise<any> => {
        const response = await tenantApiClient.put(`/roles/${id}`, payload);
        return response.data;
    },

    deleteRole: async (id: string): Promise<any> => {
        const response = await tenantApiClient.delete(`/roles/${id}`);
        return response.data;
    },

    syncPermissions: async (id: string, permissionIds: string[]): Promise<any> => {
        const response = await tenantApiClient.put(`/roles/${id}/permissions`, { permission_ids: permissionIds });
        return response.data;
    },

    // ─── Permission Management ─────────────────────────────────────────────

    /**
     * Get all available permissions, grouped by resource.
     */
    getPermissions: async (): Promise<PermissionGroup[]> => {
        const response = await tenantApiClient.get("/permissions");
        return response.data?.data || [];
    },

    /**
     * Update access level for a specific resource group on a role.
     * level: "none" | "view" | "manage"
     */
    updateAccessLevel: async (roleId: string, group: string, level: AccessLevel): Promise<any> => {
        const response = await tenantApiClient.patch(`/roles/${roleId}/permissions/access`, {
            group,
            level,
        });
        return response.data;
    },
};