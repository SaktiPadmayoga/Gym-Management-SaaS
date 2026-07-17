"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useProduct, useUpdateProduct, useToggleProduct, useAddStock, useAdjustStock, useStockHistory } from "@/hooks/tenant/useProducts";
import { ProductUpdateRequest, StockMovementData } from "@/types/tenant/products";

/* =========================
 * OPTIONS
 * ========================= */

const unitOptions: DropdownOption<string>[] = [
    { key: "pcs", label: "Pcs", value: "pcs" },
    { key: "box", label: "Boks", value: "box" },
    { key: "bottle", label: "Botol", value: "bottle" },
    { key: "sachet", label: "Sachet", value: "sachet" },
    { key: "kg", label: "Kg", value: "kg" },
    { key: "liter", label: "Liter", value: "liter" },
];

const movementTypeColor: Record<string, string> = {
    purchase: "bg-green-100 text-green-700",
    sale: "bg-blue-100 text-blue-700",
    adjustment: "bg-orange-100 text-orange-700",
    return: "bg-purple-100 text-purple-700",
    transfer: "bg-zinc-100 text-zinc-600",
};

const movementTypeLabel: Record<string, string> = {
    purchase: "Pembelian/Restok",
    sale: "Penjualan",
    adjustment: "Penyesuaian",
    return: "Retur",
    transfer: "Transfer",
};

/* =========================
 * FORM TYPE
 * ========================= */

interface ProductFormData {
    name: string;
    code: string;
    category: string;
    description: string;
    selling_price: number;
    cost_price: number;
    min_stock: number;
    unit: string;
    is_active: boolean;
}

