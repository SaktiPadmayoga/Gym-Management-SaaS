"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useClassPlan, useUpdateClassPlan, useToggleClassPlan, useDuplicateClassPlan } from "@/hooks/tenant/useClassPlans";
import { ClassPlanUpdateRequest } from "@/types/tenant/class-plans";

/* =========================
 * OPTIONS
 * ========================= */

const accessTypeOptions: DropdownOption<string>[] = [
    { key: "single_branch", label: "Satu Cabang", value: "single_branch" },
    { key: "all_branches", label: "Semua Cabang", value: "all_branches" },
];

/* =========================
 * FORM TYPE
 * ========================= */

interface ClassPlanFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    max_capacity: number;
    minutes_per_session: number;
    access_type: "single_branch" | "all_branches";
    unlimited_daily_session: boolean;
    daily_quota: number | undefined;
    unlimited_monthly_session: boolean;
    monthly_quota: number | undefined;
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
}

export default function ClassPlanDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: plan, isLoading, isError } = useClassPlan(id);
    const updateMutation = useUpdateClassPlan();
    const toggleMutation = useToggleClassPlan();
    const duplicateMutation = useDuplicateClassPlan();

    const form = useForm<ClassPlanFormData>({ mode: "onChange" });

    const unlimitedDaily = useWatch({ control: form.control, name: "unlimited_daily_session" });
    const unlimitedMonthly = useWatch({ control: form.control, name: "unlimited_monthly_session" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            category: plan.category ?? "",
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            max_capacity: plan.max_capacity,
            minutes_per_session: plan.minutes_per_session,
            access_type: plan.access_type,
            unlimited_daily_session: plan.unlimited_daily_session,
            daily_quota: plan.daily_quota ?? undefined,
            unlimited_monthly_session: plan.unlimited_monthly_session,
            monthly_quota: plan.monthly_quota ?? undefined,
            always_available: plan.always_available,
            available_from: plan.available_from ?? "",
            available_until: plan.available_until ?? "",
            is_active: plan.is_active,
        });
    }, [plan]);

    if (isLoading) return <div className="p-6">Memuat...</div>;
    if (isError) return notFound();

    /* =========================
     * SAVE
     * ========================= */
    const handleSave = async () => {
        try {
            const formData = form.getValues();
            const payload: ClassPlanUpdateRequest = {
                name: formData.name,
                category: formData.category || undefined,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                max_capacity: formData.max_capacity,
                minutes_per_session: formData.minutes_per_session,
                access_type: formData.access_type,
                unlimited_daily_session: formData.unlimited_daily_session,
                daily_quota: formData.unlimited_daily_session ? undefined : formData.daily_quota,
                unlimited_monthly_session: formData.unlimited_monthly_session,
                monthly_quota: formData.unlimited_monthly_session ? undefined : formData.monthly_quota,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
            };

            await updateMutation.mutateAsync({ id, payload });
            toast.success("Paket kelas berhasil diperbarui");
            setIsEditMode(false);
            router.push("/class-plans?updated=true");
        } catch {
            toast.error("Gagal memperbarui paket kelas");
        }
    };

    const handleCancel = () => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            category: plan.category ?? "",
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            max_capacity: plan.max_capacity,
            minutes_per_session: plan.minutes_per_session,
            access_type: plan.access_type,
            unlimited_daily_session: plan.unlimited_daily_session,
            daily_quota: plan.daily_quota ?? undefined,
            unlimited_monthly_session: plan.unlimited_monthly_session,
            monthly_quota: plan.monthly_quota ?? undefined,
            always_available: plan.always_available,
            available_from: plan.available_from ?? "",
            available_until: plan.available_until ?? "",
            is_active: plan.is_active,
        });
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <Toaster position="top-center" />
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/class-plans">Paket Kelas</Link>
                            </li>
                            <li className="text-aksen-secondary">{plan?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/class-plans">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <div className="flex items-center gap-3">
                                {plan?.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />}
                                <h1 className="text-2xl font-semibold">Detail Paket Kelas</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Toggle & Duplicate */}
                            {/* <CustomButton
                                type="button"
                                className="border text-zinc-600 px-3 py-2 text-sm"
                                onClick={() =>
                                    duplicateMutation.mutate(id, {
                                        onSuccess: () => toast.success("Paket berhasil diduplikat"),
                                        onError: () => toast.error("Gagal menduplikat paket"),
                                    })
                                }
                                disabled={duplicateMutation.isPending}
                            >
                                Duplikat
                            </CustomButton> */}

                            <CustomButton
                                type="button"
                                className={`border px-3 py-2 text-sm ${plan?.is_active ? "text-white bg-red-500 border-red-500" : "text-green-600 border-green-200"}`}
                                onClick={() =>
                                    toggleMutation.mutate(id, {
                                        onSuccess: () => toast.success(`Paket ${plan?.is_active ? "dinonaktifkan" : "diaktifkan"}`),
                                        onError: () => toast.error("Gagal memperbarui status"),
                                    })
                                }
                                disabled={toggleMutation.isPending}
                            >
                                {plan?.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </CustomButton>

                            {!isEditMode ? (
                                <CustomButton type="button" iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={() => setIsEditMode(true)}>
                                    Ubah
                                </CustomButton>
                            ) : (
                                <>
                                    <CustomButton type="button" className="border px-4 py-2.5" onClick={handleCancel}>
                                        Batal
                                    </CustomButton>
                                    <CustomButton type="button" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={handleSave} disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                                    </CustomButton>
                                </>
                            )}
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Nama Kelas" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <TextInput name="category" label="Kategori" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="access_type" label="Tipe Akses" options={accessTypeOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* PRICE, DURATION, CAPACITY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Harga (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="minutes_per_session" label="Durasi (menit)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="max_capacity" label="Kapasitas Maksimal (pax)" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* DESCRIPTION & COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Deskripsi" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Warna</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" {...form.register("color")} disabled={!isEditMode} className="w-10 h-10 rounded cursor-pointer border border-zinc-200 disabled:opacity-50" />
                                    <TextInput name="color" disabled={!isEditMode} />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* SESSION SETTINGS */}
                        <h2 className="text-xl font-semibold text-gray-800">Pengaturan Sesi</h2>
                        <div className="flex flex-col gap-4 text-gray-800">
                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" {...form.register("unlimited_daily_session")} disabled={!isEditMode} className="rounded" />
                                    <span>Sesi Harian Tanpa Batas</span>
                                </div>
                                {!unlimitedDaily && (
                                    <div className="w-48">
                                        <NumberInput name="daily_quota" label="Kuota Harian" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" {...form.register("unlimited_monthly_session")} disabled={!isEditMode} className="rounded" />
                                    <span>Sesi Bulanan Tanpa Batas</span>
                                </div>
                                {!unlimitedMonthly && (
                                    <div className="w-48">
                                        <NumberInput name="monthly_quota" label="Kuota Bulanan" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Ketersediaan</h2>
                        <div className="flex flex-col gap-4 text-gray-800">
                            <label className="flex items-center gap-3 text-sm">
                                <input type="checkbox" {...form.register("always_available")} disabled={!isEditMode} className="rounded" />
                                <span>Selalu Tersedia</span>
                            </label>

                            {!alwaysAvailable && (
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-4">
                                        <TextInput name="available_from" label="Tersedia Mulai" type="date" disabled={!isEditMode} />
                                    </div>
                                    <div className="col-span-4">
                                        <TextInput name="available_until" label="Tersedia Hingga" type="date" disabled={!isEditMode} />
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center gap-3 text-sm">
                                <input type="checkbox" {...form.register("is_active")} disabled={!isEditMode} className="rounded" />
                                <span>Aktif</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
