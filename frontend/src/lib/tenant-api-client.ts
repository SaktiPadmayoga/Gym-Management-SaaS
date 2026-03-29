// lib/tenant-api-client.ts
import axios, { AxiosInstance, AxiosError } from "axios";

function getTenantSlug(): string | null {
    if (typeof window === "undefined") return null;
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 1 && !["www", "admin"].includes(parts[0])) {
        return parts[0];
    }
    return null;
}

function getCurrentBranchId(): string | null {
    if (typeof window === "undefined") return null;

    // Key per tenant — sama dengan yang dipakai BranchProvider
    const slug = getTenantSlug();
    const storageKey = slug ? `current_branch_${slug}` : "current_branch";

    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    try {
        const branch = JSON.parse(stored);
        return branch?.id ?? null;
    } catch {
        return null;
    }
}

const tenantApiClient: AxiosInstance = axios.create({
    baseURL: typeof window !== "undefined" ? `${window.location.origin}/api` : process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false,
});

tenantApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("staff_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const tenantSlug = getTenantSlug();
        if (tenantSlug) {
            config.headers["X-Tenant"] = tenantSlug;
        }

        const branchId = getCurrentBranchId();
        if (branchId) {
            config.headers["X-Branch-Id"] = branchId;
        }

        if (process.env.NODE_ENV === "development") {
            console.log(`[Tenant API] ${config.method?.toUpperCase()} ${config.url}`, `(tenant: ${tenantSlug}, branch: ${branchId})`);
        }

        return config;
    },
    (error) => Promise.reject(error),
);

tenantApiClient.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === "development") {
            console.log(`[Tenant API] Response:`, response.data);
        }

        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
            throw new Error("API returned HTML instead of JSON");
        }

        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("staff_token");
                // hapus key lain jika perlu: staff_data, dll.
                window.location.href = "/tenant-auth/login"; // sesuaikan path login kamu
            }
        }

        console.error("[Tenant API Error]:", error.response?.data);
        return Promise.reject(error);
    },
);

export default tenantApiClient;
