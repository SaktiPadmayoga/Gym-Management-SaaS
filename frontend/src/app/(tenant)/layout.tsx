"use client";

import { ReactNode } from "react";
import { StaffAuthProvider } from "@/providers/StaffAuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import { useTenant } from "@/hooks/useTenant";

export default function TenantLayout({ children }: { children: ReactNode }) {
    const { tenant, isLoading } = useTenant();

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aksen-secondary" />
            </div>
        );

    if (!tenant) return <div className="p-4 text-red-600">Access Denied — please access from a tenant subdomain</div>;

    return (
        <QueryProvider>
            <StaffAuthProvider>{children}</StaffAuthProvider>
        </QueryProvider>
    );
}
