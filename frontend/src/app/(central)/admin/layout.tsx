"use client";

import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import { AdminAuthProvider, useAdminAuth } from "@/providers/AdminAuthProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { admin, isReady } = useAdminAuth();
    const router = useRouter();
 
    useEffect(() => {
        if (isReady && !admin) {
            router.replace("/auth/login");
        }
    }, [isReady, admin, router]);
 
    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aksen-secondary" />
            </div>
        );
    }
 
    if (!admin) return null;
 

    return (

        <QueryProvider>
            <Toaster />
            <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </QueryProvider>

    );
}