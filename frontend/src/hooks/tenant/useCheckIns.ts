
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkInsAPI } from "@/lib/api/tenant/checkIns";
import { CheckInCreateRequest } from "@/types/tenant/checkIns";

export type CheckInsQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    branch_id?: string;
    date?: string;
};

/* =====================
 * QUERY KEYS
 * ===================== */
export const checkInKeys = {
    all: ["check-ins"] as const,
    lists: () => [...checkInKeys.all, "list"] as const,
    list: (params?: CheckInsQueryParams) => [
        ...checkInKeys.lists(), 
        params?.page ?? 1, 
        params?.per_page ?? 15, 
        params?.search ?? "", 
        params?.status ?? "",
        params?.branch_id ?? "",
        params?.date ?? ""
    ] as const,
};

/* =====================
 * QUERIES (GET)
 * ===================== */
export function useCheckIns(params?: CheckInsQueryParams) {
    return useQuery({
        queryKey: checkInKeys.list(params),
        queryFn: () => checkInsAPI.getAll(params),
        staleTime: 10_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * MUTATIONS (POST)
 * ===================== */
export function useCreateCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CheckInCreateRequest) => checkInsAPI.create(payload),
        onSuccess: () => {
            // Invalidate agar tabel riwayat check-in (jika ada di layar) otomatis ter-refresh
            queryClient.invalidateQueries({ queryKey: checkInKeys.lists() });
            
            // Opsional: Invalidate members query jika Anda ingin sisa kuota member di tabel lain ikut ter-update
            queryClient.invalidateQueries({ queryKey: ["members"] }); 
        },
    });
}