// File: src/components/pos/ReceiptModal.tsx
"use client";

import { useState } from "react";
import { CartItem, POSSession } from "@/types/tenant/pos";
import { Payment } from "@/types/payment";
import { PaymentCalculator } from "@/lib/utils/payment-calculator";
import { getItemName } from "@/lib/utils/pos-cart";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import tenantApiClient from "@/lib/tenant-api-client";

interface ReceiptModalProps {
    isOpen: boolean;
    paymentData: (Payment & { session: POSSession; invoiceNumber?: string }) | null;
    onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, paymentData, onClose }) => {
    const { data: tenantData } = useTenantHeader();
    const [sendingEmail, setSendingEmail] = useState(false);

    if (!isOpen || !paymentData) return null;

    const { session, paymentMethod, amountPaid, discountAmount, invoiceNumber } = paymentData;
    const summary = PaymentCalculator.getPaymentSummary(session.subtotal, session.tax, discountAmount, amountPaid);

    const receiptNumber = invoiceNumber || `SALE-${Date.now().toString().slice(-8)}`;
    const formattedDate = new Date(session.startTime).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    // --- PDF GENERATOR ---
    const generatePDF = async (): Promise<{ pdf: jsPDF, base64: string } | null> => {
        const input = document.getElementById("receipt-print-area");
        if (!input) return null;

        try {
            // Render elemen HTML menjadi gambar menggunakan html-to-image (Mendukung oklch)
            const dataUrl = await toPng(input, { 
                backgroundColor: "#ffffff",
                pixelRatio: 2 // Membuat gambar tidak blur
            });

            // Ambil ukuran elemen asli untuk kalkulasi rasio PDF
            const widthPx = input.offsetWidth;
            const heightPx = input.offsetHeight;

            // Kalkulasi ukuran PDF menyerupai kertas Thermal (Lebar 80mm)
            const pdfWidth = 80;
            const pdfHeight = (heightPx * pdfWidth) / widthPx;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [pdfWidth, pdfHeight],
            });

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            const base64 = pdf.output("datauristring");
            return { pdf, base64 };
        } catch (error) {
            console.error("Gagal men-generate PDF", error);
            return null;
        }
    };

    // --- FITUR PRINT WINDOW (Dengan auto PDF download) ---
    const handlePrint = async () => {
        const res = await generatePDF();
        if (res) {
            res.pdf.save(`${receiptNumber}.pdf`);
        }
        window.print();
    };

    // --- FITUR KIRIM EMAIL MEMBER (Dengan auto PDF attachment) ---
    const handleSendEmail = async () => {
        if (!session.customer?.email) {
            alert("Email customer tidak ditemukan.");
            return;
        }

        setSendingEmail(true);
        try {
            const res = await generatePDF();
            if (!res) {
                alert("Gagal men-generate PDF untuk lampiran email.");
                setSendingEmail(false);
                return;
            }

            const response = await tenantApiClient.post(`/pos/invoices/${receiptNumber}/send-email`, {
                pdf_base64: res.base64
            });

            if (response.data?.success) {
                alert(`Nota berhasil dikirim ke email: ${session.customer.email}`);
            } else {
                alert(response.data?.message || "Gagal mengirim email.");
            }
        } catch (error: any) {
            console.error("Gagal mengirim email", error);
            alert(error.response?.data?.message || "Gagal mengirim email.");
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden="true" />

            <div className="fixed inset-0 z-50 flex items-center justify-center ">
                <div className="flex max-h-full items-center justify-center p-4 w-full">
                    <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true">
                        
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 gap-5">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🧾</span>
                                <h2 className="text-lg font-bold text-gray-900">Receipt Preview</h2>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="max-h-[45vh] rounded-lg border m-4 border-gray-300 overflow-y-auto px-6 py-8 bg-gray-50">
                            
                            {/* PRINT AREA */}
                            <div id="receipt-print-area" className="bg-white rounded-lg p-6 font-mono text-sm border border-gray-200 text-black">
                                
                                <div className="text-center mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <h3 className="text-xl font-bold uppercase">{tenantData?.name || "GYM FITNESS CENTER"}</h3>
                                    <p style={{ fontSize: '11px', marginTop: '4px' }}>
                                        {session.branchAddress || tenantData?.current_branch?.address || "Jl. Sehat Selalu No. 123"}
                                    </p>
                                    {session.branchPhone && (
                                        <p style={{ fontSize: '11px', marginTop: '2px' }}>
                                            Telp: {session.branchPhone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span>Receipt #:</span>
                                        <span className="font-bold">{receiptNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span className="font-bold">{formattedDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Branch:</span>
                                        <span className="font-bold">{session.branch}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span>Customer:</span>
                                        <span className="font-bold">{session.customer?.name || "Walk-in Customer"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Contact:</span>
                                        <span className="font-bold">{session.customer?.phone || "-"}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    {session.items.map((item, idx) => {
                                        const isProduct = item.type === "product";
                                        const price = isProduct ? item.data.sellingPrice : item.data.price;
                                        const totalItemPrice = price * item.quantity;
                                        
                                        return (
                                        <div key={idx} className="space-y-1">
                                            <div className="font-bold">{getItemName(item)}</div>
                                            <div className="flex justify-between">
                                                <span>{item.quantity} x {PaymentCalculator.formatCurrency(price)}</span>
                                                <span className="font-bold">{PaymentCalculator.formatCurrency(totalItemPrice)}</span>
                                            </div>
                                        </div>
                                    )})}
                                </div>

                                <div className="space-y-2 mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span>SubTotal:</span>
                                        <span className="font-bold">{summary.formattedSubtotal}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Discount:</span>
                                            <span className="font-bold">-{summary.formattedDiscount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Tax Amount:</span>
                                        <span className="font-bold">{summary.formattedTax}</span>
                                    </div>
                                </div>

                                <div className="mb-6 pb-4 border-b border-dashed border-gray-400">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-lg">Total:</span>
                                        <span className="font-bold text-lg">{summary.formattedTotal}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Payment:</span>
                                        <span className="font-bold uppercase">
                                            {paymentMethod}
                                        </span>
                                    </div>
                                    
                                    {paymentMethod === "cash" && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Paid:</span>
                                                <span className="font-bold">{summary.formattedAmountPaid}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Change:</span>
                                                <span className="font-bold">{summary.formattedChange}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {paymentData.notes && (
                                    <div className="mt-6 pt-4 border-t border-dashed border-gray-400">
                                        <div className="text-xs">Notes:</div>
                                        <div className="font-bold">{paymentData.notes}</div>
                                    </div>
                                )}
                                
                                <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400">
                                    <p>Terima Kasih</p>
                                    <p style={{ fontSize: '10px', marginTop: '4px' }}>Barang yang dibeli tidak dapat ditukar/dikembalikan</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 rounded-b-2xl space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={handlePrint} 
                                    className="flex items-center justify-center gap-2 bg-aksen-secondary hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition shadow-sm w-full"
                                >
                                    <span>🖨️</span>
                                    Thermal Print & Save PDF
                                </button>

                                {session.customer?.type === "registered" && session.customer?.email && (
                                    <button 
                                        onClick={handleSendEmail} 
                                        disabled={sendingEmail}
                                        className="flex items-center justify-center gap-2 border-2 border-aksen-secondary text-aksen-secondary hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition w-full"
                                    >
                                        <span>📧</span>
                                        {sendingEmail ? "Mengirim..." : "Kirim Nota ke Email Member"}
                                    </button>
                                )}
                            </div>

                            <button onClick={onClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition">
                                Selesai & Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};