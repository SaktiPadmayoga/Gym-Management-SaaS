"use client";

import { Suspense } from "react";
import AdminResetForm from "@/components/pages/master/manage-tenant/auth/AdminResetForm";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AdminResetForm />
        </Suspense>
    );
}

