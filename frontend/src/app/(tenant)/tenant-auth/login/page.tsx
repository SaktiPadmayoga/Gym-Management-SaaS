import { Suspense } from "react";
import StaffLogin from "@/components/pages/auth/StaffLogin";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center" />}>
            <StaffLogin />
        </Suspense>
    );
}
