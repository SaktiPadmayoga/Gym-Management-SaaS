"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useState } from "react";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import { useCreateFacility } from "@/hooks/tenant/useFacilities";
import { FacilityCreateRequest, OperationalHours, DEFAULT_OPERATIONAL_HOURS } from "@/types/tenant/facilities";

/* =========================
 * OPTIONS
 * ========================= */

const accessTypeOptions: DropdownOption<string>[] = [
    { key: "public", label: "Publik — Siapa saja bisa memesan", value: "public" },
    { key: "private", label: "Privat — Hanya anggota", value: "private" },
];

const DAYS = [
    { key: "mon", label: "Senin" },
    { key: "tue", label: "Selasa" },
    { key: "wed", label: "Rabu" },
    { key: "thu", label: "Kamis" },
    { key: "fri", label: "Jumat" },
    { key: "sat", label: "Sabtu" },
    { key: "sun", label: "Minggu" },
] as const;

/* =========================
 * FORM TYPE
 * ========================= */

interface CreateFacilityFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    minutes_per_session: number;
    capacity: number;
    access_type: "public" | "private";
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
    operational_hours: OperationalHours;
}

export default function CreateFacility() {
    const router = useRouter();
    const createMutation = useCreateFacility();
    const { branchId } = useBranch();

    const [showSchedule, setShowSchedule] = useState(false);

    const form = useForm<CreateFacilityFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            category: "",
            description: "",
            color: "",
            price: 0,
            minutes_per_session: 60,
            capacity: 1,
            access_type: "public",
            always_available: true,
            available_from: "",
            available_until: "",
            is_active: true,
            operational_hours: DEFAULT_OPERATIONAL_HOURS,
        },
    });

    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    const onSubmit = async (formData: CreateFacilityFormData) => {
        try {
            const payload: FacilityCreateRequest = {
                name: formData.name,
                category: formData.category || undefined,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                minutes_per_session: formData.minutes_per_session,
                capacity: formData.capacity,
                access_type: formData.access_type,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
                operational_hours: showSchedule ? formData.operational_hours : undefined,
                branch_id: branchId ?? undefined,
            };

            await createMutation.mutateAsync(payload);
            toast.success("Fasilitas berhasil dibuat");
            router.push("/facilities?success=true");
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Gagal membuat fasilitas";
            toast.error(message);
            console.error(err);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/facilities">Fasilitas</Link>
                            </li>
                            <li className="text-aksen-secondary">Buat baru</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/facilities")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Buat Fasilitas</h1>
                        </div>
                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Membuat..." : "Buat dan simpan"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6 text-zinc-800">
                        {/* NAME */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput
                                    name="name"
                                    label="Nama Fasilitas"
                                    placeholder="misal: Kolam Renang, Sauna"
                                    rules={{ required: "Nama fasilitas wajib diisi" }}
                                />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="category" label="Kategori (opsional)" placeholder="misal: Akuatik, Kebugaran" />
                            </div>
                        </div>

                        {/* DESCRIPTION & ACCESS TYPE */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Deskripsi" placeholder="Masukkan deskripsi" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="access_type" label="Tipe Akses" options={accessTypeOptions} />
                            </div>
                        </div>

                        {/* PRICE, SESSION, CAPACITY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput
                                    name="price"
                                    label="Harga per Sesi (Rp)"
                                    rules={{
                                        required: "Harga wajib diisi",
                                        min: { value: 0, message: "Harga tidak boleh negatif" }
                                    }}
                                />
                            </div>
                            <div className="col-span-4">
                                <NumberInput
                                    name="minutes_per_session"
                                    label="Durasi per Sesi (menit)"
                                    rules={{
                                        required: "Durasi wajib diisi",
                                        min: { value: 1, message: "Durasi minimal 1 menit" }
                                    }}
                                />
                            </div>
                            <div className="col-span-4">
                                <NumberInput
                                    name="capacity"
                                    label="Kapasitas Maksimal (pax)"
                                    rules={{
                                        required: "Kapasitas wajib diisi",
                                        min: { value: 1, message: "Kapasitas minimal 1 pax" }
                                    }}
                                />
                            </div>
                        </div>

                        {/* COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Warna (opsional)</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" {...form.register("color")} className="w-10 h-10 rounded cursor-pointer border border-zinc-200" />
                                    <TextInput name="color" placeholder="#4F46E5" />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Ketersediaan</h2>

                        <div className="flex flex-col gap-4 text-gray-800">
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" {...form.register("always_available")} />
                                    <span className="text-sm font-medium">Selalu Tersedia</span>
                                </div>
                                {!alwaysAvailable && (
                                    <>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="available_from" label="Tersedia Mulai" />
                                        </div>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="available_until" label="Tersedia Hingga" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" {...form.register("is_active")} />
                                <span className="text-sm font-medium">Aktif</span>
                            </div>
                        </div>

                        {/* OPERATIONAL HOURS */}
                        <div className="flex items-center gap-3 text-zinc-800">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} className="checkbox checkbox-sm" />
                            <span className="text-sm font-medium">Atur Jam Operasional</span>
                        </div>

                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg text-zinc-800">
                                <p className="text-sm font-medium mb-4">Jam Operasional</p>
                                <div className="flex flex-col gap-3">
                                    {DAYS.map((day) => {
                                        const isOpen = form.watch(`operational_hours.${day.key}.is_open`);
                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border border-zinc-300">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" {...form.register(`operational_hours.${day.key}.is_open`)} />
                                                    <span>{day.label}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`operational_hours.${day.key}.open`} disabled={!isOpen} />
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`operational_hours.${day.key}.close`} disabled={!isOpen} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
