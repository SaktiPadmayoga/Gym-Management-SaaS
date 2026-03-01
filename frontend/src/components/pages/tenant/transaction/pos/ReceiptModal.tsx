// File: src/components/pos/ReceiptModal.tsx
"use client";

import { CartItem, POSSession } from "@/types/pos";
import { Payment } from "@/types/payment";
import { PaymentCalculator } from "@/lib/utils/payment-calculator";

interface ReceiptModalProps {
    isOpen: boolean;
    paymentData: (Payment & { session: POSSession }) | null;
    onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, paymentData, onClose }) => {
    if (!isOpen || !paymentData) return null;

    const { session, paymentMethod, amountPaid, discountAmount } = paymentData;
    const summary = PaymentCalculator.getPaymentSummary(session.subtotal, session.tax, discountAmount, amountPaid);

    const receiptNumber = `SALE-${Date.now().toString().slice(-8)}`;
    const formattedDate = new Date(session.startTime).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download
        console.log("Download PDF");
    };

    const handleDownloadHTML = () => {
        // TODO: Implement HTML download
        console.log("Download HTML");
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden="true" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center ">
                <div className="flex max-h-full items-center justify-center p-4">
                    <div className="relative w-md rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 gap-5">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🧾</span>
                                <h2 className="text-lg font-bold text-gray-900">Receipt Preview - {receiptNumber}</h2>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close modal">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[45vh] rounded-lg border m-4 border-gray-300 overflow-y-auto px-6 py-8 bg-gray-50">
                            {/* Receipt Content */}
                            <div id="receipt-print-area" className="bg-white rounded-lg p-8 font-mono text-sm border border-gray-200">
                                {/* Company Header */}
                                <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-400">
                                    <h3 className="text-xl font-bold text-gray-900">Company</h3>
                                </div>

                                {/* Receipt Info */}
                                <div className="space-y-2 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Receipt #:</span>
                                        <span className="font-semibold text-gray-900">{receiptNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-semibold text-gray-900">{formattedDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Register:</span>
                                        <span className="font-semibold text-gray-900">{session.counter}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Branch:</span>
                                        <span className="font-semibold text-gray-900">{session.branch}</span>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-2 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Customer:</span>
                                        <span className="font-semibold text-gray-900">{session.customer?.name || "Walk-in Customer"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-semibold text-gray-900">{session.customer?.phone || "0000000000"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">E-mail:</span>
                                        <span className="font-semibold text-gray-900">{session.customer?.email || "walkin@default.com"}</span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    {session.items.map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Product Name:</span>
                                                <span className="font-semibold text-gray-900">{item.product.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-semibold text-gray-900">{PaymentCalculator.formatCurrency(item.product.sellingPrice)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Qty:</span>
                                                <span className="font-semibold text-gray-900">{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="space-y-2 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">SubTotal:</span>
                                        <span className="font-semibold text-gray-900">{summary.formattedSubtotal}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="font-semibold text-gray-900">-{summary.formattedDiscount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax(%):</span>
                                        <span className="font-semibold text-gray-900">10.00%, 10.00%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax Amount:</span>
                                        <span className="font-semibold text-gray-900">{summary.formattedTax}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span className="text-gray-900 font-bold text-lg">Total:</span>
                                        <span className="font-bold text-gray-900 text-lg">{summary.formattedTotal}</span>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment:</span>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {paymentMethod === "digital_wallet"
                                                ? "Digital Wallet"
                                                : paymentMethod === "bank_transfer"
                                                ? "Bank Transfer"
                                                : paymentMethod === "mixed"
                                                ? "Mixed Payment"
                                                : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Paid:</span>
                                        <span className="font-semibold text-gray-900">{summary.formattedAmountPaid}</span>
                                    </div>
                                    {summary.change > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Change:</span>
                                            <span className="font-semibold text-gray-900">{summary.formattedChange}</span>
                                        </div>
                                    )}
                                </div>

                                {paymentData.notes && (
                                    <div className="mt-6 pt-4 border-t border-dashed border-gray-400">
                                        <div className="text-sm text-gray-600">Notes:</div>
                                        <div className="text-sm text-gray-900 font-semibold">{paymentData.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 rounded-b-2xl space-y-4">
                            {/* Print Options */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Print Options</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-aksen-primary hover:bg-aksen-secondary text-white py-2 rounded-lg font-semibold transition">
                                        <span>🖨️</span>
                                        Thermal Print
                                    </button>
                                    <button onClick={handlePrint} className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold transition">
                                        <span>📄</span>
                                        A4 Print
                                    </button>
                                </div>
                            </div>

                            {/* Download Options */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Download Options</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleDownloadHTML} className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold transition">
                                        <span>⬇️</span>
                                        HTML File
                                    </button>
                                    <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold transition">
                                        <span>📋</span>
                                        Generate PDF
                                    </button>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button onClick={onClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
