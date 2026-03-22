"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useState } from "react";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import { useCreateProduct } from "@/hooks/tenant/useProducts";
import { ProductUpdateRequest } from "@/types/tenant/products";

/* =========================
 * FORM TYPE
 * ========================= */

interface CreateProductFormData {
    name:          string;
    sku:           string;
    category:      string;
    description:   string;
    selling_price: number;
    cost_price:    number;
    stock:         number;
    min_stock:     number;
    unit:          string;
    is_active:     boolean;
}

const unitOptions: DropdownOption<string>[] = [
    { key: "pcs",    label: "Pcs",    value: "pcs"    },
    { key: "box",    label: "Box",    value: "box"    },
    { key: "bottle", label: "Bottle", value: "bottle" },
    { key: "sachet", label: "Sachet", value: "sachet" },
    { key: "kg",     label: "Kg",     value: "kg"     },
    { key: "liter",  label: "Liter",  value: "liter"  },
];

export default function CreateProduct() {
    const router         = useRouter();
    const createMutation = useCreateProduct();
    const { branchId }   = useBranch();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile,    setImageFile]    = useState<File | undefined>(undefined);

    const form = useForm<CreateProductFormData>({
        mode: "onChange",
        defaultValues: {
            name:          "",
            sku:           "",
            category:      "",
            description:   "",
            selling_price: 0,
            cost_price:    0,
            stock:         0,
            min_stock:     0,
            unit:          "pcs",
            is_active:     true,
        },
    });

    const sellingPrice = useWatch({ control: form.control, name: "selling_price" }) ?? 0;
    const costPrice    = useWatch({ control: form.control, name: "cost_price" })    ?? 0;
    const stock        = useWatch({ control: form.control, name: "stock" })         ?? 0;

    const profitAmount     = sellingPrice - costPrice;
    const profitPct        = costPrice > 0 ? ((profitAmount / costPrice) * 100).toFixed(2) : "0";
    const potentialRevenue = sellingPrice * stock;

    const onSubmit = async (formData: CreateProductFormData) => {
        try {
            const payload: ProductUpdateRequest = {
                name:          formData.name,
                sku:           formData.sku           || undefined,
                category:      formData.category,
                description:   formData.description   || undefined,
                selling_price: formData.selling_price,
                cost_price:    formData.cost_price,
                stock:         formData.stock,
                min_stock:     formData.min_stock,
                unit:          formData.unit,
                is_active:     formData.is_active,
                branch_id:     branchId ?? undefined,
            };

            await createMutation.mutateAsync({ payload, imageFile });
            toast.success("Product created successfully");
            router.push("/products?success=true");
        } catch (err) {
            toast.error("Failed to create product");
            console.error(err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li><Link href="/products">Products</Link></li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/products")}>
                                <Icon name="back" className="h-7 w-7" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Product</h1>
                        </div>
                        <CustomButton
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">

                        {/* NAME & CATEGORY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Product Name" placeholder="Enter product name" />
                            </div>
                            <div className="col-span-3">
                                <TextInput name="category" label="Category" placeholder="e.g Supplements" />
                            </div>
                            <div className="col-span-3">
                                <TextInput name="sku" label="SKU (optional)" placeholder="e.g WP-001" />
                            </div>
                        </div>

                        {/* PRICES & STOCK */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="cost_price"    label="Cost Price (Rp)"    />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="selling_price" label="Selling Price (Rp)" />
                            </div>
                            <div className="col-span-2">
                                <NumberInput name="stock"         label="Initial Stock"      />
                            </div>
                            <div className="col-span-2">
                                <NumberInput name="min_stock"     label="Min Stock Alert"    />
                            </div>
                            <div className="col-span-2">
                                <SearchableDropdown name="unit" label="Unit" options={unitOptions} />
                            </div>
                        </div>

                        {/* DESCRIPTION & IMAGE */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Description (optional)
                                </label>
                                <textarea
                                    {...form.register("description")}
                                    placeholder="Enter product description..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:border-aksen-secondary focus:ring-2 focus:ring-aksen-secondary/10 transition resize-none text-sm"
                                />
                            </div>

                            {/* IMAGE UPLOAD */}
                            <div className="col-span-6">
                                <p className="block text-sm font-medium text-zinc-700 mb-1">Product Image</p>
                                <div className="border border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.webp"
                                        id="product-image-upload"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />

                                    {!previewImage ? (
                                        <label htmlFor="product-image-upload" className="flex flex-col items-center cursor-pointer">
                                            <ArchiveBoxIcon className="h-8 w-8 text-aksen-secondary mb-2" />
                                            <p className="text-aksen-secondary font-medium text-sm">Drop or upload file</p>
                                            <p className="text-zinc-400 text-xs mt-1">PNG, JPG, JPEG, WEBP — max 2MB</p>
                                        </label>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="h-20 w-20 object-cover rounded-lg border border-zinc-200"
                                            />
                                            <div className="flex items-center gap-3 text-sm">
                                                <label htmlFor="product-image-upload" className="text-blue-600 cursor-pointer hover:underline">
                                                    Reupload
                                                </label>
                                                <span className="text-zinc-300">|</span>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:underline"
                                                    onClick={() => { setPreviewImage(null); setImageFile(undefined); }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PROFIT PREVIEW */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4 p-4 bg-gray-100 rounded-lg border border-zinc-200">
                                <p className="text-sm text-zinc-500 mb-1">Profit per Unit</p>
                                <p className="text-2xl font-bold text-zinc-800">
                                    Rp {Math.max(0, profitAmount).toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="col-span-4 p-4 bg-gray-100 rounded-lg border border-zinc-200">
                                <p className="text-sm text-zinc-500 mb-1">Profit Margin</p>
                                <p className="text-2xl font-bold text-aksen-secondary">{profitPct}%</p>
                            </div>
                            <div className="col-span-4 p-4 bg-gray-100 rounded-lg border border-zinc-200">
                                <p className="text-sm text-zinc-500 mb-1">Potential Revenue</p>
                                <p className="text-2xl font-bold text-zinc-800">
                                    Rp {potentialRevenue.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>

                        {/* ACTIVE */}
                        <div className="flex items-center gap-3 text-gray-800">
                            <input type="checkbox" className="checkbox checkbox-sm" {...form.register("is_active")} />
                            <span className="text-sm font-medium">Active</span>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}