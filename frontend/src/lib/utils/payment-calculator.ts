// File: src/lib/utils/payment-calculator.ts
export class PaymentCalculator {
    /**
     * Calculate change amount
     */
    static calculateChange(total: number, amountPaid: number): number {
        return Math.max(0, parseFloat((amountPaid - total).toFixed(2)));
    }

    /**
     * Calculate total after discount
     */
    static calculateTotalAfterDiscount(subtotal: number, tax: number, discountAmount: number): number {
        const totalBeforeDiscount = subtotal + tax;
        return Math.max(0, parseFloat((totalBeforeDiscount - discountAmount).toFixed(2)));
    }

    /**
     * Format currency
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    }

    /**
     * Get payment summary
     */
    static getPaymentSummary(subtotal: number, tax: number, discount: number, amountPaid: number) {
        const totalAfterDiscount = this.calculateTotalAfterDiscount(subtotal, tax, discount);
        const change = this.calculateChange(totalAfterDiscount, amountPaid);

        return {
            subtotal,
            tax,
            discount,
            totalAfterDiscount,
            amountPaid,
            change,
            formattedSubtotal: this.formatCurrency(subtotal),
            formattedTax: this.formatCurrency(tax),
            formattedDiscount: this.formatCurrency(discount),
            formattedTotal: this.formatCurrency(totalAfterDiscount),
            formattedAmountPaid: this.formatCurrency(amountPaid),
            formattedChange: this.formatCurrency(change),
        };
    }
}
