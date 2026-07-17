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
import { usePtSessionPlan, useUpdatePtSessionPlan, useTogglePtSessionPlan, useDuplicatePtSessionPlan } from "@/hooks/tenant/usePtSessionPlans";
import { PtSessionPlanUpdateRequest } from "@/types/tenant/pt-session-plans";

/* =========================
 * OPTIONS
 * ========================= */

const durationUnitOptions: DropdownOption<string>[] = [
    { key: "day", label: "Hari", value: "day" },
    { key: "week", label: "Minggu", value: "week" },
    { key: "month", label: "Bulan", value: "month" },
    { key: "year", label: "Tahun", value: "year" },
];

/* =========================
 * FORM TYPE
 * ========================= */

interface PtSessionPlanFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    duration: number;
    duration_unit: "day" | "week" | "month" | "year";
    minutes_per_session: number;
    total_sessions: number;
    loyalty_points_reward: number;
    unlimited_sold: boolean;
    total_quota: number | undefined;
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
}

export default function PtSessionPlanDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: plan, isLoading, isError } = usePtSessionPlan(id);
    const updateMutation = useUpdatePtSessionPlan();
    const toggleMutation = useTogglePtSessionPlan();
    const duplicateMutation = useDuplicatePtSessionPlan();

    const form = useForm<PtSessionPlanFormData>({ mode: "onChange" });

    const unlimitedSold = useWatch({ control: form.control, name: "unlimited_sold" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            category: plan.category,
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            duration: plan.duration,
            duration_unit: plan.duration_unit,
            minutes_per_session: plan.minutes_per_session,
            total_sessions: plan.total_sessions,
            loyalty_points_reward: plan.loyalty_points_reward,
            unlimited_sold: plan.unlimited_sold,
            total_quota: plan.total_quota ?? undefined,
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
    const handleSave = async (formData: PtSessionPlanFormData) => {
        try {
            const payload: PtSessionPlanUpdateRequest = {
                name: formData.name,
                category: formData.category,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                duration: formData.duration,
                duration_unit: formData.duration_unit,
                minutes_per_session: formData.minutes_per_session,
                total_sessions: formData.total_sessions,
                loyalty_points_reward: formData.loyalty_points_reward,
                unlimited_sold: formData.unlimited_sold,
                total_quota: formData.unlimited_sold ? undefined : formData.total_quota,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
            };

            await updateMutation.mutateAsync({ id, payload });
            toast.success("Paket sesi PT berhasil diperbarui");
            setIsEditMode(false);
            router.push("/pt-sessions-plans?updated=true");
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || "Gagal memperbarui paket sesi PT";
            toast.error(message);
        }
    };

    const handleCancel = () => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            category: plan.category,
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            duration: plan.duration,
            duration_unit: plan.duration_unit,
            minutes_per_session: plan.minutes_per_session,
            total_sessions: plan.total_sessions,
            loyalty_points_reward: plan.loyalty_points_reward,
            unlimited_sold: plan.unlimited_sold,
            total_quota: plan.total_quota ?? undefined,
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
            <form onSubmit={form.handleSubmit(handleSave)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/pt-sessions-plans">Paket Sesi PT</Link>
                            </li>
                            <li className="text-aksen-secondary">{plan?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/pt-sessions-plans")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div className="flex items-center gap-2">
                                {plan?.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />}
                                <h1 className="text-2xl font-semibold">Detail Paket Sesi PT</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* <CustomButton
                                type="button"
                                className="border text-zinc-600 px-3 py-2 text-sm"
                                onClick={() =>
                                    duplicateMutation.mutate(id, {
                                        onSuccess: () => toast.success("Paket sesi PT berhasil diduplikat"),
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
                                        onSuccess: () => toast.success(`Paket sesi PT berhasil ${plan?.is_active ? "dinonaktifkan" : "diaktifkan"}`),
                                        onError: () => toast.error("Gagal memperbarui status"),
                                    })
                                }
                                disabled={toggleMutation.isPending}
                            >
                                {plan?.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </CustomButton>

                            {!isEditMode ? (
                                <CustomButton iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" type="button" onClick={() => setIsEditMode(true)}>
                                    Ubah
                                </CustomButton>
                            ) : (
                                <div className="flex gap-3">
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
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput
                                    name="name"
                                    label="Nama Paket"
                                    disabled={!isEditMode}
                                    rules={{ required: "Nama paket wajib diisi" }}
                                />
                            </div>
                            <div className="col-span-3">
                                <NumberInput
                                    name="duration"
                                    label="Durasi"
                                    disabled={!isEditMode}
                                    rules={{
                                        required: "Durasi wajib diisi",
                                        min: { value: 1, message: "Durasi minimal 1" }
                                    }}
                                />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown
                                    name="duration_unit"
                                    label="Satuan Durasi"
                                    options={durationUnitOptions}
                                    disabled={!isEditMode}
                                    rules={{ required: "Satuan durasi wajib diisi" }}
                                />
                            </div>
                        </div>

                        {/* PRICE, SESSIONS, MINUTES */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput
                                    name="price"
                                    label="Harga (Rp)"
                                    disabled={!isEditMode}
                                    rules={{
                                        required: "Harga wajib diisi",
                                        min: { value: 0, message: "Harga tidak boleh negatif" }
                                    }}
                                />
                            </div>
                            <div className="col-span-3">
                                <NumberInput
                                    name="total_sessions"
                                    label="Total Sesi"
                                    disabled={!isEditMode}
                                    rules={{
                                        required: "Total sesi wajib diisi",
                                        min: { value: 1, message: "Total sesi minimal 1" }
                                    }}
                                />
                            </div>
                            <div className="col-span-3">
                                <NumberInput
                                    name="minutes_per_session"
                                    label="Menit per Sesi"
                                    disabled={!isEditMode}
                                    rules={{
                                        required: "Menit per sesi wajib diisi",
                                        min: { value: 1, message: "Menit per sesi minimal 1" }
                                    }}
                                />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="loyalty_points_reward" label="Poin Loyalitas" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* CATEGORY, DESCRIPTION, COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <TextInput name="category" label="Kategori" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-5">
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

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Pengaturan Ketersediaan</h2>

                        <div className="flex gap-6 items-start flex-col text-gray-800">
                            <div className="flex flex-row gap-8 items-center w-full">
                                <div className="flex flex-row gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("unlimited_sold")} />
                                    <span className="text-sm font-medium">Penjualan / Kuota Tak Terbatas</span>
                                </div>
                                {!unlimitedSold && (
                                    <div className="w-48">
                                        <NumberInput name="total_quota" label="Maks. Penjualan / Kuota" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row gap-8 items-center w-full">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("always_available")} />
                                    <span className="text-sm font-medium">Selalu Tersedia</span>
                                </div>
                                {!alwaysAvailable && (
                                    <>
                                        <div className="w-48">
                                            <TextInput type="date" name="available_from" label="Tersedia Mulai" disabled={!isEditMode} />
                                        </div>
                                        <div className="w-48">
                                            <TextInput type="date" name="available_until" label="Tersedia Sampai" disabled={!isEditMode} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("is_active")} />
                                <span className="text-sm font-medium">Aktif</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
