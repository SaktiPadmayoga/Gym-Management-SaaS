// File: src/components/pos/POSWrapper.tsx
"use client";

import { useState, useMemo } from "react";
import { Product, CartItem, Customer, POSSession } from "@/types/pos";
import { DUMMY_PRODUCTS } from "@/lib/dummy/productDummy";
import { DEFAULT_WALK_IN_CUSTOMER, CATEGORIES, TAX_RATE } from "@/lib/constans/pos";

import { SearchBar } from "./SearchBar";
import { FilterDropdown } from "./FilterDropdown";
import { ProductGrid } from "./ProductGrid";
import { CartSidebar } from "./CartSidebar";
import { PaymentModal } from "./PaymentModal";
import { ReceiptModal } from "./ReceiptModal";
import { usePaymentModal } from "@/hooks/usePaymentModal";
import { toast } from "sonner";

import { Payment } from "@/types/payment";
import CustomButton from "@/components/ui/button/CustomButton";
import { HistoryIcon } from "lucide-react";

export const POSWrapper: React.FC = () => {
    // State Management
    const [products] = useState<Product[]>(DUMMY_PRODUCTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedBrand, setSelectedBrand] = useState("All Brands");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer>(DEFAULT_WALK_IN_CUSTOMER);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastPaymentData, setLastPaymentData] = useState<(Payment & { session: POSSession }) | null>(null);

    // Payment Modal Hook
    const { isOpen: isPaymentModalOpen, open: openPaymentModal, close: closePaymentModal, loading: isProcessing } = usePaymentModal();

    // Session Data
    const session: POSSession = {
        id: "POS-RRXZKBCK",
        counter: "Main Counter",
        branch: "Main Branch",
        startTime: new Date(),
        customer,
        items: cartItems,
        subtotal: cartItems.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0),
        tax: 0,
        total: 0,
        discount: 0,
        status: "active",
    };

    session.tax = session.subtotal * TAX_RATE;
    session.total = session.subtotal + session.tax;

    // Filtered Products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    // Cart Functions
    const handleAddToCart = (product: Product) => {
        setCartItems((prev) => {
            const existingItem = prev.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item));
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const handleRemoveItem = (productId: string) => {
        setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (quantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        setCartItems((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item)));
    };

    const handleChangeCustomer = () => {
        console.log("Change customer");
    };

    const handleSelectCustomer = (selectedCustomer: Customer) => {
        setCustomer(selectedCustomer);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("Cart is empty");
            return;
        }
        openPaymentModal();
    };

    const handlePaymentConfirm = (paymentData: Payment & { session: POSSession }) => {
        console.log("Payment Success:", paymentData);

        // Show success toast
        toast.success("Sale completed successfully!", {
            style: {
                background: "green",
                color: "white",
            },
        });

        // Save payment data and open receipt modal
        setLastPaymentData(paymentData);
        setIsReceiptModalOpen(true);

        // Reset cart dan close payment modal
        setCartItems([]);
        setCustomer(DEFAULT_WALK_IN_CUSTOMER);
        closePaymentModal();
    };

    return (
        <div className="flex flex-col h-[84vh] font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Products */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Filters */}
                    <div className=" border-b border-gray-200 px-6 py-4 space-y-3.5">
                        <div className="flex justify-between items-center">
                            <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                                <ul>
                                    <li>Transaction</li>
                                    <li>
                                        <a className="text-aksen-secondary ">POS (Point of Sale)</a>
                                    </li>
                                </ul>
                            </div>
                            <CustomButton className="px-2 h-8 text-white text-sm ">
                                <span>
                                    <HistoryIcon className=" h-4" />
                                </span>
                                Transaction History
                            </CustomButton>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5 flex flex-col">
                                <h1 className="text-2xl font-bold text-aksen-dark">Point of Sale</h1>
                                <p className="text-geonet-gray max-w-2xl">Add products to the cart to checkout.</p>
                            </div>

                            <div className="col-span-4 flex w-full items-center gap-4">
                                <div className="flex-1">
                                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                                </div>
                            </div>
                            <div className="col-span-3 flex w-full items-center gap-4">
                                <div className="shrink-0 w-full">
                                    <FilterDropdown label="Category" options={CATEGORIES} value={selectedCategory} onChange={setSelectedCategory} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {filteredProducts.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-gray-500 text-lg mb-2">No products found</p>
                                    <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                                </div>
                            </div>
                        ) : (
                            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
                        )}
                    </div>
                </div>

                {/* Right Side - Cart */}
                <CartSidebar
                    customer={customer}
                    items={cartItems}
                    subtotal={session.subtotal}
                    tax={session.tax}
                    total={session.total}
                    onRemoveItem={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                    onChangeCustomer={handleSelectCustomer}
                    onCheckout={handleCheckout}
                />
            </div>

            {/* Payment Modal */}
            <PaymentModal isOpen={isPaymentModalOpen} cartItems={cartItems} subtotal={session.subtotal} tax={session.tax} onClose={closePaymentModal} onConfirm={handlePaymentConfirm} loading={isProcessing} />

            {/* Receipt Modal */}
            <ReceiptModal isOpen={isReceiptModalOpen} paymentData={lastPaymentData} onClose={() => setIsReceiptModalOpen(false)} />
        </div>
    );
};
