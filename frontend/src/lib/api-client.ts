// lib/api-client.ts
// Khusus untuk admin/central routes — tidak perlu X-Tenant header
import axios, { AxiosInstance, AxiosError } from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://gymfit.id/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
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
        // Jangan paksa redirect di sini — biarkan AdminAuthProvider & React Query yang handle.
        // Hard-redirect (window.location.href) menyebabkan infinite loop saat token expired
        // karena query tetap jalan sebelum /me selesai dipanggil.
        if (process.env.NODE_ENV === "development" && error.response?.status === 401) {
            console.warn("[Admin API] 401 Unauthorized:", error.config?.url);
        }
        return Promise.reject(error);
    },
);

export default apiClient;