// lib/tenant-api-client.ts
// API client untuk tenant-scoped routes
// Selalu request ke localhost/api tapi kirim X-Tenant header
// Backend InitializeTenancy middleware akan resolve tenant dari header ini
import axios, { AxiosInstance, AxiosError } from "axios";

function getTenantSlug(): string | null {
    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname; // gymbali.localhost
    const parts = hostname.split(".");

    if (parts.length > 1 && !["www", "admin"].includes(parts[0])) {
        return parts[0]; // "gymbali"
    }

    return null;
}

const tenantApiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Request interceptor - tambahkan X-Tenant header
tenantApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Kirim tenant slug via header
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers["X-Tenant"] = tenantSlug;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Tenant API] ${config.method?.toUpperCase()} ${config.url} (tenant: ${tenantSlug})`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
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
      window.location.href = "/login";
    }

    console.error("[Tenant API Error]:", error.response?.data);
    return Promise.reject(error);
  }
);

export default tenantApiClient;
