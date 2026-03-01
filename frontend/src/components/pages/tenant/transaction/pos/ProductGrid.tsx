// File: src/components/pos/ProductGrid.tsx
"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/pos";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

const ITEMS_PER_PAGE = 8; // 2 rows x 4 columns

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProducts = products.slice(startIndex, endIndex);

    // Reset to page 1 when products change
    useMemo(() => {
        setCurrentPage(1);
    }, [products]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            scrollToTop();
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            scrollToTop();
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col h-full ">
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 py-4 border-t border-gray-200 ">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} products
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                        >
                            ← Previous
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => {
                                        setCurrentPage(page);
                                        scrollToTop();
                                    }}
                                    className={`w-10 h-10 rounded-lg font-medium text-sm transition ${currentPage === page ? "bg-aksen-secondary text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
