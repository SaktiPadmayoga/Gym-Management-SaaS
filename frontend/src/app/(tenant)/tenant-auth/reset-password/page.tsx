import { Suspense } from "react";
import StaffResetForm from "@/components/pages/auth/StaffResetForm";

export default function TenantResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center" />}>
            <StaffResetForm />
        </Suspense>
    );
}
