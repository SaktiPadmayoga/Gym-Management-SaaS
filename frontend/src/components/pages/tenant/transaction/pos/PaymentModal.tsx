"use client";

import { useState, useEffect } from "react";
import { CartItem, POSSession } from "@/types/tenant/pos";
import { Payment, PaymentMethod } from "@/types/payment";
import { PaymentCalculator } from "@/lib/utils/payment-calculator";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
    { value: "cash", label: "Tunai (Cash di Kasir)" },
    { value: "midtrans", label: "Midtrans (Online / QRIS)" },
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
        // Jika cash, update amount paid default. Jika midtrans, paksa sama persis dengan total.
        setAmountPaid(summary.totalAfterDiscount);
    }, [discountAmount, selectedPaymentMethod, summary.totalAfterDiscount]);

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

    const handleConfirm = () => {
        // Validasi khusus Cash (harus lebih besar / sama dengan total)
        if (selectedPaymentMethod === "cash" && amountPaid < summary.totalAfterDiscount) {
            setError(`Jumlah uang tunai kurang dari ${summary.formattedTotal}`);
            return;
        }

        // Jika midtrans, pastikan amountPaid selalu sama persis dengan total tagihan
        const finalAmountPaid = selectedPaymentMethod === "midtrans" ? summary.totalAfterDiscount : amountPaid;

        const paymentData: Payment = {
            discountAmount,
            paymentMethod: selectedPaymentMethod,
            amountPaid: finalAmountPaid,
            notes: notes || undefined,
        };

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
            <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />

            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center p-4">
                    <div className="relative w-full sm:max-w-xl rounded-2xl bg-white shadow-2xl transition-all" role="dialog" aria-modal="true">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-2xl font-bold text-gray-900">Proses Pembayaran</h2>
                            <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6">
                            
                            {/* Order Summary */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h3>
                                <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Item:</span>
                                        <span className="font-medium text-gray-900">{cartItems.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-gray-900">{summary.formattedSubtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Pajak (10%):</span>
                                        <span className="font-medium text-gray-900">{summary.formattedTax}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Total Tagihan:</span>
                                        <span className="text-lg font-bold text-aksen-dark">{summary.formattedTotal}</span>
                                    </div>
                                </div>
                            </div>

                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Metode Pembayaran</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PAYMENT_METHODS.map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                                                selectedPaymentMethod === method.value ? "border-aksen-primary bg-aksen-secondary/10" : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment-method"
                                                value={method.value}
                                                checked={selectedPaymentMethod === method.value}
                                                onChange={() => setSelectedPaymentMethod(method.value as PaymentMethod)}
                                                className="w-4 h-4 cursor-pointer accent-aksen-secondary"
                                                disabled={loading}
                                            />
                                            <span className="ml-2 text-sm text-gray-900 font-medium">{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Discount Amount */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Diskon (Opsional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
                                    <input
                                        type="number"
                                        value={discountAmount || ""}
                                        onChange={handleDiscountChange}
                                        placeholder="0"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary bg-white"
                                        min="0"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* HANYA MUNCUL JIKA CASH */}
                            {selectedPaymentMethod === "cash" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Uang Diterima (Cash)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
                                            <input
                                                type="number"
                                                value={amountPaid || ""}
                                                onChange={handleAmountPaidChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary bg-white"
                                                min="0"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-aksen-secondary/5 border border-aksen-primary/30 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-aksen-secondary font-semibold">Kembalian:</span>
                                            <span className="text-xl font-bold text-aksen-secondary">{summary.formattedChange}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Catatan Kasir</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tambahkan catatan jika perlu..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary resize-none bg-white"
                                    rows={2}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 sm:flex-row-reverse bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={handleConfirm}
                                disabled={loading || cartItems.length === 0}
                                className="flex-1 bg-aksen-secondary hover:bg-aksen-dark disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                            >
                                {loading ? "Memproses..." : selectedPaymentMethod === "midtrans" ? "Bayar via Midtrans" : "Selesaikan Transaksi"}
                            </button>
                            <button onClick={onClose} disabled={loading} className="flex-1 border-2 border-gray-300 hover:bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold transition">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};