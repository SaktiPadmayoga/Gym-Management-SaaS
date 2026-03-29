"use client";

import { ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";
import { AdminAuthProvider } from "@/providers/AdminAuthProvider";

export default function CentralLayout({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <AdminAuthProvider>{children}</AdminAuthProvider>
        </QueryProvider>
    );
}
