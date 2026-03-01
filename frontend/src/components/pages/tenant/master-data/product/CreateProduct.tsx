// File: src/app/products/new/page.tsx
"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput, TextAreaInput } from "@/components/ui/input/Input";
import { ProductData } from "@/types/product";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export default function CreateProduct() {
    const router = useRouter();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const form = useForm<ProductData>({
        mode: "onChange",
        defaultValues: {
            id: "",
            name: "",
            sellingPrice: 0,
            costPrice: 0,
            stock: 0,
            category: "",
            image: "",
            description: "",
        },
    });

    const onSubmit = (data: ProductData) => {
        console.log("Product Data:", data);
        router.push("/product?success=true");
    };

    const categoryOptions: DropdownOption<string>[] = [
        { key: "supplements", label: "Supplements", value: "Supplements" },
        { key: "accessories", label: "Accessories", value: "Accessories" },
        { key: "equipment", label: "Equipment", value: "Equipment" },
        { key: "merchandise", label: "Merchandise", value: "Merchandise" },
        { key: "services", label: "Services", value: "Services" },
    ];

    const watchedFields = form.watch(["id", "name", "sellingPrice", "costPrice", "stock", "category"]);
    const [id, name, sellingPrice, costPrice, stock, category] = watchedFields;

    const isFormValid = id && name && sellingPrice && costPrice && stock !== undefined && category;

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className={`font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4`}>
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/product">Product</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex flex-row items-center justify-center gap-2 text-aksen-dark">
                            <button onClick={() => router.push("/product")} type="button" className="hover:cursor-pointer">
                                <Icon name="back" className="h-7 w-7" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Create Product</h1>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <CustomButton className={`px-4 py-2.5 text-white ${isFormValid ? "bg-aksen-secondary" : "cursor-not-allowed bg-gray-400"}`} type="submit" disabled={!isFormValid}>
                                Create and save
                            </CustomButton>
                        </div>
                    </div>

                    <hr className="text-geonet-soft-gray" />

                    <div className="flex flex-col">
                        {/* Product ID and Name */}
                        <div className="mt-5 grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Product Name" placeholder="Enter product name" />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="category" label="Category" placeholder="Select a category..." options={categoryOptions} isSearchable={true} isClearable={true} />
                            </div>
                        </div>

                        {/* Prices and Stock */}
                        <div className="mt-5 grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="costPrice" label="Cost Price (Rp)" placeholder="Enter cost price" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="sellingPrice" label="Selling Price (Rp)" placeholder="Enter selling price" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="stock" label="Stock (units)" placeholder="Enter stock quantity" />
                            </div>
                        </div>

                        {/* Image URL & Description */}
                        <div className="mt-5 grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Description (Optional)</label>
                                <textarea
                                    {...form.register("description")}
                                    placeholder="Enter product description..."
                                    className="w-full px-4 py-3 border border-geonet-soft-gray rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-none"
                                    rows={4}
                                />
                            </div>
                            {/* Upload Photo */}
                            <div className=" col-span-6">
                                <p className="text-geonet-black mb-2 text-sm font-medium">Upload Photo</p>

                                <div className="border-geonet-soft-gray flex flex-col items-center justify-center rounded-lg border  p-6 text-center">
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.webp"
                                        id="file-upload-photo"
                                        className="hidden"
                                        {...form.register("image", {
                                            onChange: (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    form.setValue("image", file);
                                                    setPreviewImage(URL.createObjectURL(file));
                                                }
                                            },
                                        })}
                                    />

                                    {!previewImage && (
                                        <label htmlFor="file-upload-photo" className="flex cursor-pointer flex-col items-center">
                                            <ArchiveBoxIcon className="h-7 w-7 text-aksen-secondary" />
                                            <p className="text-aksen-secondary font-medium">Drop or upload file</p>
                                            <p className="text-geonet-gray text-sm">Max. [x] mb, and file type PNG, JPG, JPEG, WEBP</p>
                                        </label>
                                    )}

                                    {previewImage && (
                                        <div className="flex flex-col items-center">
                                            <img src={previewImage} alt="Preview" className="mb-4 h-16 w-16 object-cover" />

                                            <div className="flex items-center">
                                                <label htmlFor="file-upload-photo" className="text-geonet-blue cursor-pointer px-1 pt-2 text-sm font-semibold">
                                                    Reupload
                                                </label>
                                                <p className="text-geonet-soft-gray">|</p>

                                                <button
                                                    type="button"
                                                    className="text-geonet-red cursor-pointer px-1 pt-2 text-sm font-semibold"
                                                    onClick={() => {
                                                        setPreviewImage(null);
                                                        form.setValue("image", undefined);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profit Margin Display */}
                        <div className="mt-5 grid grid-cols-12 gap-3">
                            <div className="col-span-4  p-4 h-30 bg-gray-100 rounded-lg border border-geonet-soft-gray">
                                <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                                <p className="text-2xl font-bold text-aksen-primary">Rp {form.watch("sellingPrice") - form.watch("costPrice") > 0 ? (form.watch("sellingPrice") - form.watch("costPrice")).toLocaleString("id-ID") : "0"}</p>
                            </div>
                            <div className="col-span-4  p-4 h-30 bg-gray-100 rounded-lg border border-geonet-soft-gray">
                                <p className="text-sm text-gray-600 mb-1">Profit Percentage</p>
                                <p className="text-2xl font-bold text-aksen-secondary">{form.watch("costPrice") > 0 ? (((form.watch("sellingPrice") - form.watch("costPrice")) / form.watch("costPrice")) * 100).toFixed(2) : "0"}%</p>
                            </div>
                            <div className="col-span-4  p-4 h-30 bg-gray-100 rounded-lg border border-geonet-soft-gray">
                                <p className="text-sm text-gray-600 mb-1">Total Potential Revenue</p>
                                <p className="text-2xl font-bold text-aksen-dark">Rp {(form.watch("sellingPrice") * form.watch("stock")).toLocaleString("id-ID")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
