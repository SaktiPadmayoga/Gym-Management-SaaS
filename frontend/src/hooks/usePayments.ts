import { useMutation } from "@tanstack/react-query";
import { paymentAPI, CreateTokenPayload } from "@/lib/api/payment";

export function useCreatePaymentToken() {
    return useMutation({
        mutationFn: (payload: CreateTokenPayload) => paymentAPI.createToken(payload),
        onError: (error) => {
            console.error("Payment token error:", error);
        },
    });
}
