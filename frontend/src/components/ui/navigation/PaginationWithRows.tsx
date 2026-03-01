"use client";

import { Icon } from "@/components/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationWithRowsProps {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
    rowOptions?: number[];
    defaultRowsPerPage?: number;
}

export default function PaginationWithRows({ hasNextPage, hasPrevPage, totalItems, rowOptions = [5, 10, 20, 50], defaultRowsPerPage = 5 }: PaginationWithRowsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const page = Number(searchParams.get("page")) || 1;
    const per_page = Number(searchParams.get("per_page")) || defaultRowsPerPage;
    const totalPages = totalItems ? Math.ceil(totalItems / per_page) : 1;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        params.set("per_page", per_page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPerPage = Number(e.target.value);
        const params = new URLSearchParams(searchParams);
        params.set("per_page", newPerPage.toString());
        params.set("page", "1");
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
        <div className="flex items-center justify-between font-figtree w-full">
            {/* Left: Rows per page selector */}
            <div className="flex items-center gap-2 text-sm">
                <div className="relative inline-block ">
                    <select value={per_page} onChange={handleRowsChange} className="border-zinc-200 text-zinc-500 appearance-none rounded-lg border bg-white px-3 py-2.5 pr-8 text-sm focus:outline-none cursor-pointer">
                        {rowOptions.map((n) => (
                            <option key={n} value={n}>
                                Show {n} rows
                            </option>
                        ))}
                    </select>

                    <div className="pointer-events-none absolute top-6.5 right-1 -translate-y-1/2">
                        <Icon name="arrowDown" className="h-6 w-6 text-zinc-500" />
                    </div>
                </div>
            </div>

            {/* Center: Page numbers */}
            <div className="flex items-center border border-zinc-300 rounded-lg bg-white">
                {pagesToShow.map((p) => (
                    <button
                        key={p}
                        className={`text-black  h-9 w-9 transform rounded-md text-sm duration-300 ${p === page ? "text-white bg-aksen-secondary" : "hover:text-zinc-700 text-zinc-500 hover:bg-zinc-200 cursor-pointer "}`}
                        onClick={() => handlePageChange(p)}
                    >
                        {p.toString().padStart(5, "")}
                    </button>
                ))}
            </div>

            {/* Right: Navigation buttons */}
            <div className="flex items-center gap-2">
                {/* First page button "<<" */}
                {page > 1 && (
                    <button
                        className="flex px-2 py-2.5 transform items-center justify-center rounded-lg duration-300 hover:bg-geonet-blue cursor-pointer bg-white text-zinc-500 border border-zinc-300 hover:bg-zinc-100"
                        onClick={() => handlePageChange(1)}
                    >
                        <div className="flex flex-row -space-x-3">
                            <Icon name="arrowLeft" className="h-4.5 w-4.5" />
                            <Icon name="arrowLeft" className="h-4.5 w-4.5" />
                        </div>
                        {/* <span className="text-sm">Start</span> */}
                    </button>
                )}

                {/* Previous page button "<" */}
                {page > 1 && (
                    <button
                        className="flex px-2.5 py-2.5 transform items-center justify-center rounded-lg duration-300 hover:bg-geonet-blue cursor-pointer bg-white text-zinc-500 border border-zinc-300 hover:bg-zinc-100"
                        onClick={() => handlePageChange(page - 1)}
                    >
                        <Icon name="arrowLeft" className="h-4.5 w-4.5" />
                    </button>
                )}

                {/* Next page button ">" */}
                {page < totalPages && (
                    <button
                        className="flex px-2.5 py-2.5 transform items-center justify-center rounded-lg duration-300 hover:bg-geonet-blue cursor-pointer bg-white text-zinc-500 border border-zinc-300 hover:bg-zinc-100"
                        onClick={() => handlePageChange(page + 1)}
                    >
                        <Icon name="arrowRight" className="h-4.5 w-4.5 text-zinc-500" />
                    </button>
                )}

                {/* Last page button ">>" */}
                {page < totalPages && (
                    <button
                        className="flex px-2 py-2.5 transform items-center justify-center rounded-lg duration-300 hover:bg-geonet-blue cursor-pointer bg-white text-zinc-500 border border-zinc-300 hover:bg-zinc-100"
                        onClick={() => handlePageChange(totalPages)}
                    >
                        {/* <span className="text-sm">End</span> */}
                        <div className="flex flex-row -space-x-3 text-zinc-500">
                            <Icon name="arrowRight" className="h-4.5 w-4.5" />
                            <Icon name="arrowRight" className="h-4.5 w-4.5" />
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
