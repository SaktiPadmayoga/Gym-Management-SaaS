// File: src/app/products/page.tsx
"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { ProductData, ProductDataWithKeyword } from "@/types/product";
import { DUMMY_PRODUCTS } from "@/lib/dummy/productDummy";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

export default function Products() {
    const router = useRouter();
    const form = useForm<ProductDataWithKeyword>({
        defaultValues: {
            keyword: "",
        },
    });
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const keyword = form.watch("keyword") || "";

    // Filter products based on keyword
    const filteredProducts = useMemo(() => {
        if (!keyword.trim()) {
            return DUMMY_PRODUCTS;
        }

        const lowerKeyword = keyword.toLowerCase();
        return DUMMY_PRODUCTS.filter((product) => product.name.toLowerCase().includes(lowerKeyword) || product.id.toLowerCase().includes(lowerKeyword) || product.category.toLowerCase().includes(lowerKeyword));
    }, [keyword]);

    useEffect(() => {
        if (!searchParams.get("success") && !searchParams.get("updated") && !searchParams.get("deleted")) {
            hasShownToast.current = false;
            return;
        }

        if (searchParams.get("success") === "true" && !hasShownToast.current) {
            toast.success("New product has been created successfully", {
                style: {
                    background: "green",
                    color: "white",
                },
            });
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/products");
        } else if (searchParams.get("updated") === "true" && !hasShownToast.current) {
            toast.success("Product successfully updated", {
                style: {
                    background: "green",
                    color: "white",
                },
            });
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/products");
        } else if (searchParams.get("deleted") === "true" && !hasShownToast.current) {
            toast.success("Product successfully deleted", {
                style: {
                    background: "green",
                    color: "white",
                },
            });
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/products");
        }
    }, [searchParams]);

    const columns: Column<ProductData>[] = [
        {
            header: "ID",
            render: (item) => <div className="flex items-center gap-3 truncate">{item?.id}</div>,
            width: "w-44",
        },
        {
            header: "Image",
            render: (item) => (
                <div className="flex items-center h-12 w-12 gap-3 bg-gray-300 rounded-lg truncate">
                    <Image src={(item?.image as string) || "images/placeholder.svg"} alt={item?.name || ""} width={48} height={48} className="object-cover rounded" />
                </div>
            ),
            width: "w-34",
        },
        {
            header: "Product Name",
            render: (item) => (
                <div className="flex items-center gap-3 truncate">
                    <div className=" font-medium">{item?.name}</div>
                </div>
            ),
            width: "w-74",
        },
        {
            header: "Category",
            render: (item) => <div className="flex items-center gap-3 truncate">{item?.category}</div>,
            width: "w-54",
        },
        {
            header: "Cost Price",
            render: (item) => <div className="flex items-center gap-3 truncate">Rp {item?.costPrice?.toLocaleString("id-ID")}</div>,
            width: "w-54",
        },
        {
            header: "Selling Price",
            render: (item) => <div className="flex items-center gap-3 truncate">Rp {item?.sellingPrice?.toLocaleString("id-ID")}</div>,
            width: "w-54",
        },
        {
            header: "Stock",
            render: (item) => (
                <div className="flex items-center gap-3 truncate">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item?.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item?.stock} units</span>
                </div>
            ),
            width: "w-54",
        },
    ];

    const customActions: ActionItem<ProductData>[] = [
        {
            label: "View Details",
            icon: "eye",
            onClick: (row) => {
                router.push(`/products/${row.id}`);
            },
            className: "hover:bg-zinc-100",
        },
        {
            label: "Edit",
            icon: "edit",
            onClick: (row) => {
                console.log("Edit:", row);
                router.push(`/products/${row.id}/edit`);
            },
            className: "hover:bg-blue-50 text-blue-600",
        },
        {
            label: "Delete",
            icon: "trash",
            onClick: (row) => {
                console.log("Delete:", row);
                if (confirm("Are you sure you want to delete this product?")) {
                    toast.success("Product deleted successfully");
                }
            },
            className: "hover:bg-red-50 text-red-600",
            divider: true,
        },
    ];

    const page = Number(searchParams.get("page")) || 1;
    const per_page = Number(searchParams.get("per_page")) || 5;

    const start = (page - 1) * per_page;
    const end = start + per_page;
    const entries = filteredProducts.slice(start, end);

    const showingFrom = filteredProducts.length === 0 ? 0 : start + 1;
    const showingTo = Math.min(end, filteredProducts.length);
    const totalData = filteredProducts.length;

    return (
        <FormProvider {...form}>
            <div>
                <form>
                    <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                        <Toaster
                            toastOptions={{
                                classNames: {
                                    description: "!bg-green-500",
                                },
                            }}
                            position="top-center"
                        />
                        <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                            <ul>
                                <li>Master Data</li>
                                <li>
                                    <a className="text-aksen-secondary">Products</a>
                                </li>
                            </ul>
                        </div>

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-aksen-secondary text-2xl font-semibold">Products</h1>
                                <p className="text-geonet-gray max-w-2xl mt-[-6]">Manage your products here.</p>
                            </div>

                            <div className="flex items-center justify-between flex-row gap-3">
                                <div className="w-67">
                                    <SearchInput name={"keyword"} />
                                </div>
                                <CustomButton className="px-3 py-2 text-sm text-white" iconName="plus" onClick={() => router.push("/product/create")}>
                                    New Product
                                </CustomButton>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <CustomTable
                                columns={columns}
                                data={entries}
                                onRowClick={(row) => {
                                    router.push(`/products/${row.id}`);
                                }}
                                actions={customActions}
                            />
                        </div>

                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {showingFrom} to {showingTo} of {totalData} data
                        </div>
                    </div>
                </form>

                <div className="mt-4">
                    <PaginationWithRows hasNextPage={end < filteredProducts.length} hasPrevPage={start > 0} totalItems={filteredProducts.length} rowOptions={[5, 10, 20, 50]} defaultRowsPerPage={5} />
                </div>
            </div>
        </FormProvider>
    );
}
