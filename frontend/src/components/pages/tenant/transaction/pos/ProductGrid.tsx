"use client";

import { useMemo } from "react";
import { useProducts } from "@/hooks/tenant/useProducts";
import { ProductCard } from "./ProductCard";
import { ProductItem } from "@/types/tenant/pos";

interface ProductGridProps {
    searchQuery?: string;
    categoryFilter?: string;
    onAddToCart: (product: ProductItem) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
    searchQuery = "", 
    categoryFilter = "", 
    onAddToCart 
}) => {
    // Fetch data produk dari backend menggunakan hook yang kamu sediakan
    const { data: productsResponse, isLoading, isError } = useProducts({
        per_page: 100, // Ambil cukup banyak untuk POS
        is_active: true,
        search: searchQuery,
        category: categoryFilter,
    });

    // Mapping data backend (ProductData) ke format ProductItem untuk UI
    const products: ProductItem[] = useMemo(() => {
        const rawProducts = productsResponse ?? [];
        const productList = Array.isArray(rawProducts) ? rawProducts : [];

        return productList.map((p: any) => ({
            type: "product" as const,
            id: String(p.id),
            name: String(p.name),
            image: p.image_url || p.image || "/images/placeholder.svg",
            category: p.category?.name || p.category || "General", 
            sellingPrice: Number(p.selling_price || p.price || 0),
            stock: Number(p.stock || 0),
        }));
    }, [productsResponse]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-pulse text-gray-500 font-medium">Memuat produk...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="text-red-500 font-medium">Gagal memuat produk.</div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 w-full border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-gray-400 font-medium">Tidak ada produk ditemukan.</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                />
            ))}
        </div>
    );
};