import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ptAPI } from "@/lib/api/tenant/pt";

export const ptKeys = {
    all: ["pt"] as const,
    memberPlans: () => [...ptKeys.all, "member-plans"] as const,
    memberPackages: () => [...ptKeys.all, "member-packages"] as const,
    memberSessions: (params?: any) => [...ptKeys.all, "member-sessions", params] as const,
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

// =============================================
// MEMBER PT SESSIONS (Individual Sessions)
// =============================================

export function useMyPtSessions(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    date?: string;
}) {
    return useQuery({
        queryKey: ptKeys.memberSessions(params),
        queryFn: () => ptAPI.memberGetMySessions(params),
        staleTime: 30_000,
        placeholderData: (prev: any) => prev,
    });
}

export function usePtTrainers() {
    return useQuery({
        queryKey: [...ptKeys.all, "trainers"],
        queryFn: () => ptAPI.memberGetTrainers(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useTrainerBookedSlots(trainerId: string, date: string) {
    return useQuery({
        queryKey: [...ptKeys.all, "trainer-booked-slots", trainerId, date],
        queryFn: () => ptAPI.memberGetTrainerBookedSlots(trainerId, date),
        enabled: !!trainerId && !!date,
        staleTime: 0,
    });
}

export function useRequestPtSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            pt_package_id: string;
            trainer_id: string;
            date: string;
            start_at: string;
            end_at: string;
            notes?: string;
        }) => ptAPI.memberRequestSession(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ptKeys.memberSessions() });
            queryClient.invalidateQueries({ queryKey: ptKeys.memberPackages() });
        },
    });
}