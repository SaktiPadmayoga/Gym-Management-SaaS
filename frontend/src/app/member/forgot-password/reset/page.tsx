import { Suspense } from "react";
import MemberResetForm from "@/components/pages/member/auth/MemberResetForm";

export default function MemberResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center" />}>
            <MemberResetForm />
        </Suspense>
    );
}
