// File: src/components/pos/PaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { CartItem, POSSession } from "@/types/pos";
import { Payment, PaymentMethod } from "@/types/payment";
import { PaymentCalculator } from "@/lib/utils/payment-calculator";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "digital_wallet", label: "Digital Wallet" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "mixed", label: "Mixed Payment" },
];

interface PaymentModalProps {
    isOpen: boolean;
    cartItems: CartItem[];
    subtotal: number;
    tax: number;
    onClose: () => void;
    onConfirm: (paymentData: Payment & { session: POSSession }) => void;
    loading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, cartItems, subtotal, tax, onClose, onConfirm, loading = false }) => {
    const [discountAmount, setDiscountAmount] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("cash");
    const [amountPaid, setAmountPaid] = useState(subtotal + tax);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    // Calculate payment summary
    const summary = PaymentCalculator.getPaymentSummary(subtotal, tax, discountAmount, amountPaid);

    // Auto-update amountPaid when discount changes
    useEffect(() => {
        setAmountPaid(summary.totalAfterDiscount);
    }, [discountAmount]);

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setDiscountAmount(Math.max(0, value));
        setError("");
    };

    const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setAmountPaid(Math.max(0, value));
        setError("");
    };

    const handlePaymentMethodChange = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
    };

    const handleConfirm = () => {
        // Simple validation
        if (amountPaid < summary.totalAfterDiscount) {
            setError(`Amount paid must be at least ${summary.formattedTotal}`);
            return;
        }

        // Create payment data
        const paymentData: Payment = {
            discountAmount,
            paymentMethod: selectedPaymentMethod,
            amountPaid,
            notes: notes || undefined,
        };

        // Create session data
        const session: POSSession = {
            id: `POS-${Date.now()}`,
            counter: "Main Counter",
            branch: "Main Branch",
            startTime: new Date(),
            customer: null,
            items: cartItems,
            subtotal,
            tax,
            discount: discountAmount,
            total: summary.totalAfterDiscount,
            notes,
            status: "completed",
        };

        onConfirm({ ...paymentData, session });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center p-4">
                    <div className="relative w-full sm:max-w-xl rounded-2xl bg-white shadow-2xl transition-all" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                                Process Payment
                            </h2>
                            <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50" aria-label="Close modal">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6">
                            {/* Order Summary */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Items ({cartItems.length}):</span>
                                        <span className="font-medium text-gray-900">{cartItems.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-gray-900">{summary.formattedSubtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium text-gray-900">{summary.formattedTax}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Total:</span>
                                        <span className="text-lg font-bold text-gray-900">{summary.formattedTotal}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

                            {/* Discount Amount */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Discount Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-aksen-secondary font-semibold text-lg">$</span>
                                    <input
                                        type="number"
                                        value={discountAmount || ""}
                                        onChange={handleDiscountChange}
                                        placeholder="0"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary bg-white"
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Method</label>
                                <div className="space-y-2">
                                    {PAYMENT_METHODS.map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                                                selectedPaymentMethod === method.value ? "border-aksen-primary  bg-aksen-secondary/10" : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment-method"
                                                value={method.value}
                                                checked={selectedPaymentMethod === method.value}
                                                onChange={() => handlePaymentMethodChange(method.value)}
                                                className="w-5 h-5 cursor-pointer accent-aksen-secondary"
                                                disabled={loading}
                                            />
                                            <span className="ml-3 text-gray-900 font-medium">{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Paid */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Amount Paid</label>
                                <input
                                    type="number"
                                    value={amountPaid || ""}
                                    onChange={handleAmountPaidChange}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary bg-white"
                                    min="0"
                                    step="0.01"
                                    disabled={loading}
                                />
                            </div>

                            {/* Change Display */}
                            <div className="bg-aksen-secondary/5 border-2 border-aksen-primary/40 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-aksen-secondary font-semibold">Change:</span>
                                    <span className="text-2xl font-bold text-aksen-secondary">{summary.formattedChange}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes for this sale..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary resize-none bg-white"
                                    rows={3}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 sm:flex-row-reverse bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={handleConfirm}
                                disabled={loading || cartItems.length === 0}
                                className="flex-1 bg-aksen-secondary hover:bg-aksen-dark disabled:bg-gray-300 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    "Complete Sale"
                                )}
                            </button>
                            <button onClick={onClose} disabled={loading} className="flex-1 border-2 border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-gray-900 py-2 rounded-lg font-semibold transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
