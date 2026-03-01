"use client";

import { useTenant } from "@/hooks/useTenant";

export default function TenantDashboard() {
    const { tenant } = useTenant();

    return (
        <div className="text-black">
            <h1>Dashboard - {tenant?.name}</h1>
            <p>Welcome to {tenant?.id} tenant dashboard</p>
        </div>
    );
}
