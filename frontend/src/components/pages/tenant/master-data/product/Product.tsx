"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { ProductData, ProductDataWithKeyword } from "@/types/tenant/products";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useProducts, useDeleteProduct, useToggleProduct } from "@/hooks/tenant/useProducts";
import { useDebounce } from "@/hooks/useDebounce";

export default function Products() {
    const router        = useRouter();
    const searchParams  = useSearchParams();
    const hasShownToast = useRef(false);

    const [page,    setPage]    = useState(() => Number(searchParams.get("page"))     || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<ProductDataWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue     = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useProducts({
        search:   debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteProduct();
    const toggleMutation = useToggleProduct();

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/products?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    // Toast
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) { hasShownToast.current = false; return; }
        if (success === "true" && !hasShownToast.current) { toast.success("Product created successfully"); hasShownToast.current = true; }
        if (updated === "true" && !hasShownToast.current) { toast.success("Product updated successfully"); hasShownToast.current = true; }
        if (deleted === "true" && !hasShownToast.current) { toast.success("Product deleted successfully"); hasShownToast.current = true; }

        window.history.replaceState({}, "", "/products");
    }, [searchParams]);

    const entries: ProductData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Error loading products");
        return <div className="py-10 text-center text-red-500">Error loading products</div>;
    }

    /* =========================
     * STOCK BADGE
     * ========================= */
    const stockBadge = (item: ProductData) => {
        if (item.is_out_of_stock) {
            return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">{item.stock} {item.unit}</span>;
        }
        if (item.is_low_stock) {
            return <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">{item.stock} {item.unit}</span>;
        }
        return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">{item.stock} {item.unit}</span>;
    };

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<ProductData>[] = [
        {
            header: "Image",
            render: (item) => (
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <span className="text-zinc-400 text-xs">No img</span>
                    )}
                </div>
            ),
            width: "w-20",
        },
        {
            header: "Product Name",
            render: (item) => (
                <div>
                    <Link href={`/products/${item.id}`} className="font-medium text-zinc-800 hover:underline">
                        {item.name}
                    </Link>
                    {item.sku && <p className="text-xs text-zinc-400">{item.sku}</p>}
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Category",
            render: (item) => (
                <span className="text-sm text-zinc-600">{item.category}</span>
            ),
            width: "w-36",
        },
        {
            header: "Cost Price",
            render: (item) => (
                <span className="text-sm text-zinc-700">
                    Rp {Number(item.cost_price).toLocaleString("id-ID")}
                </span>
            ),
            width: "w-36",
        },
        {
            header: "Selling Price",
            render: (item) => (
                <span className="font-medium text-zinc-800">
                    Rp {Number(item.selling_price).toLocaleString("id-ID")}
                </span>
            ),
            width: "w-36",
        },
        {
            header: "Margin",
            render: (item) => (
                <span className="text-sm text-zinc-600">{item.margin ?? 0}%</span>
            ),
            width: "w-24",
        },
        {
            header: "Stock",
            render: (item) => stockBadge(item),
            width: "w-28",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium text-sm">Active</span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium text-sm">Inactive</span>
                ),
            width: "w-24",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<ProductData>[] = [
        {
            label: "View Details",
            icon:  "eye",
            onClick: (row) => router.push(`/products/${row.id}`),
        },
        {
            label: "Edit",
            icon:  "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/products/${row.id}`),
        },
        {
            label: (row) => row.is_active ? "Deactivate" : "Activate",
            icon:  "eye",
            onClick: (row) => {
                toggleMutation.mutate(row.id, {
                    onSuccess: () => toast.success(`Product ${row.is_active ? "deactivated" : "activated"}`),
                    onError:   () => toast.error("Failed to update status"),
                });
            },
        },
        {
            label: "Delete",
            icon:  "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure you want to delete this product?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Product deleted"),
                        onError:   () => toast.error("Failed to delete product"),
                    });
                }
            },
        },
    ];

    return (
        <FormProvider {...form}>
            <div>
                <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li className="text-aksen-secondary">Products</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Products</h1>
                            <p className="text-zinc-500">Manage your gym products and inventory</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton
                                className="px-3 py-2 text-sm text-white"
                                iconName="plus"
                                onClick={() => router.push("/products/create")}
                            >
                                New Product
                            </CustomButton>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                                onRowClick={(row) => router.push(`/products/${row.id}`)}
                            />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length > 0 ? 1 : 0} to {entries.length} of {totalData} data
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={false}
                        hasPrevPage={false}
                        totalItems={totalData}
                        rowOptions={[5, 10, 20, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>
        </FormProvider>
    );
}