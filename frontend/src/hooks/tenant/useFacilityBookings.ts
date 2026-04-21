import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { facilityBookingsAPI } from "@/lib/api/tenant/facilityBookings";

export const facilityBookingKeys = {
    all: ["facility-bookings"] as const,
    lists: () => [...facilityBookingKeys.all, "list"] as const,
    list: (params?: any) => [...facilityBookingKeys.lists(), params] as const,
    details: () => [...facilityBookingKeys.all, "detail"] as const,
    detail: (id: string) => [...facilityBookingKeys.details(), id] as const,
};

export function useFacilityBookings(params?: any) {
    return useQuery({
        queryKey: facilityBookingKeys.list(params),
        queryFn: () => facilityBookingsAPI.getAll(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function useFacilityBooking(id?: string) {
    return useQuery({
        queryKey: facilityBookingKeys.detail(id as string),
        queryFn: () => facilityBookingsAPI.getById(id as string),
        enabled: !!id,
    });
}

export function useCreateFacilityBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => facilityBookingsAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilityBookingKeys.lists() });
        },
    });
}

export function useUpdateFacilityBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => facilityBookingsAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: facilityBookingKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: facilityBookingKeys.lists() });
        },
    });
}

export function useDeleteFacilityBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => facilityBookingsAPI.delete(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilityBookingKeys.lists() });
        },
    });
}