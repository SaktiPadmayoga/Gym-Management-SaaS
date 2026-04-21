// File: src/components/pos/POSWrapper.tsx
"use client";

import { useState, useEffect } from "react";
import { CartItem, Customer, POSSession } from "@/types/tenant/pos";
import { DEFAULT_WALK_IN_CUSTOMER, CATEGORIES, TAX_RATE } from "@/lib/constans/pos";

import { SearchBar } from "./SearchBar";
import { FilterDropdown } from "./FilterDropdown";
import { ProductGrid } from "./ProductGrid";
// TODO: Uncomment jika komponen Grid untuk Membership dan PT Package sudah dibuat
// import { MembershipGrid } from "./MembershipGrid"; 
// import { PtPackageGrid } from "./PtPackageGrid";

import { CartSidebar } from "./CartSidebar";
import { PaymentModal } from "./PaymentModal";
import { ReceiptModal } from "./ReceiptModal";
import { usePaymentModal } from "@/hooks/usePaymentModal";
import { toast } from "sonner";
import { calcSubtotal } from "@/lib/utils/pos-cart";

import { usePOSCheckout, mapCartToPayload } from "@/hooks/tenant/usePOS";
import { Payment } from "@/types/payment";
import CustomButton from "@/components/ui/button/CustomButton";
import { HistoryIcon } from "lucide-react";
import { getCurrentBranchId } from "@/lib/tenant-api-client";
import { MembershipGrid } from "./MembershipGrid";
import { PtPackageGrid } from "./PtPackageGrid";
import { useRouter } from "next/navigation";

type PosTab = "product" | "membership" | "pt_package";

const TABS: Array<{ key: PosTab; label: string }> = [
    { key: "product", label: "Produk Retail" },
    { key: "membership", label: "Paket Membership" },
    { key: "pt_package", label: "Paket Pelatih (PT)" },
];

