import { useStaffAuth } from "@/providers/StaffAuthProvider";

export function usePermission(permission: string): boolean {
    const { hasPermission } = useStaffAuth();
    return hasPermission(permission);
}

export function useAnyPermission(permissions: string[]): boolean {
    const { hasPermission } = useStaffAuth();
    return permissions.some((p) => hasPermission(p));
}