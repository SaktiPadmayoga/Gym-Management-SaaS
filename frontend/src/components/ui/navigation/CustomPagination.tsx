"use client";

import { Icon } from "@/components/icon";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface CustomPaginationProps {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
}

export default function CustomPagination({ hasNextPage, hasPrevPage, totalItems }: CustomPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const page = Number(searchParams.get("page")) || 1;
    const per_page = Number(searchParams.get("per_page")) || 10;
    const totalPages = totalItems ? Math.ceil(totalItems / per_page) : 1;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        params.set("per_page", per_page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const pagesToShow: number[] = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
        if (i >= 1 && i <= totalPages) {
            pagesToShow.push(i);
        }
    }

    return (
        <div className="flex items-center gap-2 font-figtree">
            {/* First page button "<<" */}
            {page > 1 && (
                <button
                    className={`flex h-9 w-9 transform items-center justify-center rounded-lg duration-300 ${
                        page <= 1 ? "cursor-not-allowed bg-[#B8B8B8] text-white opacity-50" : "hover:bg-geonet-blue cursor-pointer bg-[#B8B8B8] text-white"
                    }`}
                    onClick={() => handlePageChange(1)}
                >
                    <div className="flex flex-row -space-x-3">
                        <Icon name="arrowLeft" className="h-4.5 w-4.5" />
                        <Icon name="arrowLeft" className="h-4.5 w-4.5" />
                    </div>
                </button>
            )}

            {/* Previous page button "<" */}
            {page > 1 && (
                <button
                    className={`flex h-9 w-9 transform items-center justify-center rounded-lg duration-300 ${
                        page <= 1 ? "cursor-not-allowed bg-[#B8B8B8] text-white opacity-50" : "hover:bg-geonet-blue cursor-pointer bg-[#B8B8B8] text-white"
                    }`}
                    onClick={() => handlePageChange(page - 1)}
                >
                    <Icon name="arrowLeft" className="h-4.5 w-4.5" />
                </button>
            )}

            {/* Page buttons */}
            {pagesToShow.map((p) => (
                <button
                    key={p}
                    className={`text-geonet-black h-9 w-9 transform rounded-lg text-sm duration-300 ${
                        p === page ? "text-geonet-blue border-geonet-blue bg-geonet-soft-blue border" : "border-geonet-soft-gray hover:text-geonet-blue hover:border-geonet-blue cursor-pointer border bg-white hover:border"
                    }`}
                    onClick={() => handlePageChange(p)}
                >
                    {p.toString().padStart(2, "0")}
                </button>
            ))}

            {/* Next page button ">" */}
            {page < totalPages && (
                <button
                    className={`flex h-9 w-9 transform items-center justify-center rounded-lg duration-300 ${
                        page >= totalPages ? "cursor-not-allowed bg-[#B8B8B8] text-white opacity-50" : "hover:bg-geonet-blue cursor-pointer bg-[#B8B8B8] text-white"
                    }`}
                    onClick={() => handlePageChange(page + 1)}
                >
                    <Icon name="arrowRight" className="h-4.5 w-4.5" />
                </button>
            )}

            {/* Last page button ">>" */}
            {page < totalPages && (
                <button
                    className={`flex h-9 w-9 transform items-center justify-center rounded-lg duration-300 ${
                        page >= totalPages ? "cursor-not-allowed bg-[#B8B8B8] text-white opacity-50" : "hover:bg-geonet-blue cursor-pointer bg-[#B8B8B8] text-white"
                    }`}
                    onClick={() => handlePageChange(totalPages)}
                >
                    <div className="flex flex-row -space-x-3">
                        <Icon name="arrowRight" className="h-4.5 w-4.5" />
                        <Icon name="arrowRight" className="h-4.5 w-4.5" />
                    </div>
                </button>
            )}
        </div>
    );
}