export default function ProductDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);
    const [showAddStock, setShowAddStock] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);
    const [addQty, setAddQty] = useState(1);
    const [addNotes, setAddNotes] = useState("");
    const [adjustQty, setAdjustQty] = useState(0);
    const [adjustNotes, setAdjustNotes] = useState("");

    const { data: product, isLoading, isError } = useProduct(id);
    const { data: historyData } = useStockHistory(id);
    const updateMutation = useUpdateProduct();
    const toggleMutation = useToggleProduct();
    const addStockMut = useAddStock();
    const adjustStockMut = useAdjustStock();

    const form = useForm<ProductFormData>({ mode: "onChange" });

    const sellingPrice = useWatch({ control: form.control, name: "selling_price" }) ?? 0;
    const costPrice = useWatch({ control: form.control, name: "cost_price" }) ?? 0;
    const profitAmount = sellingPrice - costPrice;
    const profitPct = costPrice > 0 ? ((profitAmount / costPrice) * 100).toFixed(2) : "0";

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!product) return;
        setAdjustQty(product.stock);
        form.reset({
            name: product.name,
            code: product.code ?? "",
            category: product.category,
            description: product.description ?? "",
            selling_price: Number(product.selling_price),
            cost_price: Number(product.cost_price),
            min_stock: product.min_stock,
            unit: product.unit,
            is_active: product.is_active,
        });
    }, [product]);

    if (isLoading) return <div className="p-6">Memuat...</div>;
    if (isError) return notFound();

    const movements: StockMovementData[] = historyData?.data ?? historyData ?? [];

    /* =========================
     * SAVE
     * ========================= */
    const handleSave = async (formData: ProductFormData) => {
        try {
            const payload: ProductUpdateRequest = {
                name: formData.name,
                code: formData.code || undefined,
                category: formData.category,
                description: formData.description || undefined,
                selling_price: formData.selling_price,
                cost_price: formData.cost_price,
                min_stock: formData.min_stock,
                unit: formData.unit,
                is_active: formData.is_active,
            };

            await updateMutation.mutateAsync({ id, payload, imageFile });
            toast.success("Produk berhasil diperbarui");
            setIsEditMode(false);
            setImageFile(undefined);
            router.push("/products?updated=true");
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || "Gagal memperbarui produk";
            toast.error(message);
        }
    };

    const handleCancel = () => {
        if (!product) return;
        setImageFile(undefined);
        setPreviewImage(null);
        form.reset({
            name: product.name,
            code: product.code ?? "",
            category: product.category,
            description: product.description ?? "",
            selling_price: Number(product.selling_price),
            cost_price: Number(product.cost_price),
            min_stock: product.min_stock,
            unit: product.unit,
            is_active: product.is_active,
        });
        setIsEditMode(false);
    };

    const handleAddStock = async () => {
        if (addQty < 1) return;
        await addStockMut.mutateAsync(
            { id, payload: { qty: addQty, notes: addNotes || undefined } },
            {
                onSuccess: () => {
                    toast.success("Stok berhasil ditambahkan");
                    setShowAddStock(false);
                    setAddQty(1);
                    setAddNotes("");
                },
                onError: () => toast.error("Gagal menambahkan stok"),
            },
        );
    };

    const handleAdjustStock = async () => {
        await adjustStockMut.mutateAsync(
            { id, payload: { new_qty: adjustQty, notes: adjustNotes || undefined } },
            {
                onSuccess: () => {
                    toast.success("Stok berhasil disesuaikan");
                    setShowAdjust(false);
                    setAdjustNotes("");
                },
                onError: () => toast.error("Gagal menyesuaikan stok"),
            },
        );
    };

    return (
        <FormProvider {...form}>
            <Toaster position="top-center" />
            <form onSubmit={form.handleSubmit(handleSave)}>
                <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/products">Produk</Link>
                            </li>
                            <li className="text-aksen-secondary">{product?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/products")}>
                                <Icon name="back" className="h-7 w-7" />
                            </button>
                            <h1 className="text-2xl font-semibold">Detail Produk</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <CustomButton
                                type="button"
                                className={`border px-3 py-2 text-sm ${product?.is_active ? "text-white bg-red-500 border-red-500" : "text-green-600 border-green-200"}`}
                                onClick={() =>
                                    toggleMutation.mutate(id, {
                                        onSuccess: () => toast.success(`Produk berhasil ${product?.is_active ? "dinonaktifkan" : "diaktifkan"}`),
                                        onError: () => toast.error("Gagal mengubah status produk"),
                                    })
                                }
                                disabled={toggleMutation.isPending}
                            >
                                {product?.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </CustomButton>

                            {!isEditMode ? (
                                <CustomButton iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" type="button" onClick={() => setIsEditMode(true)}>
                                    Ubah
                                </CustomButton>
                            ) : (
                                <div className="flex gap-2">
                                    <CustomButton type="button" className="border py-2.5 px-4" onClick={handleCancel}>
                                        Batal
                                    </CustomButton>
                                    <CustomButton type="submit" className="bg-aksen-secondary text-white py-2.5 px-4" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                                    </CustomButton>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* NAME, CATEGORY, code */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Nama Produk" disabled={!isEditMode} rules={{ required: "Nama produk wajib diisi" }} />
                            </div>
                            <div className="col-span-3">
                                <TextInput name="category" label="Kategori" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <TextInput name="code" label="Kode/SKU" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* PRICES */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="cost_price" label="Harga Beli (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="selling_price" label="Harga Jual (Rp)" disabled={!isEditMode} rules={{ required: "Harga jual wajib diisi", min: { value: 0, message: "Harga jual tidak boleh negatif" } }} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="min_stock" label="Peringatan Stok Minim" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="unit" label="Satuan" options={unitOptions} disabled={!isEditMode} rules={{ required: "Satuan wajib diisi" }} />
                            </div>
                        </div>

                        {/* DESCRIPTION & IMAGE */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Deskripsi</label>
                                <textarea {...form.register("description")} disabled={!isEditMode} rows={4} className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm resize-none disabled:bg-zinc-50 disabled:text-zinc-400" />
                            </div>

                            {/* IMAGE */}
                            <div className="col-span-6">
                                <p className="block text-sm font-medium text-zinc-700 mb-1">Gambar Produk</p>
                                <div className="border border-zinc-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                                    {!previewImage && product?.image_url ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <img src={product.image_url} alt={product.name} className="h-20 w-20 object-cover rounded-lg border border-zinc-200" />
                                            {isEditMode && (
                                                <label htmlFor="product-image-edit" className="text-blue-600 text-sm cursor-pointer hover:underline">
                                                    Ubah Gambar
                                                </label>
                                            )}
                                        </div>
                                    ) : previewImage ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <img src={previewImage} alt="Pratinjau" className="h-20 w-20 object-cover rounded-lg border border-zinc-200" />
                                            {isEditMode && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <label htmlFor="product-image-edit" className="text-blue-600 cursor-pointer hover:underline">
                                                        Unggah Ulang
                                                    </label>
                                                    <span className="text-zinc-300">|</span>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:underline"
                                                        onClick={() => {
                                                            setPreviewImage(null);
                                                            setImageFile(undefined);
                                                        }}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label htmlFor="product-image-edit" className={`flex flex-col items-center ${isEditMode ? "cursor-pointer" : "opacity-50"}`}>
                                            <ArchiveBoxIcon className="h-8 w-8 text-aksen-secondary mb-2" />
                                            <p className="text-aksen-secondary font-medium text-sm">{isEditMode ? "Unggah gambar" : "Tanpa gambar"}</p>
                                        </label>
                                    )}
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.webp"
                                        id="product-image-edit"
                                        className="hidden"
                                        disabled={!isEditMode}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                setPreviewImage(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PROFIT PREVIEW */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4 p-4 bg-gray-100 rounded-lg border border-zinc-200">
                                <p className="text-sm text-zinc-500 mb-1">Keuntungan per Unit</p>
                                <p className="text-2xl font-bold text-zinc-800">Rp {Math.max(0, profitAmount).toLocaleString("id-ID")}</p>
                            </div>
                            <div className="col-span-4 p-4 bg-gray-100 rounded-lg border border-zinc-200">
                                <p className="text-sm text-zinc-500 mb-1">Margin Keuntungan</p>
                                <p className="text-2xl font-bold text-aksen-secondary">{profitPct}%</p>
                            </div>
                            <div className="col-span-4 p-4 bg-gray-100 rounded-lg border border-zinc-200">
                                <p className="text-sm text-zinc-500 mb-1">Stok Saat Ini</p>
                                <p className={`text-2xl font-bold ${product?.is_out_of_stock ? "text-red-600" : product?.is_low_stock ? "text-orange-500" : "text-zinc-800"}`}>
                                    {product?.stock} {product?.unit}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-800">
                            <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("is_active")} />
                            <span className="text-sm font-medium">Aktif</span>
                        </div>

                        <hr />

                        {/* STOCK MANAGEMENT */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Kelola Stok</h2>
                                <p className="text-sm text-zinc-500">Tambah stok masuk atau sesuaikan stok saat ini</p>
                            </div>
                            <div className="flex gap-2">
                                <CustomButton
                                    type="button"
                                    className="border text-zinc-700 px-3 py-2 text-sm"
                                    onClick={() => {
                                        setShowAddStock(true);
                                        setShowAdjust(false);
                                    }}
                                >
                                    + Tambah Stok
                                </CustomButton>
                                <CustomButton
                                    type="button"
                                    className="border text-zinc-700 px-3 py-2 text-sm"
                                    onClick={() => {
                                        setShowAdjust(true);
                                        setShowAddStock(false);
                                    }}
                                >
                                    Sesuaikan Stok
                                </CustomButton>
                            </div>
                        </div>

                        {/* ADD STOCK FORM */}
                        {showAddStock && (
                            <div className="rounded-lg border border-zinc-200 p-4 space-y-3">
                                <p className="font-medium text-zinc-800">Tambah Stok (Stok Masuk)</p>
                                <div className="grid grid-cols-12 gap-3 items-end">
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Jumlah</label>
                                        <input type="number" min={1} value={addQty} onChange={(e) => setAddQty(Number(e.target.value))} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Catatan (opsional)</label>
                                        <input type="text" placeholder="Misal: Restok dari pemasok" value={addNotes} onChange={(e) => setAddNotes(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="col-span-3 flex gap-2">
                                        <CustomButton type="button" className="border px-3 py-2 text-sm" onClick={() => setShowAddStock(false)}>
                                            Batal
                                        </CustomButton>
                                        <CustomButton type="button" className="bg-aksen-secondary text-white px-3 py-2 text-sm" onClick={handleAddStock} disabled={addStockMut.isPending}>
                                            {addStockMut.isPending ? "Menyimpan..." : "Simpan"}
                                        </CustomButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ADJUST STOCK FORM */}
                        {showAdjust && (
                            <div className="rounded-lg border border-zinc-200 p-4 space-y-3">
                                <p className="font-medium text-zinc-800">Sesuaikan Stok (Koreksi Manual)</p>
                                <p className="text-xs text-zinc-400">
                                    Stok saat ini: {product?.stock} {product?.unit}
                                </p>
                                <div className="grid grid-cols-12 gap-3 items-end">
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Jumlah Baru</label>
                                        <input type="number" min={0} value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Alasan / Keterangan</label>
                                        <input
                                            type="text"
                                            placeholder="Misal: Koreksi stock opname"
                                            value={adjustNotes}
                                            onChange={(e) => setAdjustNotes(e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3 flex gap-2">
                                        <CustomButton type="button" className="border px-3 py-2 text-sm" onClick={() => setShowAdjust(false)}>
                                            Batal
                                        </CustomButton>
                                        <CustomButton type="button" className="bg-aksen-secondary text-white px-3 py-2 text-sm" onClick={handleAdjustStock} disabled={adjustStockMut.isPending}>
                                            {adjustStockMut.isPending ? "Menyimpan..." : "Simpan"}
                                        </CustomButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STOCK HISTORY */}
                        <div>
                            <h3 className="text-base font-semibold text-zinc-800 mb-3">Riwayat Stok</h3>
                            {movements.length === 0 ? (
                                <p className="text-sm text-zinc-400">Belum ada riwayat pergerakan stok.</p>
                            ) : (
                                <div className="space-y-2">
                                    {movements.slice(0, 10).map((m) => (
                                        <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${movementTypeColor[m.type] ?? "bg-zinc-100 text-zinc-600"}`}>{movementTypeLabel[m.type] ?? m.type}</span>
                                                <span className={`text-sm font-medium ${m.is_incoming ? "text-green-600" : "text-red-600"}`}>
                                                    {m.is_incoming ? "+" : ""}
                                                    {m.qty_change}
                                                </span>
                                                {m.notes && <span className="text-xs text-zinc-400">{m.notes}</span>}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                <span>
                                                    {m.qty_before} → {m.qty_after}
                                                </span>
                                                <span>{m.created_at ? new Date(m.created_at).toLocaleDateString("id-ID") : "-"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
