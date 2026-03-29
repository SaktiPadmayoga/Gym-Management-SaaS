"use client";

import { ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";
import MemberLayoutWrapper from "@/components/layout/MemberLayoutWrapper";

export default function MemberLayout({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <MemberLayoutWrapper>{children}</MemberLayoutWrapper>
        </QueryProvider>
    );
}
