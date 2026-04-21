import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ptAPI } from "@/lib/api/tenant/pt";

export const ptKeys = {
    all: ["pt"] as const,
    memberPlans: () => [...ptKeys.all, "member-plans"] as const,
    memberPackages: () => [...ptKeys.all, "member-packages"] as const,
};

// =============================================
// MEMBER QUERIES & MUTATIONS
// =============================================

export function usePtPlans() {
    return useQuery({
        queryKey: ptKeys.memberPlans(),
        queryFn: () => ptAPI.memberGetPlans(),
        staleTime: 60_000,
    });
}

export function useMyPtPackages() {
    return useQuery({
        queryKey: ptKeys.memberPackages(),
        queryFn: () => ptAPI.memberGetMyPackages(),
        staleTime: 30_000,
    });
}

export function usePurchasePtPackage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: string) => ptAPI.memberPurchasePackage(planId),
        onSuccess: () => {
            // Invalidate agar daftar paket saya langsung ter-update
            queryClient.invalidateQueries({ queryKey: ptKeys.memberPackages() });
        },
    });
}