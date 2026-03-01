// File: src/components/pos/SelectCustomerModal.tsx
"use client";

import { useState, useMemo } from "react";
import { DEFAULT_WALK_IN_CUSTOMER } from "@/lib/constans/pos";
// import { ProfileData } from "@/lib/dummy/profileDummy"; // Import profile data

interface SimpleCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: "walk-in" | "registered";
}

interface SelectCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (customer: SimpleCustomer) => void;
}

export const SelectCustomerModal: React.FC<SelectCustomerModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState("");

    // Convert ProfileData to SimpleCustomer format
    // const profileCustomers: SimpleCustomer[] = ProfileData.map((profile) => ({
    //     id: profile.id,
    //     name: profile.name,
    //     email: profile.email,
    //     phone: profile.phone.toString(),
    //     type: "registered" as const,
    // }));

    // Combine profile customers with walk-in option
    const allCustomers: SimpleCustomer[] = [
        {
            id: DEFAULT_WALK_IN_CUSTOMER.id,
            name: DEFAULT_WALK_IN_CUSTOMER.name,
            email: DEFAULT_WALK_IN_CUSTOMER.email,
            phone: DEFAULT_WALK_IN_CUSTOMER.phone,
            type: "walk-in",
        },
        // ...profileCustomers,
    ];

    // Filter customers based on search
    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) {
            return allCustomers;
        }

        const query = searchQuery.toLowerCase();
        return allCustomers.filter((customer) => customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query) || customer.phone.includes(query));
    }, [searchQuery]);

    const handleSelectCustomer = (customer: SimpleCustomer) => {
        onSelect(customer);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/50 transition-all duration-300 ease-in-out" onClick={onClose} aria-hidden="true" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto ">
                <div className="flex h-[88vh] absolute right-0 top-17 p-4 mt-6">
                    <div className="relative w-full sm:max-w-xs rounded-xl bg-white shadow-2xl transition-all duration-300 ease-in-out" role="dialog" aria-modal="true">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👤</span>
                                <h2 className="text-lg font-bold text-gray-900">Select Customer</h2>
                            </div>
                            <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                Cancel
                            </button>
                        </div>
                        {/* Content */}
                        <div className="max-h-[75vh] overflow-y-auto px-4 py-4 space-y-4">
                            {/* Search Input */}
                            <div>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search customers..."
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-aksen-primary focus:ring-1 focus:ring-aksen-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Customer List */}
                            <div className="space-y-3">
                                {filteredCustomers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-lg">No customers found</p>
                                        <p className="text-gray-400 text-sm">Try a different search term</p>
                                    </div>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-aksen-primary hover:bg-aksen-primary/5 transition group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-aksen-dark">{customer.name}</h3>
                                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                                    <p className="text-sm text-gray-500">+{customer.phone}</p>
                                                </div>
                                                <div className={` px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${customer.type === "walk-in" ? "bg-gray-100 text-gray-700" : "bg-aksen-secondary/20 text-aksen-secondary"}`}>
                                                    {customer.type === "walk-in" ? "Walk-in" : "Registered"}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
