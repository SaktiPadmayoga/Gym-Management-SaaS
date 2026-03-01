// File: src/lib/utils/pos-calculator.ts
import { CartItem } from "@/types/pos";

export class POSCalculator {
    /**
     * Calculate subtotal from cart items
     */
    static calculateSubtotal(items: CartItem[]): number {
        return items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
    }

    /**
     * Calculate tax amount
     */
    static calculateTax(subtotal: number, taxRate: number): number {
        return parseFloat((subtotal * taxRate).toFixed(2));
    }

    /**
     * Calculate total with tax
     */
    static calculateTotal(subtotal: number, tax: number): number {
        return parseFloat((subtotal + tax).toFixed(2));
    }

    /**
     * Format currency to USD
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    }

    /**
     * Get cart summary
     */
    static getCartSummary(items: CartItem[], taxRate: number) {
        const subtotal = this.calculateSubtotal(items);
        const tax = this.calculateTax(subtotal, taxRate);
        const total = this.calculateTotal(subtotal, tax);

        return {
            itemCount: items.length,
            subtotal,
            tax,
            total,
            formattedSubtotal: this.formatCurrency(subtotal),
            formattedTax: this.formatCurrency(tax),
            formattedTotal: this.formatCurrency(total),
        };
    }
}
