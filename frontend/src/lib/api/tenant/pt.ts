import memberApiClient from "@/lib/member-api-client";
import tenantApiClient from "@/lib/tenant-api-client"; // Jika butuh untuk staff nanti
import { PtSessionPlanData, PtPackageData, PurchasePtPackageResponse } from "@/types/tenant/pt";

export const ptAPI = {
    // =============================================
    // MEMBER ENDPOINTS
    // =============================================

    /**
     * Ambil katalog paket PT yang tersedia untuk dibeli
     */
    memberGetPlans: async (): Promise<{ data: PtSessionPlanData[]; message: string }> => {
        const response = await memberApiClient.get("/member/pt-plans");
        return response.data;
    },

    /**
     * Member melihat daftar paket yang mereka miliki (aktif, pending, dll)
     */
    memberGetMyPackages: async (): Promise<{ data: PtPackageData[]; message: string }> => {
        const response = await memberApiClient.get("/member/my-pt-packages");
        return response.data;
    },

    /**
     * Member membeli paket PT (Checkout)
     */
    memberPurchasePackage: async (planId: string): Promise<PurchasePtPackageResponse> => {
        // Ambil dari localStorage (sesuaikan key-nya dengan aplikasi kamu)
        // Jika tidak ada active_branch, ambil dari home_branch milik user yang tersimpan di state
        const branchId = localStorage.getItem("active_branch_id") || localStorage.getItem("home_branch_id") || "";

        const response = await memberApiClient.post(
            "/member/pt-packages/purchase",
            { pt_session_plan_id: planId },
            {
                headers: {
                    "X-Branch-Id": branchId
                }
            }
        );
        return response.data;
    },

    // =============================================
    // STAFF ENDPOINTS (Draf untuk nanti)
    // =============================================
    // staffGetAllPackages: async () => { ... }
    // staffCreateSession: async () => { ... }
};