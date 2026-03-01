// File: src/components/pos/CartSidebar.tsx
"use client";

import { useState } from "react";
import { CartItem, Customer } from "@/types/pos";
import { SelectCustomerModal } from "./SelectCustomerModal";
import { Icon } from "@/components/icon";
import { ShoppingBagIcon, ShoppingCartIcon, User2Icon } from "lucide-react";

interface CartSidebarProps {
    customer: Customer;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    onRemoveItem: (productId: string) => void;
    onQuantityChange: (productId: string, quantity: number) => void;
    onChangeCustomer: (customer: Customer) => void;
    onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ customer, items, subtotal, tax, total, onRemoveItem, onQuantityChange, onChangeCustomer, onCheckout }) => {
    const [isSelectCustomerOpen, setIsSelectCustomerOpen] = useState(false);

    const handleSelectCustomer = (selectedCustomer: Customer) => {
        onChangeCustomer(selectedCustomer);
        setIsSelectCustomerOpen(false);
    };

    return (
        <>
            <div className="xl:w-80 sm:w-60  border-l border-gray-200 flex flex-col overflow-hidden">
                {/* Customer Section */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                            <span className="text-md">
                                <User2Icon className="h-5 " />
                            </span>
                            <span className="font-semibold text-gray-900">Customer</span>
                        </div>
                        <button onClick={() => setIsSelectCustomerOpen(true)} className="text-sm text-aksen-secondary hover:text-aksen-dark font-medium hover:cursor-pointer">
                            Change
                        </button>
                    </div>
                    <div className="flex justify-between items-center gap-2 border rounded-lg p-2 border-gray-300">
                        <div className="space-y-0.5 truncate">
                            <p className="font-medium text-md text-gray-900">{customer.name}</p>
                            <p className="text-gray-500 truncate text-sm">{customer.email}</p>
                            <p className="text-gray-500 text-sm">+{customer.phone}</p>
                        </div>
                        <span className={`flex mt-2 px-2 py-1 rounded text-xs font-medium ${customer.type === "walk-in" ? "bg-gray-100 text-gray-700" : "bg-aksen-secondary/20 text-aksen-secondary"}`}>
                            {customer.type === "walk-in" ? "Walk-in" : "Registered"}
                        </span>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex gap-2 items-center">
                        {" "}
                        <span>
                            <ShoppingCartIcon className="h-5 w-auto" />
                        </span>
                        Cart ({items.length})
                    </h3>

                    {items.length === 0 ? (
                        <div className="flex flex-col text-center pt-35">
                            <ShoppingCartIcon className="flex justify-center items-center h-10 w-auto text-gray-600" />
                            <p className="text-gray-500 text-sm">Your cart is empty</p>
                            <p className="text-gray-400 text-xs">Add products to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.product.id} className="border border-gray-200 rounded p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.product.id)} className="text-red-500 hover:text-red-700 transition">
                                            <Icon name="trash" className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
                                                disabled={item.quantity === 1}
                                                className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-50 transition"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.product.stock}
                                                className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-50 transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-medium text-gray-900">${(item.product.sellingPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg border-t border-gray-200 pt-3">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            disabled={items.length === 0}
                            className="w-full bg-aksen-secondary hover:bg-aksen-dark disabled:bg-gray-300 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2 hover:cursor-pointer"
                        >
                            <span className="text-xs">
                                <ShoppingBagIcon className="h-5 auto" />
                            </span>
                            Checkout
                        </button>
                    </div>
                )}
            </div>

            {/* Select Customer Modal */}
            <SelectCustomerModal isOpen={isSelectCustomerOpen} onClose={() => setIsSelectCustomerOpen(false)} onSelect={handleSelectCustomer} />
        </>
    );
};