export const POSWrapper: React.FC = () => {
    // State Management
    const [activeTab, setActiveTab] = useState<PosTab>("product");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer>(DEFAULT_WALK_IN_CUSTOMER);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastPaymentData, setLastPaymentData] = useState<(Payment & { session: POSSession; invoiceNumber?: string }) | null>(null);

    // Hooks
    const { isOpen: isPaymentModalOpen, open: openPaymentModal, close: closePaymentModal } = usePaymentModal();
    const checkoutMutation = usePOSCheckout();

    // Calculations
    const subtotal = calcSubtotal(cartItems);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const router = useRouter();

    // Session Data (Hanya untuk keperluan Receipt/Print)
    const session: POSSession = {
        id: `POS-${Date.now()}`,
        counter: "Main Counter",
        branch: "Main Branch", 
        startTime: new Date(),
        customer,
        items: cartItems,
        subtotal,
        tax,
        total,
        discount: 0,
        status: "active",
    };

    // Load Midtrans Script (Agar tidak error saat popup dipanggil)
    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"; // Ganti ke production jika rilis
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
        if (!document.querySelector(`script[src="${snapScript}"]`)) {
            const script = document.createElement("script");
            script.src = snapScript;
            script.setAttribute("data-client-key", clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Cart Functions
    const handleAddToCart = (itemData: any, type: PosTab = "product") => {
        setCartItems((prev) => {
            const existingItem = prev.find((i) => i.type === type && i.data.id === itemData.id);

            if (existingItem) {
                if (type === "product") {
                    const maxStock = itemData.stock || 0;
                    if (existingItem.quantity >= maxStock) {
                        toast.error(`Stok ${itemData.name} tidak mencukupi (Sisa: ${maxStock})`);
                        return prev;
                    }
                    return prev.map((i) =>
                        i.type === "product" && i.data.id === itemData.id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    );
                } else {
                    toast.error(`${type === "membership" ? "Paket Membership" : "Paket PT"} ini sudah ada di keranjang.`);
                    return prev;
                }
            }

            if (type === "membership") {
                const hasMembershipInCart = prev.some(i => i.type === "membership");
                if (hasMembershipInCart) {
                    toast.error("Hanya bisa memproses 1 Paket Membership per transaksi.");
                    return prev;
                }
            }

            return [...prev, { type, data: itemData, quantity: 1 }];
        });
    };

    const handleRemoveItem = (itemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.data.id !== itemId));
    };

    const handleQuantityChange = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        setCartItems((prev) => prev.map((item) => 
            (item.type === "product" && item.data.id === itemId)
                ? { ...item, quantity: Math.min(quantity, item.data.stock || 999) } 
                : item
        ));
    };

    const handleSelectCustomer = (selectedCustomer: Customer) => {
        setCustomer(selectedCustomer);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return toast.error("Cart is empty");
        
        const requiresMember = cartItems.some((i) => i.type === "membership" || i.type === "pt_package");
        if (requiresMember && customer.type === "walk-in") {
            return toast.error("Membership dan PT Package memerlukan Member terdaftar.");
        }

        openPaymentModal();
    };

    const handlePaymentConfirm = (paymentData: Payment & { session: POSSession }) => {
        // 1. Ambil Branch ID
        const branchId = getCurrentBranchId();

        // 2. Ambil Staff ID (created_by)
        // Ambil dari localStorage tempat kamu biasa menyimpan data user/auth. 
        // Sesuaikan key "user" dengan key yang kamu gunakan di aplikasi.
        let staffId = null;
        if (typeof window !== "undefined") {
            const userDataStr = localStorage.getItem("staff_data");
            if (userDataStr) {
                try {
                    const userObj = JSON.parse(userDataStr);
                    staffId = userObj.id;
                } catch (e) {
                    console.error("Gagal parse data user", e);
                }
            }
        }

        // 3. FRONTEND VALIDATION (Mencegah error 422 dari Backend)
        if (!branchId) {
            toast.error("Gagal: Branch ID tidak ditemukan. Pastikan Anda sudah memilih cabang aktif.");
            return;
        }
        if (!staffId) {
            toast.error("Gagal: Data Staff/Kasir tidak ditemukan. Silakan login ulang.");
            return;
        }

        const payload = {
            branch_id:       branchId,
            created_by:      staffId,
            member_id:       customer.type === "registered" ? customer.id : null,
            guest_name:      customer.type === "walk-in" ? customer.name  : undefined,
            guest_phone:     customer.type === "walk-in" ? customer.phone : undefined,
            guest_email:     customer.type === "walk-in" ? customer.email : undefined,
            items:           mapCartToPayload(cartItems),
            payment_method:  paymentData.paymentMethod,
            amount_paid:     paymentData.amountPaid,
            discount_amount: paymentData.discountAmount,
            notes:           paymentData.notes,
        };

        checkoutMutation.mutate(payload, {
            onSuccess: (data: any) => {
                if (paymentData.paymentMethod === "midtrans" && data.snap_token) {
                    (window as any).snap.pay(data.snap_token, {
                        onSuccess: () => {
                            toast.success(`Pembayaran Midtrans Berhasil! (INV: ${data.invoice_number})`);
                            setLastPaymentData({ ...paymentData, invoiceNumber: data.invoice_number });
                            setIsReceiptModalOpen(true);
                            setCartItems([]);
                            setCustomer(DEFAULT_WALK_IN_CUSTOMER);
                            closePaymentModal();
                        },
                        onPending: () => {
                            toast.info("Pembayaran menunggu diselesaikan oleh pelanggan.");
                            setCartItems([]);
                            setCustomer(DEFAULT_WALK_IN_CUSTOMER);
                            closePaymentModal();
                        },
                        onError: () => toast.error("Pembayaran Midtrans gagal."),
                        onClose: () => {
                            toast.warning("Popup ditutup. Status tagihan Pending.");
                            setCartItems([]);
                            closePaymentModal();
                        }
                    });
                } else {
                    toast.success(`Transaksi Tunai Berhasil! (INV: ${data.invoice_number})`);
                    setLastPaymentData({ ...paymentData, invoiceNumber: data.invoice_number });
                    setIsReceiptModalOpen(true);
                    setCartItems([]);
                    setCustomer(DEFAULT_WALK_IN_CUSTOMER);
                    closePaymentModal();
                }
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Checkout gagal diproses.");
            }
        });
    };

    return (
        <div className="flex flex-col h-[84vh] font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 shadow-sm">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Items Browser */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Header & Filters */}
                    <div className="border-b border-gray-200 px-6 py-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="breadcrumbs text-sm text-zinc-400 mb-2">
                                <ul>
                                    <li>Transaction</li>
                                    <li><span className="text-aksen-secondary font-medium">POS (Point of Sale)</span></li>
                                </ul>
                            </div>
                            <CustomButton onClick={() => router.push("/pos/transactions-history")} className="px-3 h-9 text-white text-sm bg-zinc-800 hover:bg-zinc-700">
                                <HistoryIcon className="h-4 w-4 mr-1.5" />
                                Riwayat Transaksi
                            </CustomButton>
                        </div>

                        <div className="flex justify-between items-end gap-4">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Kasir (POS)</h1>
                                <p className="text-zinc-500 text-sm">Pilih produk atau paket untuk dijual.</p>
                            </div>

                            <div className="flex gap-3 w-full max-w-md">
                                <div className="flex-1">
                                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                                </div>
                                {activeTab === "product" && (
                                    <div className="w-40 shrink-0">
                                        <FilterDropdown label="Category" options={CATEGORIES} value={selectedCategory} onChange={setSelectedCategory} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TABS NAVIGATION */}
                        <div className="flex gap-2 pt-2">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setSearchQuery("");
                                    }}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                        activeTab === tab.key
                                            ? "bg-aksen-secondary text-white shadow-sm"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Grid Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                        {activeTab === "product" && (
                            <ProductGrid
                                onAddToCart={(item) => handleAddToCart(item, "product")}
                                searchQuery={searchQuery}
                                categoryFilter={selectedCategory === "All Categories" ? "" : selectedCategory}
                            />
                        )}

                        {activeTab === "membership" && (
                            <MembershipGrid
                                onAddToCart={(item) => handleAddToCart(item, "membership")}
                                searchQuery={searchQuery}
                            />
                        )}

                        {activeTab === "pt_package" && (
                            <PtPackageGrid
                                onAddToCart={(item) => handleAddToCart(item, "pt_package")}
                                searchQuery={searchQuery}
                            />
                        )}
                    </div>
                </div>

                {/* Right Side - Cart */}
                <CartSidebar
                    customer={customer}
                    items={cartItems}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                    onRemoveItem={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                    onChangeCustomer={handleSelectCustomer}
                    onCheckout={handleCheckout}
                />
            </div>

            {/* Modals */}
            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                cartItems={cartItems} 
                subtotal={subtotal} 
                tax={tax} 
                onClose={closePaymentModal} 
                onConfirm={handlePaymentConfirm} 
                loading={checkoutMutation.isPending} 
            />

            <ReceiptModal 
                isOpen={isReceiptModalOpen} 
                paymentData={lastPaymentData} 
                onClose={() => setIsReceiptModalOpen(false)} 
            />
        </div>
    );
};