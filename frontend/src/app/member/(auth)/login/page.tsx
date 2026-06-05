import { Suspense } from "react";
import MemberLogin from "@/components/pages/member/auth/MemberLogin";

export default function MemberLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center" />}>
            <MemberLogin />
        </Suspense>
    );
}