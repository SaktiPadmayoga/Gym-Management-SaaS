import axios, { AxiosInstance, AxiosError } from "axios";

function getTenantSlug(): string | null {
    if (typeof window === "undefined") return null;
    const parts = window.location.hostname.split(".");
    if (parts.length > 1 && !["www", "admin"].includes(parts[0])) {
        return parts[0];
    }
    return null;
}

const memberApiClient: AxiosInstance = axios.create({
    baseURL: typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // ← cookie otomatis
});

memberApiClient.interceptors.request.use(
    (config) => {
        const tenantSlug = getTenantSlug();
        if (tenantSlug) config.headers["X-Tenant"] = tenantSlug;

        if (process.env.NODE_ENV === "development") {
            console.log(`[Member API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => Promise.reject(error),
);

memberApiClient.interceptors.response.use(
    (response) => {
        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
            throw new Error("API returned HTML instead of JSON");
        }
        return response;
    },
    (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401 && !error.config?.url?.includes('/login')) {
            if (typeof window !== "undefined") {
                // Jangan redirect kalau sudah di login page
                if (!window.location.pathname.includes('/member/login')) {
                    window.location.href = '/member/login';
                }
            }
        }
        return Promise.reject(error); // ← tetap reject agar .catch() di provider jalan
    },
);

export default memberApiClient;