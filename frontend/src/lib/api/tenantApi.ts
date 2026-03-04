import axios from "axios";
import { TenantCurrentData } from "@/types/tenant/tenant";

const apiClient = axios.create({
    baseURL: typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "http://localhost/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
};

export default apiClient;