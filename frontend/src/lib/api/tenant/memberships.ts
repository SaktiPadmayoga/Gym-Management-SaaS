import tenantApiClient from "@/lib/tenant-api-client";
import { MembershipDetail } from "@/types/tenant/memberships";

export const membershipsAPI = {
    getActive: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        branch_id?: string;
        expiring_in_days?: number;
    }): Promise<{ data: MembershipDetail[]; meta: any }> => {
        const response = await tenantApiClient.get("/memberships/active", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.branch_id && { branch_id: params.branch_id }),
                ...(params?.expiring_in_days && { expiring_in_days: params.expiring_in_days }),
            },
        });
        return {
            data: response.data.data.data ?? [],
            meta: response.data.data.meta ?? null,
        };
    },

    getHistory: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: string;
        branch_id?: string;
        start_date?: string;
        end_date?: string;
    }): Promise<{ data: MembershipDetail[]; meta: any }> => {
        const response = await tenantApiClient.get("/memberships/history", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                search: params?.search || "",
                ...(params?.status && { status: params.status }),
                ...(params?.branch_id && { branch_id: params.branch_id }),
                ...(params?.start_date && { start_date: params.start_date }),
                ...(params?.end_date && { end_date: params.end_date }),
            },
        });
        return {
            data: response.data.data.data ?? [],
            meta: response.data.data.meta ?? null,
        };
    },
};