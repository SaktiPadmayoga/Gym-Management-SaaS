"use client";

import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isMaster, isLoading, isTenant } = useTenant();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isTenant) {
            // ✅ Kalau diakses dari tenant subdomain, redirect ke owner
            router.replace("/admin/domains");
        }
    }, [isLoading, isTenant, router]);

    if (isLoading) return <div className="p-4">Loading...</div>;

    if (!isMaster) {
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
            <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </QueryProvider>
    );
}