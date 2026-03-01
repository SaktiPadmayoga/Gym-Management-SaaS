// File: src/hooks/usePOSCart.ts
"use client";

import { useState, useCallback, useMemo } from "react";
import { CartItem, Product } from "@/types/pos";
import { POSCalculator } from "@/lib/utils/pos-calculator";

export const usePOSCart = (taxRate: number = 0.1) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const summary = useMemo(() => {
        return POSCalculator.getCartSummary(items, taxRate);
    }, [items, taxRate]);

    const addItem = useCallback((product: Product) => {
        setItems((prev) => {
            const existingItem = prev.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item));
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback(
        (productId: string, quantity: number) => {
            if (quantity < 1) {
                removeItem(productId);
                return;
            }
            setItems((prev) =>
                prev.map((item) => {
                    if (item.product.id === productId) {
                        return {
                            ...item,
                            quantity: Math.min(quantity, item.product.stock),
                        };
                    }
                    return item;
                })
            );
        },
        [removeItem]
    );

    const clear = useCallback(() => {
        setItems([]);
    }, []);

    return {
        items,
        summary,
        addItem,
        removeItem,
        updateQuantity,
        clear,
    };
};
