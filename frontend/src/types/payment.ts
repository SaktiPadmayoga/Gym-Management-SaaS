// File: src/types/payment.ts
export type PaymentMethod = "cash" | "card" | "digital_wallet" | "bank_transfer" | "mixed" | "midtrans";

export interface Payment {
    discountAmount: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes?: string;
}
