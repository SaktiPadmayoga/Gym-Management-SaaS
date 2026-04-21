"use client";

import { useMemo } from "react";
// Sesuaikan lokasi import hook ini dengan struktur folder kamu
import { usePtSessionPlans } from "@/hooks/tenant/usePtSessionPlans"; 
import { Icon } from "@/components/icon";

interface PtPackageGridProps {
    searchQuery?: string;
    onAddToCart: (item: any) => void;
}

export const PtPackageGrid: React.FC<PtPackageGridProps> = ({ 
    searchQuery = "", 
    onAddToCart 
}) => {
    // Gunakan hook yang mengarah ke Katalog Master Data PT
    const { data: ptResponse, isLoading, isError } = usePtSessionPlans({
        per_page: 100, 
        is_active: true,
        search: searchQuery,
    });

    // Mapping data backend ke format UI POS
    const ptPackages = useMemo(() => {
        // Mengambil array data (menyesuaikan struktur pagination response API)
        const rawPt = ptResponse || [];
        const ptList = Array.isArray(rawPt) ? rawPt : [];

        return ptList.map((p: any) => ({
            type: "pt_package" as const,
            id: String(p.id),
            name: String(p.name || "Paket PT"),
            price: Number(p.price || 0),
            // sellingPrice dibutuhkan agar utility calcSubtotal di POS keranjang tetap berfungsi
            sellingPrice: Number(p.price || 0), 
            totalSessions: Number(p.total_sessions || p.sessions || 0),
        }));
    }, [ptResponse]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-pulse text-gray-500 font-medium">Memuat katalog paket PT...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="text-red-500 font-medium">Gagal memuat katalog paket PT.</div>
            </div>
        );
    }

    if (ptPackages.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 w-full border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <div className="text-gray-400 font-medium">Tidak ada katalog paket PT ditemukan.</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {ptPackages.map((pkg) => (
                <div key={pkg.id} className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 flex flex-col hover:shadow-md transition-shadow">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{pkg.name}</h3>
                        <p className="text-xs font-medium text-amber-700 bg-amber-100 inline-block px-2 py-1 rounded">
                            {pkg.totalSessions} Sesi Latihan
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-amber-100">
                        <span className="text-xl font-bold text-aksen-dark mb-4 block">
                            Rp {pkg.price.toLocaleString("id-ID")}
                        </span>
                        
                        <button
                            onClick={() => onAddToCart(pkg)}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
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