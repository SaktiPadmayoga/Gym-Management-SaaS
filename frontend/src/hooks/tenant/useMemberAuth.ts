// src/hooks/tenant/useMemberAuth.ts

import { useQuery } from "@tanstack/react-query";
import { memberAuthAPI } from "@/lib/api/tenant/memberAuth";

export const memberAuthKeys = {
    me: ["member", "auth", "me"] as const,
};

export function useMemberMe() {
    return useQuery({
        queryKey: memberAuthKeys.me,
        queryFn: () => memberAuthAPI.me(),
        refetchInterval: 10000, 
        placeholderData: (prev) => prev, 
    });
}