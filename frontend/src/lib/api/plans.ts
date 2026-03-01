// lib/api/plans.ts

import apiClient from "@/lib/api-client";
import { PlansData } from "@/types/central/plans";

export const plansAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string }): Promise<PlansData[]> => {
        try {
            const response = await apiClient.get("/plans", {params});
            console.log("API Response:", response);
            return response?.data.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }

    },

    getById: async (id: string): Promise<PlansData> => {
        const response = await apiClient.get(`/plans/${id}`);
        return response?.data.data;
    },

    create: async (payload: Partial<PlansData>): Promise<PlansData> => {
        const response = await apiClient.post("/plans", payload);
        return response?.data.data.data;
    },

    update: async (id: string, payload: Partial<PlansData>): Promise<PlansData> => {
        const response = await apiClient.put(`/plans/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/plans/${id}`);
    },
};
