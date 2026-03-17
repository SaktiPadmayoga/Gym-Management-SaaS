import tenantApiClient from "@/lib/tenant-api-client";
import {
    AllBranchSettings,
    BranchSettingItem,
    UpdateSettingGroupPayload,
    UpdateSettingsBatchPayload,
} from "@/types/tenant/branch-settings";

export const branchSettingsAPI = {
    /**
     * Ambil semua setting branch, dikelompokkan per group
     * Optional: ?group=appearance
     */
    getAll: async (branchId: string, group?: string): Promise<AllBranchSettings> => {
        const response = await tenantApiClient.get(`/branches/${branchId}/settings`, {
            params: group ? { group } : {},
        });
        return response?.data.data;
    },

    /**
     * Ambil setting publik (logo, warna) — tanpa auth
     */
    getPublic: async (branchId: string): Promise<Record<string, any>> => {
        const response = await tenantApiClient.get(`/branches/${branchId}/settings/public`);
        return response?.data.data;
    },

    /**
     * Update banyak setting sekaligus (batch)
     */
    updateBatch: async (
        branchId: string,
        payload: UpdateSettingsBatchPayload
    ): Promise<BranchSettingItem[]> => {
        const response = await tenantApiClient.put(`/branches/${branchId}/settings`, payload);
        return response?.data.data;
    },

    /**
     * Update setting per group
     * Lebih simpel untuk form per tab
     */
    updateGroup: async (
        branchId: string,
        group: string,
        payload: UpdateSettingGroupPayload
    ): Promise<BranchSettingItem[]> => {
        const response = await tenantApiClient.put(
            `/branches/${branchId}/settings/${group}`,
            payload
        );
        return response?.data.data;
    },

    /**
     * Reset group ke default
     */
    resetGroup: async (branchId: string, group: string): Promise<void> => {
        await tenantApiClient.post(`/branches/${branchId}/settings/${group}/reset`);
    },
};