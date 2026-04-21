import { CartItem, Customer } from "@/types/tenant/pos";

export interface POSCheckoutPayload {
    branch_id:       string;
    member_id?:      string;
    guest_name?:     string;
    guest_phone?:    string;
    guest_email?:    string;
    created_by:      string;
    items:           Array<{ type: string; id: string; quantity: number }>;
    payment_method:  string;
    amount_paid:     number;
    discount_amount: number;
    notes?:          string;
}

export interface POSCheckoutResponse {
    success:        boolean;
    message:        string;
    data: {
        invoice_number: string;
        total_amount:   number;
        status:         string;
        items:          Array<{ name: string; quantity: number; unit_price: number; total_price: number }>;
        paid_at:        string;
    };
}

// Map CartItem[] → BE payload items
export function mapCartToPayload(items: CartItem[]): POSCheckoutPayload["items"] {
    return items.map((item) => ({
        type:     item.type,
        id:       item.data.id,
        quantity: item.quantity,
    }));
}

export async function posCheckout(payload: POSCheckoutPayload): Promise<POSCheckoutResponse> {
    const res = await fetch("/api/pos/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Checkout failed");
    }

    return res.json();
}