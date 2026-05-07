// File: src/lib/api/role.ts
import tenantApiClient from "@/lib/tenant-api-client";
import { Role, RoleCreateRequest } from "@/types/tenant/roles";

export const rolesApi = {
    getRoles: async (): Promise<Role[]> => {
        const response = await tenantApiClient.get("/roles");
        return response.data?.data || [];
    },

    // 2. Get Single Role Detail
    getRoleById: async (id: string): Promise<Role | null> => {
        const response = await tenantApiClient.get(`/roles/${id}`);
        return response.data?.data || null;
    },

    // 3. Create Role
    createRole: async (payload: RoleCreateRequest): Promise<any> => {
        const response = await tenantApiClient.post("/roles", payload);
        return response.data;
    },

    // 4. Update Detail Role (Nama, Deskripsi, Status)
    updateRole: async (id: string, payload: Partial<RoleCreateRequest>): Promise<any> => {
        const response = await tenantApiClient.put(`/roles/${id}`, payload);
        return response.data;
    },

    // 5. Delete Role
    deleteRole: async (id: string): Promise<any> => {
        const response = await tenantApiClient.delete(`/roles/${id}`);
        return response.data;
    },

    // 6. Assign / Sync Permissions
    syncPermissions: async (id: string, permissions: string[]): Promise<any> => {
        const response = await tenantApiClient.put(`/roles/${id}/permissions`, { permissions });
        return response.data;
    }
};