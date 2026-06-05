import { Suspense } from "react";
import MemberForgotForm from "@/components/pages/member/auth/MemberForgotForm";

export default function MemberForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center" />}>
            <MemberForgotForm />
        </Suspense>
    );
}
