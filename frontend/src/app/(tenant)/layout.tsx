"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { StaffAuthProvider } from "@/providers/StaffAuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import { useTenant } from "@/hooks/useTenant";

const tenantAppPaths = [
    "/owner",
    "/dashboard",
    "/staff",
    "/members",
    "/products",
    "/membership-plan",
    "/class-plan",
    "/pt-sessions-plan",
    "/facilities",
    "/settings",
    "/tenant-auth",
    "/check-ins",
    "/memberships",
    "/class-schedules",
    "/pt-sessions",
    "/facility-bookings",
    "/pos",
    "/report",
    "/roles",
];

export default function TenantLayout({ children }: { children: ReactNode }) {
    const { isLoading } = useTenant();
    const pathname = usePathname();

    const isTenantAppRoute = tenantAppPaths.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );
    const isTenantPublicLanding =
        pathname === "/" || (!isTenantAppRoute && /^\/[^/]+\/?$/.test(pathname));

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aksen-secondary" />
            </div>
        );


    return (
        <QueryProvider>
            {isTenantPublicLanding ? children : <StaffAuthProvider>{children}</StaffAuthProvider>}
        </QueryProvider>
    );
}
