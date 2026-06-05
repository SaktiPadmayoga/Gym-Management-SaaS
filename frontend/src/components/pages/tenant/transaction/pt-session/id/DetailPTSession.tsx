"use client";

import { useEffect, useMemo } from "react";
import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { TextInput } from "@/components/ui/input/Input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

// Import Custom Hooks
import { usePtSession, useUpdatePtSession, useMarkPtSessionComplete, useUpdatePtSessionNotes } from "@/hooks/tenant/usePtSessions";
import { useTrainers } from "@/hooks/tenant/useStaffs";
import { usePtPackages } from "@/hooks/tenant/usePtPackages";
import { PtSessionUpdateRequest } from "@/types/tenant/pt";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { useState } from "react";
import { CheckCircle2, NotebookPen } from "lucide-react";

const statusOptions: DropdownOption<string>[] = [
    { key: "scheduled", label: "Terjadwal", value: "scheduled" },
    { key: "ongoing", label: "Berlangsung", value: "ongoing" },
    { key: "completed", label: "Selesai", value: "completed" },
    { key: "cancelled", label: "Dibatalkan", value: "cancelled" },
];

export default function DetailPtSession() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { staff, selectedBranch } = useStaffAuth();

    const isTrainer = staff?.role === "trainer" || selectedBranch?.role === "trainer";

    // Local state untuk section mark-complete
    const [completionNotes, setCompletionNotes] = useState("");

    // 1. Fetch data jadwal PT yang mau diedit
    const { data: sessionData, isLoading: loadingSession, isError } = usePtSession(id);
    const updateMutation = useUpdatePtSession();
    const markCompleteMutation = useMarkPtSessionComplete();
    const updateNotesMutation = useUpdatePtSessionNotes();

    // 2. Fetch data Trainers dan Packages (Packages dibutuhkan hanya agar label dropdown tampil benar)
    const { data: trainersResponse, isLoading: loadingTrainers } = useTrainers({ per_page: 100 });
    const { data: packagesResponse, isLoading: loadingPackages } = usePtPackages({ per_page: 100 });

    // 3. Mapping data untuk Dropdown
    const trainerOptions: DropdownOption<string>[] = useMemo(() => {
        const rawData = trainersResponse?.data?.data || trainersResponse?.data || trainersResponse;
        const trainersData = Array.isArray(rawData) ? rawData : [];
        return trainersData.map((trainer: any) => ({
            key: trainer.id,
            label: trainer.name,
            value: trainer.id,
        }));
    }, [trainersResponse]);

    const ptPackageOptions: DropdownOption<string>[] = useMemo(() => {
        const rawData = packagesResponse?.data?.data || packagesResponse?.data || packagesResponse;
        const packagesData = Array.isArray(rawData) ? rawData : [];
        return packagesData.map((pkg: any) => ({
            key: pkg.id,
            label: `${pkg.member?.name || "Member"} - ${pkg.plan?.name || "Paket PT"}`,
            value: pkg.id,
        }));
    }, [packagesResponse]);

    // 4. Inisialisasi Form
    const form = useForm<PtSessionUpdateRequest & { pt_package_id?: string }>({
        mode: "onChange",
        defaultValues: {
            pt_package_id: "", // Hanya untuk display
            trainer_id: "",
            date: "",
            start_at: "",
            end_at: "",
            notes: "",
            status: "scheduled",
        },
    });

    // 5. Masukkan data ke dalam form begitu data berhasil di-fetch
    useEffect(() => {
        if (sessionData) {
            form.reset({
                pt_package_id: sessionData.pt_package_id,
                trainer_id: sessionData.trainer_id,
                date: sessionData.date,
                // Pastikan format jam HH:MM agar terbaca oleh input type="time"
                start_at: sessionData.start_at?.slice(0, 5) || "",
                end_at: sessionData.end_at?.slice(0, 5) || "",
                notes: sessionData.notes || "",
                status: sessionData.status,
            });
        }
    }, [sessionData, form]);

    const onSubmit = (data: PtSessionUpdateRequest & { pt_package_id?: string }) => {
        if (!data.trainer_id) return toast.error("Silakan pilih Pelatih (Trainer)");
        if (!data.date) return toast.error("Silakan isi tanggal sesi");
        if (!data.start_at || !data.end_at) return toast.error("Silakan isi jam mulai dan selesai");

        // Hapus pt_package_id dari payload karena backend tidak menerima update untuk kolom ini
        const payload = { ...data };
        delete payload.pt_package_id;

        updateMutation.mutate(
            { id, payload },
            {
                onSuccess: () => {
                    toast.success("Jadwal PT berhasil diperbarui");
                    router.push("/pt-sessions");
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.message || "Gagal memperbarui jadwal PT";
                    toast.error(message);
                },
            },
        );
    };

    const handleMarkComplete = () => {
        markCompleteMutation.mutate(
            { id, notes: completionNotes || undefined },
            {
                onSuccess: () => {
                    toast.success("Sesi berhasil ditandai selesai!");
                    router.push("/pt-sessions");
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.message || "Gagal menyelesaikan sesi";
                    toast.error(message);
                },
            },
        );
    };

    if (loadingSession) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-zinc-500 animate-pulse">Memuat data jadwal...</p>
            </div>
        );
    }

    if (isError || !sessionData) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <p className="text-red-500 font-medium">Gagal memuat data atau jadwal tidak ditemukan.</p>
                <CustomButton onClick={() => router.push("/pt-sessions")}>Kembali</CustomButton>
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4 border-zinc-200 shadow-sm min-h-[500px]">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li>
                                <Link href="/pt-sessions" className="hover:text-zinc-600 transition-colors">
                                    Jadwal PT
                                </Link>
                            </li>
                            <li className="text-aksen-secondary font-medium">Detail Sesi</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-zinc-800">
                            <button type="button" onClick={() => router.push("/pt-sessions")} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <Icon name="back" className="h-6 w-6 text-zinc-600" />
                            </button>
                            <h1 className="text-2xl font-bold tracking-tight">Detail Sesi PT</h1>
                        </div>

                        {/* Tombol simpan — tampil untuk admin/owner/manager ATAU trainer (untuk reschedule) jika belum selesai/batal */}
                        {["scheduled", "ongoing"].includes(sessionData?.status ?? "") && (
                            <CustomButton type="submit" disabled={updateMutation.isPending} className="bg-aksen-secondary hover:bg-teal-700 text-white px-5 py-2.5 font-semibold transition-colors disabled:opacity-50">
                                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                            </CustomButton>
                        )}
                    </div>

                    <hr className="border-zinc-100 mb-8" />

                    {/* ================================================
                        SECTION: TANDAI SELESAI (trainer only, jika sesi belum complete)
                    ================================================ */}
                    {["scheduled", "ongoing"].includes(sessionData?.status ?? "") && (
                        <div className="mb-8 p-5 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <NotebookPen className="w-5 h-5 text-teal-600" />
                                <h2 className="font-bold text-teal-800 text-base">Selesaikan Sesi</h2>
                                <span className="ml-auto px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase">{sessionData?.status}</span>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-teal-900 mb-1.5">
                                    Catatan Progress Member
                                    <span className="font-normal text-teal-600 ml-1">(opsional)</span>
                                </label>
                                <textarea
                                    value={completionNotes}
                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Member berhasil meningkatkan squat 5kg. Fokus selanjutnya: upper body..."
                                    className="w-full px-4 py-3 bg-white border border-teal-200 rounded-xl text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 resize-none transition"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleMarkComplete}
                                disabled={markCompleteMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {markCompleteMutation.isPending ? "Memproses..." : "Tandai Sesi Selesai"}
                            </button>
                        </div>
                    )}

                    {/* ================================================
                        SECTION: EDIT NOTES (untuk sesi completed — trainer bisa edit notes)
                    ================================================ */}
                    {sessionData?.status === "completed" && (
                        <div className="mb-8 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <NotebookPen className="w-5 h-5 text-zinc-500" />
                                <h2 className="font-bold text-zinc-700 text-base">Catatan Progress</h2>
                                <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Selesai</span>
                            </div>
                            <textarea
                                value={completionNotes || sessionData?.notes || ""}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                rows={3}
                                placeholder="Tambahkan atau edit catatan progress..."
                                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none transition mb-3"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const notes = completionNotes || sessionData?.notes || "";
                                    if (!notes.trim()) return toast.error("Catatan tidak boleh kosong");
                                    updateNotesMutation.mutate(
                                        { id, notes },
                                        {
                                            onSuccess: () => toast.success("Catatan berhasil diperbarui"),
                                            onError: () => toast.error("Gagal memperbarui catatan"),
                                        },
                                    );
                                }}
                                disabled={updateNotesMutation.isPending}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {updateNotesMutation.isPending ? "Menyimpan..." : "Simpan Catatan"}
                            </button>
                        </div>
                    )}

                    {/* Form edit/reschedule detail (hanya untuk status scheduled/ongoing) */}
                    {["scheduled", "ongoing"].includes(sessionData?.status ?? "") &&
                        (isTrainer ? (
                            // Reschedule Form khusus Trainer
                            <div className="flex flex-col gap-6 w-full mt-6 p-5 border border-zinc-100 bg-zinc-50/50 rounded-2xl">
                                <div>
                                    <h2 className="text-base font-bold text-zinc-800 mb-1 flex items-center gap-2">
                                        <Icon name="edit" className="w-5 h-5 text-teal-600" />
                                        Reschedule Jadwal Sesi PT
                                    </h2>
                                    <p className="text-xs text-zinc-500">Anda dapat mengubah tanggal dan jam pertemuan sesi ini.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                    <div className="md:col-span-4">
                                        <TextInput type="date" name="date" label="Tanggal Sesi *" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <TextInput type="time" name="start_at" label="Jam Mulai *" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <TextInput type="time" name="end_at" label="Jam Selesai *" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1">
                                    <TextInput name="notes" label="Alasan Reschedule / Catatan *" placeholder="Tulis alasan rescheduling atau fokus latihan sesi ini..." rules={{ required: "Catatan reschedule / alasan wajib diisi" }} />
                                </div>
                            </div>
                        ) : (
                            // Full Edit Form untuk Admin/Owner/Manager
                            <div className="flex flex-col gap-6 w-full mt-6">
                                {/* MEMBER PACKAGE & TRAINER */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                    <div className="md:col-span-7">
                                        <div className="opacity-70 pointer-events-none cursor-not-allowed">
                                            <SearchableDropdown name="pt_package_id" label="Paket Member (Tidak dapat diubah)" options={ptPackageOptions} placeholder={loadingPackages ? "Memuat paket..." : "Memuat data member..."} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-5">
                                        <SearchableDropdown name="trainer_id" label="Pelatih (Trainer) *" options={trainerOptions} placeholder={loadingTrainers ? "Memuat pelatih..." : "Pilih pelatih..."} />
                                    </div>
                                </div>

                                {/* DATE, TIME & STATUS */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <div className="md:col-span-3">
                                        <TextInput type="date" name="date" label="Tanggal Sesi *" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <TextInput type="time" name="start_at" label="Jam Mulai *" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <TextInput type="time" name="end_at" label="Jam Selesai *" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <SearchableDropdown name="status" label="Status Sesi *" options={statusOptions} />
                                    </div>
                                </div>

                                {/* NOTES */}
                                <div className="grid grid-cols-1">
                                    <TextInput name="notes" label="Catatan Tambahan (Opsional)" placeholder="Misal: Fokus pada latihan lower body hari ini" />
                                </div>
                            </div>
                        ))}
                </div>
            </form>
        </FormProvider>
    );
}
