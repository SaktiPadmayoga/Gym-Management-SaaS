// src/hooks/tenant/useMemberAuth.ts

import { useQuery } from "@tanstack/react-query";
import { memberAuthAPI } from "@/lib/api/tenant/memberAuth";

export const memberAuthKeys = {
    me: ["member", "auth", "me"] as const,
};

// INI DIA SI useMemberMe YANG DICARI
export function useMemberMe() {
    return useQuery({
        queryKey: memberAuthKeys.me,
        queryFn: () => memberAuthAPI.me(),
        // Auto-polling memanggil API /me setiap 10 detik
        refetchInterval: 10000, 
        // Biarkan data lama tetap tampil di layar saat fetching di background
        placeholderData: (prev) => prev, 
    });
}