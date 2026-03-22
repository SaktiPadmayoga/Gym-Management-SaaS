// lib/api-client.ts
// API client untuk central/admin routes — tidak perlu X-Tenant header
import axios, { AxiosInstance, AxiosError } from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (process.env.NODE_ENV === "development") {
            console.log(`[Admin API] ${config.method?.toUpperCase()} ${config.url}`);
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
            // Token expired atau invalid — redirect ke login
            if (typeof window !== "undefined") {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_data");
                window.location.href = "/admin/login";
            }
        }
        console.error("[Admin API Error]:", error.response?.data);
        return Promise.reject(error);
    }
);

export default apiClient;