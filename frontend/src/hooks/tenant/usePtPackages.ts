import { useQuery } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";

export function usePtPackages(params?: any) {
    return useQuery({
        queryKey: ["pt-packages", "list", params],
        queryFn: async () => {
            const response = await tenantApiClient.get("pt-packages", { params });
            return response.data.data;
        },
        staleTime: 30_000,
    });
}