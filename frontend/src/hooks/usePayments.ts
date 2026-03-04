import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsAPI, CreateTokenPayload, PaymentsParams } from "../lib/api/payments";



export function useCreatePaymentToken() {
    return useMutation({
        mutationFn: (payload: CreateTokenPayload) => paymentsAPI.createToken(payload),
        onError: (error) => {
            console.error("Payment token error:", error);
        },
    });
}
export const paymentKeys = {
    all: ["payments"] as const,
    list: (params: PaymentsParams) => [...paymentKeys.all, "list", params] as const,
    detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
};

export function usePayments(params: PaymentsParams) {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: () => paymentsAPI.getAll(params),
        staleTime: 30_000,
    });
}

export function usePayment(id: string) {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => paymentsAPI.getOne(id),
        enabled: !!id,
        staleTime: 30_000,
    });
}
