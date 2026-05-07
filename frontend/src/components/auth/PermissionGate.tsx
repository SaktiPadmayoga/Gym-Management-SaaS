import { useStaffAuth } from "@/providers/StaffAuthProvider";

interface PermissionGateProps {
    permission: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
    const { hasPermission } = useStaffAuth();
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}