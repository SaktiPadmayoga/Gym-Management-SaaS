// hooks/useCentralNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useCentralNotifications = (enabled = true) => {
    return useQuery({
        queryKey: ["central-notifications"],
        queryFn: async () => {
            const response = await apiClient.get("/central/notifications");
            return response.data.data;
        },
        enabled, // hanya fetch jika enabled = true (user sudah login)
        refetchInterval: enabled ? 30000 : false, // hanya polling jika enabled
        retry: false, // jangan retry saat 401
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => await apiClient.post(`/central/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["central-notifications"] }),
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => await apiClient.post("/central/notifications/mark-all-read"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["central-notifications"] }),
    });
};
