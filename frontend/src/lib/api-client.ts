// lib/api-client.ts
// Khusus untuk admin/central routes — tidak perlu X-Tenant header
import axios, { AxiosInstance, AxiosError } from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        if (process.env.NODE_ENV === "development") {
            console.log(`[Admin API] ${config.method?.toUpperCase()} ${config.url}`);
            if (config.data) console.log("➡️ DATA:", config.data);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        if (
            typeof response.data === "string" &&
            response.data.includes("<!DOCTYPE html>")
        ) {
            throw new Error("API returned HTML instead of JSON");
        }
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                const path = window.location.pathname;
                if (!path.includes('/auth/login') && !path.includes('/auth/forgot-password') && !path.includes('/auth/reset-password')) {
                    window.location.href = "/auth/login";
                }
            }
        }
        console.error("[Admin API Error]:", error.response?.data);
        return Promise.reject(error);
    },
);

export default apiClient;