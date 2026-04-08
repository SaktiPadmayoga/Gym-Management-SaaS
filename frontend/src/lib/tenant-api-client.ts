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

        const status = error.response?.status;
        const originalRequest = error.config;

        if (status === 401) {
            // 1. CEK APAKAH INI ENDPOINT LOGIN
            // Jika request-nya adalah proses login, JANGAN redirect. 
            // Biarkan catch di LoginForm yang memunculkan toast error.
            if (originalRequest?.url?.includes('/login')) {
                return Promise.reject(error);
            }

            // 2. JIKA BUKAN LOGIN, BERARTI TOKEN EXPIRED. 
            // Tentukan arah redirect berdasarkan halaman saat ini.
            if (typeof window !== "undefined") {
                const currentPath = window.location.pathname;
                
                // Jika user sedang di area member, lempar ke login member
                if (currentPath.startsWith('/member')) {
                    localStorage.removeItem("member_token");
                    window.location.href = '/member/login'; // Sesuaikan dengan route login member Anda
                } else {
                    localStorage.removeItem("staff_token"); 
                    // Default: lempar ke login staff
                    window.location.href = '/tenant-auth/login';
                }
            }
        }

        console.error("[Tenant API Error]:", error.response?.data);
        return Promise.reject(error);
    },
);

export default tenantApiClient;
