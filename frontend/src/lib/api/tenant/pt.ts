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

    /**
     * Member melihat daftar sesi PT individual dari paket yang dibeli
     */
    memberGetMySessions: async (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        date?: string;
    }): Promise<{ data: any[]; meta: any }> => {
        const response = await memberApiClient.get("/member/my-pt-sessions", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                ...(params?.status && { status: params.status }),
                ...(params?.date && { date: params.date }),
            },
        });
        
        let resultData = response.data.data?.data ?? [];
        if (!Array.isArray(resultData) && resultData?.data) {
            resultData = resultData.data;
        }

        return {
            data: Array.isArray(resultData) ? resultData : [],
            meta: response.data.data?.meta ?? null,
        };
    },

    // =============================================
    // MEMBER ENDPOINTS (REQUEST SESSION)
    // =============================================
    memberGetTrainers: async (): Promise<{ data: any[]; message: string }> => {
        const response = await memberApiClient.get("/member/trainers");
        return response.data;
    },

    memberGetTrainerBookedSlots: async (trainerId: string, date: string): Promise<{ data: { start_at: string, end_at: string }[]; message: string }> => {
        const response = await memberApiClient.get(`/member/trainers/${trainerId}/booked-slots`, {
            params: { date }
        });
        return response.data;
    },

    memberRequestSession: async (payload: {
        pt_package_id: string;
        trainer_id: string;
        date: string;
        start_at: string;
        end_at: string;
        notes?: string;
    }): Promise<{ data: any; message: string }> => {
        const response = await memberApiClient.post("/member/pt-sessions/request", payload);
        return response.data;
    },

    // =============================================
    // STAFF ENDPOINTS (Draf untuk nanti)
    // =============================================
    // staffGetAllPackages: async () => { ... }
    // staffCreateSession: async () => { ... }
};