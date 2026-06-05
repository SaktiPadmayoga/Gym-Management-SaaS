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
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<ProductDataWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useProducts({
        search: debouncedSearch,
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

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }
        if (success === "true" && !hasShownToast.current) {
            toast.success("Produk berhasil dibuat");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Produk berhasil diperbarui");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Produk berhasil dihapus");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/products");
    }, [searchParams]);

    const entries: ProductData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Gagal memuat produk");
        return <div className="py-10 text-center text-red-500">Gagal memuat produk</div>;
    }

    /* =========================
     * STOCK BADGE
     * ========================= */
    const stockBadge = (item: ProductData) => {
        if (item.is_out_of_stock) {
            return (
                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                    {item.stock} {item.unit}
                </span>
            );
        }
        if (item.is_low_stock) {
            return (
                <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                    {item.stock} {item.unit}
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                {item.stock} {item.unit}
            </span>
        );
    };

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<ProductData>[] = [
        {
            header: "Gambar",
            render: (item) => (
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.image_url ? <Image src={item.image_url} alt={item.name} width={48} height={48} className="object-cover w-full h-full" /> : <span className="text-zinc-400 text-xs">Tanpa gambar</span>}
                </div>
            ),
            width: "w-20",
        },
        {
            header: "Nama Produk",
            render: (item) => (
                <div>
                    <Link href={`/products/${item.id}`} className="font-medium text-zinc-800 hover:underline">
                        {item.name}
                    </Link>
                    {item.code && <p className="text-xs text-zinc-400">{item.code}</p>}
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Kategori",
            render: (item) => <span className="text-sm text-zinc-600">{item.category}</span>,
            width: "w-36",
        },
        {
            header: "Harga Beli",
            render: (item) => <span className="text-sm text-zinc-700">Rp {Number(item.cost_price).toLocaleString("id-ID")}</span>,
            width: "w-36",
        },
        {
            header: "Harga Jual",
            render: (item) => <span className="font-medium text-zinc-800">Rp {Number(item.selling_price).toLocaleString("id-ID")}</span>,
            width: "w-36",
        },
        {
            header: "Margin",
            render: (item) => <span className="text-sm text-zinc-600">{item.margin ?? 0}%</span>,
            width: "w-24",
        },
        {
            header: "Stok",
            render: (item) => stockBadge(item),
            width: "w-28",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium text-sm">Aktif</span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium text-sm">Tidak Aktif</span>
                ),
            width: "w-24",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<ProductData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row) => router.push(`/products/${row.id}`),
        },
        {
            label: "Ubah",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/products/${row.id}`),
        },
        {
            label: (row) => (row.is_active ? "Nonaktifkan" : "Aktifkan"),
            icon: "eye",
            onClick: (row) => {
                toggleMutation.mutate(row.id, {
                    onSuccess: () => toast.success(`Produk ${row.is_active ? "dinonaktifkan" : "diaktifkan"}`),
                    onError: () => toast.error("Gagal memperbarui status"),
                });
            },
        },
        {
            label: "Hapus",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Produk berhasil dihapus"),
                        onError: () => toast.error("Gagal menghapus produk"),
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
                            <li className="text-aksen-secondary">Produk</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Produk</h1>
                            <p className="text-zinc-500">Kelola produk gym dan inventaris Anda</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" placeholder="Cari produk..." />
                            </div>
                            <CustomButton className="px-3 py-2 text-sm text-white" iconName="plus" onClick={() => router.push("/products/create")}>
                                Produk Baru
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/products/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Menampilkan {entries.length > 0 ? 1 : 0} sampai {entries.length} dari {totalData} data
                    </div>
                    <div className="mt-4">
                        <PaginationWithRows hasNextPage={false} hasPrevPage={false} totalItems={totalData} rowOptions={[5, 10, 15, 20, 50]} defaultRowsPerPage={perPage} />
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
