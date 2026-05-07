import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";

export function useTenantNotifications() {
    return useQuery({
        queryKey: ["tenant-notifications"],
        queryFn: async () => {
            const response = await tenantApiClient.get("/notifications");
            return response.data.data;
        },
        refetchInterval: 30000,
    });
}

export function useMarkTenantNotificationRead() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: string) => {
            await tenantApiClient.post(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-notifications"] });
        }
    });
}

export function useMarkAllTenantNotificationsRead() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async () => {
            await tenantApiClient.post(`/notifications/read-all`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-notifications"] });
        }
    });
}