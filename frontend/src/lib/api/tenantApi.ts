import axios from "axios";
import { TenantCurrentData } from "@/types/tenant/tenant";

const apiClient = axios.create({
    baseURL: typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "https://gymfit.id/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Inject X-Branch-Id dari localStorage jika ada
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const branchId = localStorage.getItem("current_branch_id");
        if (branchId) {
            config.headers["X-Branch-Id"] = branchId;
        }
    }
    return config;
});

export const tenantAPI = {
    getCurrent: async (): Promise<TenantCurrentData> => {
        const res = await apiClient.get("/tenant/current");
        if (res.data?.success && res.data?.data) return res.data.data;
        if (res.data?.data) return res.data.data;
        return res.data;
    },

    uploadLogo: async (file: File): Promise<{ logo_url: string; path: string }> => {
        const formData = new FormData();
        formData.append("logo", file);
        const res = await apiClient.post("/tenant/logo", formData, {
            headers: { 
                "Content-Type": "multipart/form-data",
                "X-Requested-With": "XMLHttpRequest"
            },
        });
        return res.data.data;
    },

    updateSettings: async (payload: { name: string }): Promise<{ name: string }> => {
        const res = await apiClient.put("/tenant/settings", payload);
        return res.data.data;
    },

    updateLandingPageSettings: async (payload: any): Promise<any> => {
        const res = await apiClient.put("/tenant/settings/landing-page", payload);
        return res.data.data;
    },
};

export default apiClient;