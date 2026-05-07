// File: src/hooks/tenant/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/tenant/roles";
import { RoleCreateRequest } from "@/types/tenant/roles";

// 1. Hook: Get All Roles (dengan Client-side Search filter)
export function useRoles(params?: { search?: string }) {
    return useQuery({
        queryKey: ["roles", params],
        queryFn: async () => {
            let data = await rolesApi.getRoles();
            
            if (params?.search) {
                const keyword = params.search.toLowerCase();
                data = data.filter(role => 
                    role.display_name.toLowerCase().includes(keyword) || 
                    role.name.toLowerCase().includes(keyword)
                );
            }
            return data;
        },
    });
}

// 2. Hook: Get Single Detail Role
export function useRole(id: string) {
    return useQuery({
        queryKey: ["roles", id],
        queryFn: () => rolesApi.getRoleById(id),
        enabled: !!id, // Hanya jalan jika ID-nya ada (bukan string kosong)
    });
}

// 3. Hook: Create Role
export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RoleCreateRequest) => rolesApi.createRole(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

// 4. Hook: Update Role Detail
export function useUpdateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<RoleCreateRequest> }) => 
            rolesApi.updateRole(id, payload),
        onSuccess: (_, variables) => {
            // Update cache list dan cache detail spesifik
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
        },
    });
}

// 5. Hook: Delete Role
export function useDeleteRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => rolesApi.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

// 6. Hook: Assign/Sync Role Permissions 🔥 (Sesuai Permintaan)
export function useSyncRolePermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) => 
            rolesApi.syncPermissions(id, permissions),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
        },
    });
}