import { useMutation, useQueryClient } from "@tanstack/react-query";
import tenantApiClient from "@/lib/tenant-api-client";
import { CartItem } from "@/types/tenant/pos";

export interface POSCheckoutPayload {
    branch_id:       string;
    member_id?:      string | null;
    guest_name?:     string;
    guest_phone?:    string;
    guest_email?:    string;
    created_by:      string; // ID Staff Kasir
    items:           Array<{ type: string; id: string; quantity: number }>;
    payment_method:  string;
    amount_paid:     number;
    discount_amount: number;
    notes?:          string;
}

export function mapCartToPayload(items: CartItem[]): POSCheckoutPayload["items"] {
    return items.map((item) => ({
        type:     item.type,
        id:       item.data.id,
        quantity: item.quantity,
    }));
}

export function usePOSCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: POSCheckoutPayload) => {
            const response = await tenantApiClient.post("/pos/checkout", payload);
            return response.data.data;
        },
        onSuccess: () => {
            // Refresh data produk karena stoknya pasti berkurang
            queryClient.invalidateQueries({ queryKey: ["products"] });
            // Refresh data member (jika membership baru aktif)
            queryClient.invalidateQueries({ queryKey: ["members"] });
        }
    });
}