import tenantApiClient from "@/lib/tenant-api-client";
import { MembershipPlanCreateRequest, MembershipPlanData, MembershipPlanUpdateRequest } from "@/types/tenant/membership-plans";

export const membershipPlansAPI = {
    getAll: async (params?: { page?: number; per_page?: number; search?: string; category?: string; is_active?: boolean; available_only?: boolean }): Promise<MembershipPlanData[]> => {
        const response = await tenantApiClient.get("/membership-plans", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.category && { category: params.category }),
                ...(params?.is_active !== undefined && { is_active: params.is_active }),
                ...(params?.available_only && { available_only: true }),
            },
        });
        return response?.data.data.data ?? [];
    },

    getById: async (id: string): Promise<MembershipPlanData> => {
        const response = await tenantApiClient.get(`/membership-plans/${id}`);
        return response?.data.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await tenantApiClient.get("/membership-plans/categories");
        return response?.data.data ?? [];
    },

    create: async (payload: MembershipPlanCreateRequest): Promise<MembershipPlanData> => {
        const response = await tenantApiClient.post("/membership-plans", payload);
        return response?.data.data;
    },

    update: async (id: string, payload: MembershipPlanUpdateRequest): Promise<MembershipPlanData> => {
        const response = await tenantApiClient.put(`/membership-plans/${id}`, payload);
        return response?.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/membership-plans/${id}`);
    },

    toggleActive: async (id: string): Promise<MembershipPlanData> => {
        const response = await tenantApiClient.patch(`/membership-plans/${id}/toggle-active`);
        return response?.data.data;
    },

    duplicate: async (id: string): Promise<MembershipPlanData> => {
        const response = await tenantApiClient.post(`/membership-plans/${id}/duplicate`);
        return response?.data.data;
    },

    // Class plan inclusions
    syncClassPlans: async (id: string, classPlansIds: string[]): Promise<MembershipPlanData> => {
        const response = await tenantApiClient.post(`/membership-plans/${id}/class-plans/sync`, {
            class_plan_ids: classPlansIds,
        });
        return response?.data.data;
    },

    detachClassPlan: async (id: string, classPlanId: string): Promise<void> => {
        await tenantApiClient.delete(`/membership-plans/${id}/class-plans/${classPlanId}`);
    },
};
