"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";

import { TenantBranchUpdateRequest } from "@/types/central/tenant-branches";
import { useTenantBranch, useUpdateTenantBranch } from "@/hooks/useTenantBranches";

/* =====================================
 * FORM SHAPE
 * ===================================== */
interface BranchFormData {
    branch_code: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    timezone: string;
    opened_at: string;
    is_active: boolean;
}

export default function BranchDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: branch, isLoading, isError } = useTenantBranch(id);
    const updateMutation = useUpdateTenantBranch();

    const form = useForm<BranchFormData>({
        mode: "onChange",
    });

    /* =====================================
     * SET DEFAULT VALUE DARI API
     * ===================================== */
    useEffect(() => {
        if (!branch) return;

        form.reset({
            branch_code: branch.branch_code,
            name: branch.name,
            address: branch.address ?? "",
            city: branch.city ?? "",
            phone: branch.phone ?? "",
            email: branch.email ?? "",
            timezone: branch.timezone ?? "",
            opened_at: branch.opened_at
                ? new Date(branch.opened_at).toISOString().split("T")[0]
                : "",
            is_active: branch.is_active,
        });
    }, [branch, form]);

    if (isLoading || !branch) return <div className="p-6">Memuat...</div>;
    if (isError) return notFound();

    /* =====================================
     * SAVE UPDATE
     * ===================================== */
    const handleSave = async () => {
        try {
            const formData = form.getValues();

            const payload: TenantBranchUpdateRequest = {
                branch_code: formData.branch_code,
                name: formData.name,
                address: formData.address || null,
                city: formData.city || null,
                phone: formData.phone || null,
                email: formData.email || null,
                timezone: formData.timezone || null,
                opened_at: formData.opened_at || null,
                is_active: formData.is_active,
            };

            await updateMutation.mutateAsync({ id, payload });

            router.push("/owner/branches?success=true");
            setIsEditMode(false);
        } catch (error: any) {

            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Gagal mengubah data cabang";

            toast.error(message);
        }
    };

    const handleCancel = () => {
        form.reset({
            branch_code: branch.branch_code,
            name: branch.name,
            address: branch.address ?? "",
            city: branch.city ?? "",
            phone: branch.phone ?? "",
            email: branch.email ?? "",
            timezone: branch.timezone ?? "",
            opened_at: branch.opened_at
                ? new Date(branch.opened_at).toISOString().split("T")[0]
                : "",
            is_active: branch.is_active,
        });
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Cabang & Langganan</li>
                            <li>
                                <Link href="/owner/branches">Cabang</Link>
                            </li>
                            <li className="text-aksen-secondary">{branch.name}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/owner/branches">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <h1 className="text-2xl font-semibold">Detail Cabang</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton
                                type="button"
                                iconName="edit"
                                className="bg-aksen-secondary text-white px-4 py-2.5"
                                onClick={() => setIsEditMode(true)}
                            >
                                Ubah Data
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton
                                    type="button"
                                    className="border px-4 py-2.5"
                                    onClick={handleCancel}
                                >
                                    Batal
                                </CustomButton>
                                <CustomButton
                                    type="button"
                                    className="bg-aksen-secondary text-white px-4 py-2.5"
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="flex flex-col gap-5 mt-6">
                        {/* BASIC INFO */}
                        <h2 className="text-lg font-semibold text-gray-800">Informasi Dasar</h2>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Nama Cabang" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="branch_code" label="Kode Cabang" disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="email" label="Email" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="phone" label="Nomor Telepon" disabled={!isEditMode} />
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="city" label="Kota" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="address" label="Alamat" disabled={!isEditMode} />
                            </div>
                        </div>
                        <hr />

                        {/* OTHER */}
                        <h2 className="text-lg font-semibold text-gray-800">Pengaturan</h2>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput
                                    name="opened_at"
                                    label="Tanggal Dibuka"
                                    type="date"
                                    disabled={!isEditMode}
                                />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="timezone" label="Zona Waktu" disabled={!isEditMode} />
                            </div>
                            <label className="flex items-center gap-2 col-span-4">
                                <input
                                    type="checkbox"
                                    {...form.register("is_active")}
                                    disabled={!isEditMode}
                                />
                                <span>Aktif</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}