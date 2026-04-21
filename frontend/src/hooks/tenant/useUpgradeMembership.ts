import { useMutation } from "@tanstack/react-query";
import memberApiClient from "@/lib/member-api-client"; // Gunakan axios client untuk member

export function useUpgradeMembership() {
    return useMutation({
        mutationFn: async (planId: string) => {
            const response = await memberApiClient.post("/memberships/upgrade", {
                membership_plan_id: planId
            });
            return response.data.data; // Harus return object berisi snap_token
        }
    });
}