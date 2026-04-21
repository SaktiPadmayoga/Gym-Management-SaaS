"use client";

import { useMemo } from "react";
import { useMembershipPlans } from "@/hooks/tenant/useMembershipPlans"; // Sesuaikan dengan path kamu
import { Icon } from "@/components/icon";

interface MembershipGridProps {
    searchQuery?: string;
    onAddToCart: (item: any) => void;
}

export const MembershipGrid: React.FC<MembershipGridProps> = ({ 
    searchQuery = "", 
    onAddToCart 
}) => {
    // Fetch data membership dari backend
    const { data: plansResponse, isLoading, isError } = useMembershipPlans({
        per_page: 100, 
        is_active: true,
        search: searchQuery,
    });

    // Mapping data backend ke format UI POS
    const memberships = useMemo(() => {
        // Tergantung struktur response API kamu, kadang dibungkus .data.data atau langsung array
        const rawPlans = plansResponse || [];
        const planList = Array.isArray(rawPlans) ? rawPlans : [];

        return planList.map((p: any) => ({
            type: "membership" as const,
            id: String(p.id),
            name: String(p.name),
            description: p.description || "Paket Membership",
            price: Number(p.price || 0),
            // Agar utility calcSubtotal tetap bisa membaca harga
            sellingPrice: Number(p.price || 0), 
            durationDays: p.duration_days,
        }));
    }, [plansResponse]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-pulse text-gray-500 font-medium">Memuat paket membership...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="text-red-500 font-medium">Gagal memuat paket membership.</div>
            </div>
        );
    }

    if (memberships.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 w-full border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <div className="text-gray-400 font-medium">Tidak ada paket membership ditemukan.</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {memberships.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-purple-200 bg-purple-50/30 p-5 flex flex-col hover:shadow-md transition-shadow">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                        <p className="text-xs font-medium text-purple-600 bg-purple-100 inline-block px-2 py-1 rounded">
                            {plan.durationDays ? `${plan.durationDays} Hari` : 'Lifetime / Bebas'}
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-purple-100">
                        <span className="text-xl font-bold text-aksen-dark mb-4 block">
                            Rp {plan.price.toLocaleString("id-ID")}
                        </span>
                        
                        <button
                            onClick={() => onAddToCart(plan)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};