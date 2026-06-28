import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { PlansData } from "@/types/central/plans";

export const publicPlanKeys = {
    all: ["public-plans"] as const,
};

export function usePublicPlans() {
    return useQuery<PlansData[]>({
        queryKey: publicPlanKeys.all,
        queryFn: async () => {
            const response = await apiClient.get("/public-plans");
            return response?.data?.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });
}
