// File: src/hooks/tenant/useRoles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/tenant/roles";
import { RoleCreateRequest, AccessLevel, Role } from "@/types/tenant/roles";

// ─── Roles ────────────────────────────────────────────────────────────────────

/** Get all roles (with optional client-side search filter). */
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

/** Get single role detail. */
export function useRole(id: string) {
    return useQuery({
        queryKey: ["roles", id],
        queryFn: () => rolesApi.getRoleById(id),
        enabled: !!id,
    });
}

/** Create role. */
export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RoleCreateRequest) => rolesApi.createRole(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

/** Update role detail. */
export function useUpdateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<RoleCreateRequest> }) =>
            rolesApi.updateRole(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
        },
    });
}

/** Delete role. */
export function useDeleteRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => rolesApi.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

/** Sync all permissions for a role (full replace). */
export function useSyncRolePermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
            rolesApi.syncPermissions(id, permissionIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
        },
    });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

/** Fetch master permission list (grouped). Cached aggressively since it rarely changes. */
export function usePermissions() {
    return useQuery({
        queryKey: ["permissions"],
        queryFn: () => rolesApi.getPermissions(),
        staleTime: 1000 * 60 * 30, // 30 minutes — master data rarely changes
    });
}

/** Create dynamic permission group. */
export function useCreatePermission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { group: string; label: string; description?: string }) =>
            rolesApi.createPermission(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
    });
}

/**
 * Update access level for a specific resource group.
 * Optimistic update: immediately update the role in cache, rollback on error.
 */
export function useUpdateAccessLevel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, group, level }: { roleId: string; group: string; level: AccessLevel }) =>
            rolesApi.updateAccessLevel(roleId, group, level),

        onMutate: async ({ roleId, group, level }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["roles"] });

            // Snapshot previous value
            const previousRoles = queryClient.getQueryData<Role[]>(["roles", undefined]);

            // Optimistic update in cache
            queryClient.setQueriesData<Role[]>(
                { queryKey: ["roles"] },
                (old) => {
                    if (!old) return old;
                    return old.map(role => {
                        if (role.id !== roleId) return role;

                        // Remove all permissions from this group
                        const otherPerms = role.permissions.filter(p => !p.startsWith(group + '.'));

                        // Add based on level
                        const newPerms = [...otherPerms];
                        if (level === 'view') {
                            newPerms.push(`${group}.view`);
                        } else if (level === 'manage') {
                            newPerms.push(`${group}.view`, `${group}.manage`);
                        }
                        // 'none' → nothing added

                        return { ...role, permissions: newPerms };
                    });
                }
            );

            return { previousRoles };
        },

        onError: (_err, _vars, context) => {
            // Rollback on error
            if (context?.previousRoles) {
                queryClient.setQueryData(["roles", undefined], context.previousRoles);
            }
        },

        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}