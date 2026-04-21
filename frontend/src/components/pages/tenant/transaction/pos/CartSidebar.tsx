"use client";

import { useState } from "react";
import { CartItem, Customer } from "@/types/tenant/pos";
import { getItemId, getItemName, getItemPrice } from "@/lib/utils/pos-cart";
import { SelectCustomerModal } from "./SelectCustomerModal";
import { Icon } from "@/components/icon";
import { ShoppingBagIcon, ShoppingCartIcon, User2Icon } from "lucide-react";

interface CartSidebarProps {
    customer: Customer;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    onRemoveItem: (itemId: string) => void;
    onQuantityChange: (itemId: string, quantity: number) => void;
    onChangeCustomer: (customer: Customer) => void;
    onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
    customer, items, subtotal, tax, total,
    onRemoveItem, onQuantityChange, onChangeCustomer, onCheckout,
}) => {
    const [isSelectCustomerOpen, setIsSelectCustomerOpen] = useState(false);

    // VALIDASI: Cek apakah keranjang butuh akun member terdaftar
    const requiresRegisteredMember = items.some(
        (i) => i.type === "membership" || i.type === "pt_package"
    );
    const isWalkIn = customer.type === "walk-in";
    const isCheckoutDisabled = items.length === 0 || (requiresRegisteredMember && isWalkIn);

    return (
        <>
            <div className="xl:w-80 sm:w-60 border-l border-gray-200 flex flex-col overflow-hidden bg-white">
                {/* Customer Section */}
                <div className="border-b border-gray-200 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <User2Icon className="h-5 text-gray-500" />
                            <span className="font-semibold text-gray-900">Customer</span>
                        </div>
                        <button
                            onClick={() => setIsSelectCustomerOpen(true)}
                            className="text-sm text-aksen-secondary hover:text-aksen-dark font-medium transition"
                        >
                            Change
                        </button>
                    </div>
                    <div className="flex justify-between items-center gap-2 border bg-white rounded-lg p-3 border-gray-200 shadow-sm">
                        <div className="space-y-0.5 truncate">
                            <p className="font-medium text-md text-gray-900">{customer.name}</p>
                            <p className="text-gray-500 truncate text-xs">{customer.email || "No Email"}</p>
                            <p className="text-gray-500 text-xs">{customer.phone ? `+${customer.phone}` : "No Phone"}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                            isWalkIn
                                ? "bg-gray-100 text-gray-600"
                                : "bg-aksen-secondary/10 text-aksen-secondary border border-aksen-secondary/20"
                        }`}>
                            {isWalkIn ? "Walk-in" : "Member"}
                        </span>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex gap-2 items-center">
                        <ShoppingCartIcon className="h-5 w-auto text-gray-500" />
                        Cart ({items.length})
                    </h3>

                    {items.length === 0 ? (
                        <div className="flex flex-col text-center pt-32">
                            <ShoppingCartIcon className="flex justify-center items-center h-12 w-auto text-gray-300 mb-3 mx-auto" />
                            <p className="text-gray-500 font-medium">Your cart is empty</p>
                            <p className="text-gray-400 text-sm mt-1">Add products or packages</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => {
                                const id       = getItemId(item);
                                const name     = getItemName(item);
                                const price    = getItemPrice(item);
                                const isProduct = item.type === "product";

                                const typeBadge: Record<CartItem["type"], { label: string, color: string }> = {
                                    product:    { label: "Product", color: "bg-blue-50 text-blue-600 border-blue-100" },
                                    membership: { label: "Membership", color: "bg-purple-50 text-purple-600 border-purple-100" },
                                    pt_package: { label: "PT Package", color: "bg-amber-50 text-amber-600 border-amber-100" },
                                };

                                const badge = typeBadge[item.type];

                                return (
                                    <div key={id} className="border border-gray-100 bg-white shadow-sm rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 pr-2">
                                                <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">{name}</p>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => onRemoveItem(id)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"
                                            >
                                                <Icon name="trash" className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            {isProduct ? (
                                                <div className="flex items-center gap-1 bg-gray-50 rounded-md border border-gray-200 p-0.5">
                                                    <button
                                                        onClick={() => onQuantityChange(id, item.quantity - 1)}
                                                        disabled={item.quantity === 1}
                                                        className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-aksen-primary disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-800">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => onQuantityChange(id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.data.stock}
                                                        className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-aksen-primary disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">1× Package</span>
                                            )}
                                            <span className="font-bold text-gray-900">
                                                Rp {price.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Summary & Checkout Button */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50/50 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold text-gray-900">Rp {subtotal.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax (10%)</span>
                            <span className="font-semibold text-gray-900">Rp {tax.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-lg border-t border-gray-200 pt-3 mb-2">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-aksen-dark">Rp {total.toLocaleString("id-ID")}</span>
                        </div>

                        {/* Peringatan Member */}
                        {requiresRegisteredMember && isWalkIn && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center mb-2">
                                <p className="text-xs text-red-600 font-semibold">
                                    ⚠️ Pembelian Membership / PT Package wajib memilih Member terdaftar.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={onCheckout}
                            disabled={isCheckoutDisabled}
                            className="w-full bg-aksen-secondary hover:bg-aksen-dark disabled:bg-gray-300 disabled:text-gray-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
                        >
                            <ShoppingBagIcon className="h-5" />
                            Process Checkout
                        </button>
                    </div>
                )}
            </div>

            <SelectCustomerModal
                isOpen={isSelectCustomerOpen}
                onClose={() => setIsSelectCustomerOpen(false)}
                onSelect={(c) => { onChangeCustomer(c); setIsSelectCustomerOpen(false); }}
            />
        </>
    );
};