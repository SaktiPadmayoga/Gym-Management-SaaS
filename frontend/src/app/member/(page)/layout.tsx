"use client";

import { ReactNode } from "react";
import QueryProvider from "@/providers/QueryProvider";
import MemberLayoutWrapper from "@/components/layout/MemberLayoutWrapper";
import { MemberAuthProvider } from "@/providers/MemberAuthProvider";

export default function MemberLayout({ children }: { children: ReactNode }) {
    return (
        <MemberLayoutWrapper>{children}</MemberLayoutWrapper>
    );
}
