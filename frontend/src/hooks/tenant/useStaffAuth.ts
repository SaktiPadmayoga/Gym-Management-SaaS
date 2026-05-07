import { useQuery } from "@tanstack/react-query";
import { staffAuthAPI } from "@/lib/api/tenant/staffAuth";

export const staffAuthKeys = {
    me: ["staff", "auth", "me"] as const,
};

export function useStaffMe() {
    return useQuery({
        queryKey: staffAuthKeys.me,
        queryFn: () => staffAuthAPI.me(),
        refetchInterval: 10000,
        placeholderData: (prev) => prev,
    });
}