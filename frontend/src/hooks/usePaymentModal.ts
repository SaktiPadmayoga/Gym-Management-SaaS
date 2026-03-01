// File: src/hooks/usePaymentModal.ts
"use client";

import { useState, useCallback } from "react";
import { Payment } from "@/types/payment";
import { POSSession } from "@/types/pos";

interface PaymentModalState {
    isOpen: boolean;
    loading: boolean;
}

export const usePaymentModal = () => {
    const [state, setState] = useState<PaymentModalState>({
        isOpen: false,
        loading: false,
    });

    const open = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: true }));
    }, []);

    const close = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({ ...prev, loading }));
    }, []);

    const handleConfirm = useCallback(
        async (paymentData: Payment & { session: POSSession }, callback: (paymentData: Payment & { session: POSSession }) => Promise<void>) => {
            setLoading(true);
            try {
                await callback(paymentData);
                close();
            } catch (error) {
                console.error("Payment processing error:", error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [close]
    );

    return {
        isOpen: state.isOpen,
        loading: state.loading,
        open,
        close,
        setLoading,
        handleConfirm,
    };
};
