// lib/member-api-client.ts
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

const memberApiClient: AxiosInstance = axios.create({
    baseURL: typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false,
});

memberApiClient.interceptors.request.use(
    (config) => {
        // ✅ Selalu inject member_token, bukan staff_token
        const token = localStorage.getItem("member_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const tenantSlug = getTenantSlug();
        if (tenantSlug) {
            config.headers["X-Tenant"] = tenantSlug;
        }

        if (process.env.NODE_ENV === "development") {
            console.log(`[Member API] ${config.method?.toUpperCase()} ${config.url}`, `(tenant: ${tenantSlug})`);
        }

        return config;
    },
    (error) => Promise.reject(error),
);

memberApiClient.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === "development") {
            console.log(`[Member API] Response:`, response.data);
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
            // Jika sedang login, biarkan error ditangani UI
            if (originalRequest?.url?.includes("/login")) {
                return Promise.reject(error);
            }

            // Token expired/invalid — bersihkan dan redirect ke login member
            if (typeof window !== "undefined") {
                localStorage.removeItem("member_token");
                localStorage.removeItem("member_data");
                document.cookie = "member_token=; path=/; max-age=0";
                window.location.href = "/member/login";
            }
        }

        console.error("[Member API Error]:", error.response?.data);
        return Promise.reject(error);
    },
);

export default memberApiClient;