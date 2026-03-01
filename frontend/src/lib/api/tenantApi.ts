// lib/api/tenantApi.ts

import axios from "axios";

const apiClient = axios.create({
    baseURL: typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export const tenantAPI = {
    getCurrent: async () => {
        try {
            const res = await apiClient.get("/tenant/current");

            // Validasi response
            if (!res.data) {
                throw new Error("No data in response");
            }

            // Handle berbagai format response
            if (res.data.success && res.data.data) {
                return res.data.data; // Format: { success: true, data: {...} }
            } else if (res.data.data) {
                return res.data.data; // Format: { data: {...} }
            } else {
                return res.data; // Format langsung
            }
        } catch (error) {
            console.error("Error fetching tenant:", error);
            throw error;
        }
    },
};
