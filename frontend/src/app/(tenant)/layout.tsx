// frontend/app/(tenant)/layout.tsx

"use client";

import { useTenant } from "@/hooks/useTenant";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";
import { BranchProvider } from "@/providers/BranchProvider";

export default function TenantLayout({ children }: { children: ReactNode }) {
    const { tenant, isLoading } = useTenant();

    if (isLoading) {
        return <div className="p-4">Loading tenant...</div>;
    }

    // Guard: Only accessible from tenant domain
    if (!tenant) {
        return (
            <div className="p-4 text-red-600">
                <h1>Access Denied</h1>
                <p>Please access from a tenant subdomain like gym_1.localhost</p>
            </div>
        );
    }

    // If valid tenant, wrap with layout
    return (
        <QueryProvider>
            <BranchProvider>
                        <LayoutWrapper>{children}</LayoutWrapper>
            </BranchProvider>    

        </QueryProvider>
    );
}
