// frontend/hooks/useTenant.ts

"use client";

import { useEffect, useState } from "react";

export interface Tenant {
    id: string;
    name: string;
    domain: string;
}

export function useTenant(): { tenant: Tenant | null; isMaster: boolean; isLoading: boolean; isTenant: boolean } {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Get current host
        const host = window.location.hostname;
        const domain = host.split(":")[0]; // Remove port if exists

        // Check if master/admin domain
        const isMaster = domain === "localhost";

        if (isMaster) {
            setTenant(null);
            setIsLoading(false);
            return;
        }

        // Extract tenant from subdomain
        // gym_1.localhost → gym_1
        const subdomain = domain.split(".")[0];

        if (subdomain && subdomain !== "localhost" && !subdomain.match(/^\d+$/)) {
            // Valid tenant subdomain
            setTenant({
                id: subdomain,
                name: subdomain.replace(/_/g, " "),
                domain: domain,
            });
        }

        setIsLoading(false);
    }, []);

    return {
        tenant,
        isMaster: !tenant,
        isLoading,
        isTenant: !!tenant,
    };
}
