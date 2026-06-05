import axios, { AxiosInstance, AxiosError } from "axios";

function getTenantSlug(): string | null {
    if (typeof window === "undefined") return null;
    const parts = window.location.hostname.split(".");
    if (parts.length > 1 && !["www", "admin"].includes(parts[0])) {
        return parts[0];
    }
    return null;
}

export function getCurrentBranchId(): string | null {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("staff_selected_branch");
    if (!stored) return null;
    try {
        return JSON.parse(stored)?.id ?? null;
    } catch { return null; }
}

const tenantApiClient: AxiosInstance = axios.create({
    baseURL: typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // ← kirim cookie otomatis
});

tenantApiClient.interceptors.request.use(
    (config) => {
        // Tidak perlu inject Authorization header — cookie otomatis dikirim browser

        const tenantSlug = getTenantSlug();
        if (tenantSlug) config.headers["X-Tenant"] = tenantSlug;

        const branchId = getCurrentBranchId();
        if (branchId) config.headers["X-Branch-Id"] = branchId;

        // Tentukan role berdasarkan path halaman aktif di browser (owner vs staff)
        if (typeof window !== "undefined") {
            const isOwnerPath = window.location.pathname.startsWith("/owner");
            config.headers["X-Auth-Role"] = isOwnerPath ? "owner" : "staff";
        }

        if (process.env.NODE_ENV === "development") {
            console.log(`[Tenant API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => Promise.reject(error),
);

tenantApiClient.interceptors.response.use(
    (response) => {
        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
            throw new Error("API returned HTML instead of JSON");
        }
        return response;
    },
    (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config;

        if (status === 401) {
            if (originalRequest?.url?.includes('/login')) {
                return Promise.reject(error);
            }
            if (typeof window !== "undefined") {
                const path = window.location.pathname;
                // Jangan redirect kalau sudah di halaman login atau reset password
                const isAuthPage = path.includes('/tenant-auth/login') 
                    || path.includes('/tenant-auth/forgot-password') 
                    || path.includes('/tenant-auth/reset-password')
                    || path.includes('/member/login');
                    
                if (!isAuthPage) {
                    window.location.href = path.startsWith('/member')
                        ? '/member/login'
                        : '/tenant-auth/login';
                }
            }
        }

        console.error("[Tenant API Error]:", error.response?.data);
        return Promise.reject(error);
    },
);

export default tenantApiClient;