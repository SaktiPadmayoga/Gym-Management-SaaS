"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import MemberLayoutWrapper from "@/components/layout/MemberLayoutWrapper";
import { useMemberAuth } from "@/providers/MemberAuthProvider";

import { usePathname } from "next/navigation";

function MemberGuard({ children }: { children: ReactNode }) {
    const { member, isReady } = useMemberAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isReady) {
            if (!member) {
                router.replace("/member/login");
                return;
            }

            // Jika tidak ada membership aktif dan tidak sedang di halaman membership/profile, redirect ke membership upgrade
            const hasActiveMembership = !!member.active_membership;
            const allowedPages = ["/member/membership", "/member/profile"];
            if (!hasActiveMembership && !allowedPages.includes(pathname)) {
                router.replace("/member/membership");
            }
        }
    }, [isReady, member, pathname, router]);

    if (!isReady || !member) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    return <>{children}</>;
}

export default function MemberLayout({ children }: { children: ReactNode }) {
    return (
        <MemberGuard>
            <MemberLayoutWrapper>{children}</MemberLayoutWrapper>
        </MemberGuard>
    );
}

