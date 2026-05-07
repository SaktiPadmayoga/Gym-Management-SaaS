"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import QueryProvider from "@/providers/QueryProvider";
import { MemberAuthProvider } from "@/providers/MemberAuthProvider";

const memberPublicWithoutAuthPaths = [
    "/member/register",
    "/member/registration-success",
];

export default function MemberLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isPublicWithoutAuth = memberPublicWithoutAuthPaths.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    return (
        <QueryProvider>
            {isPublicWithoutAuth ? children : <MemberAuthProvider>{children}</MemberAuthProvider>}   
        </QueryProvider>
    );
}
