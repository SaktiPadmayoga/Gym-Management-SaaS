"use client";

import Image from "next/image";
import { ProductItem } from "@/types/tenant/pos";
import { Icon } from "@/components/icon";

interface ProductCardProps {
    product: ProductItem;
    onAddToCart: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col">
            <div className="relative mb-4 h-35 w-full bg-gray-100 rounded">
                <Image
                    src={product.image ?? "/images/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                />
            </div>

            <h3 className="font-semibold text-gray-900 truncate mb-2">{product.name}</h3>

            <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {product.category}
                </span>
            </div>

            <div className="flex items-center justify-between mb-3 mt-auto">
                <span className="text-lg font-bold text-aksen-dark">
                    Rp {product.sellingPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-xs bg-aksen-secondary text-white px-2 py-1 rounded-full">
                    {product.stock} pcs
                </span>
            </div>

            <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-aksen-primary hover:bg-aksen-secondary disabled:bg-gray-300 hover:cursor-pointer text-white py-2 rounded font-semibold flex items-center justify-center gap-2 transition"
            >
                <Icon name="plus" className="h-4 w-4" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
        </div>
    );
};