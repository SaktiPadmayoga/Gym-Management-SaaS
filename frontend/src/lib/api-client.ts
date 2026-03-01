// lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www") {
        config.headers["X-Tenant"] = parts[0];
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      console.log("➡️ PARAMS:", config.params);
      console.log("➡️ DATA:", config.data); // ✅ INI YANG PENTING
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Response Body:`, response.data);
    }

    if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
      throw new Error("API returned HTML instead of JSON");
    }

    // ⚠️ return body langsung
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }

    console.error("[API Error]:", error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;
