import { useMutation } from "@tanstack/react-query";
import { authAPI, RegisterPaidPayload, RegisterTrialPayload } from "../lib/api/register"; // Sesuaikan path dengan lokasi file di atas

export function useRegisterPaid() {
    return useMutation({
        mutationFn: (payload: RegisterPaidPayload) => authAPI.registerPaid(payload),
        onError: (error) => {
            // Error logging secara global jika diperlukan
            console.error("Failed to register and create payment token:", error);
        },
    });
}

export function useRegisterTrial() {
    return useMutation({
        mutationFn: (payload: RegisterTrialPayload) => authAPI.registerTrial(payload),
    });
}