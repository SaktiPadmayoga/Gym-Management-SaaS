import { Suspense } from "react";
import StaffForgotForm from "@/components/pages/auth/StaffForgotForm";

export default function TenantForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center" />}>
            <StaffForgotForm />
        </Suspense>
    );
}
