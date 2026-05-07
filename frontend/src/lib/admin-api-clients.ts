import axios, { AxiosInstance, AxiosError } from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // ← cookie otomatis
});

apiClient.interceptors.request.use(
    (config) => {
        if (process.env.NODE_ENV === "development") {
            console.log(`[Admin API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => {
        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
            throw new Error("API returned HTML instead of JSON");
        }
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                if (!window.location.pathname.includes('/auth/login')) {
                    window.location.href = "/auth/login";
                }
            }
        }
        console.error("[Admin API Error]:", error.response?.data);
        return Promise.reject(error);
    },
);

export default apiClient;