"use client";

import { useTenant } from "@/hooks/useTenant";
import OwnerLayoutWrapper from "@/components/layout/OwnerLayoutWrapper";
import { ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import { BranchProvider } from "@/providers/BranchProvider";

export default function CentralLayout({ children }: { children: ReactNode }) {
    const { isMaster, isLoading, isTenant } = useTenant();

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    // Guard: Only for central/master domain
    if (!isTenant) {
        return (
            <div className="p-4 text-red-600">
                <h1>Admin Access Only</h1>
                <p>Please access from localhost</p>
            </div>
        );
    }

    return (
        <QueryProvider>
            <Toaster />
            <BranchProvider>
                <OwnerLayoutWrapper>{children}</OwnerLayoutWrapper>
            </BranchProvider>
        </QueryProvider>
    );
}
