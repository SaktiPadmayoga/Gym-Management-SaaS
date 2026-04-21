"use client";

import { useMemo } from "react";
import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { TextInput } from "@/components/ui/input/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

// Import Custom Hooks
import { useCreatePtSession } from "@/hooks/tenant/usePtSessions";
import { usePtPackages } from "@/hooks/tenant/usePtPackages";
import { useTrainers } from "@/hooks/tenant/useStaffs";
import { PtSessionCreateRequest } from "@/types/tenant/pt";

export default function CreatePtSession() {
    const router = useRouter();
    const createMutation = useCreatePtSession();

    // 1. Panggil dari Custom Hooks yang sudah ada
    const { data: packagesResponse, isLoading: loadingPackages } = usePtPackages({ status: "active", per_page: 100 });
    const { data: trainersResponse, isLoading: loadingTrainers } = useTrainers({ per_page: 100 });

    // 2. Mapping data untuk Dropdown
    const ptPackageOptions: DropdownOption<string>[] = useMemo(() => {
        const packagesData = packagesResponse?.data ?? [];
        return packagesData.map((pkg: any) => {
            const sisa = pkg.total_sessions - (pkg.used_sessions || 0);
            return {
                key: pkg.id,
                label: `${pkg.member?.name || 'Member'} - ${pkg.plan?.name || 'Paket PT'} (Sisa ${sisa} Sesi)`,
                value: pkg.id,
            };
        });
    }, [packagesResponse]);

    const trainerOptions: DropdownOption<string>[] = useMemo(() => {
        const trainersData = trainersResponse?.data ?? [];
        return trainersData.map((trainer: any) => ({
            key: trainer.id,
            label: trainer.name,
            value: trainer.id,
        }));
    }, [trainersResponse]);

    // 3. Inisialisasi Form
    const form = useForm<PtSessionCreateRequest>({
        mode: "onChange",
        defaultValues: {
            pt_package_id: "",
            trainer_id: "",
            date: "",
            start_at: "",
            end_at: "",
            notes: "",
        },
    });

    const onSubmit = (data: PtSessionCreateRequest) => {
        if (!data.pt_package_id) return toast.error("Silakan pilih Paket Member");
        if (!data.trainer_id) return toast.error("Silakan pilih Pelatih (Trainer)");
        if (!data.date) return toast.error("Silakan isi tanggal sesi");
        if (!data.start_at || !data.end_at) return toast.error("Silakan isi jam mulai dan selesai");

        createMutation.mutate(data, {
            onSuccess: () => {
                router.push("/pt-sessions?success=true");
            },
            onError: (error: any) => {
                const message = error?.response?.data?.message || "Gagal membuat jadwal PT";
                toast.error(message);
            }
        });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4 border-zinc-200 shadow-sm min-h-[500px]">
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li>
                                <Link href="/pt-sessions" className="hover:text-zinc-600 transition-colors">
                                    Jadwal PT
                                </Link>
                            </li>
                            <li className="text-aksen-secondary font-medium">Buat Jadwal Baru</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-zinc-800">
                            <button 
                                type="button" 
                                onClick={() => router.push("/pt-sessions")}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <Icon name="back" className="h-6 w-6 text-zinc-600" />
                            </button>
                            <h1 className="text-2xl font-bold tracking-tight">Buat Jadwal PT</h1>
                        </div>

                        <CustomButton 
                            type="submit" 
                            disabled={createMutation.isPending}
                            className="bg-aksen-secondary hover:bg-teal-700 text-white px-5 py-2.5 font-semibold transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Menyimpan..." : "Simpan Jadwal"}
                        </CustomButton>
                    </div>

                    <hr className="border-zinc-100 mb-8" />

                    <div className="flex flex-col gap-6 max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            <div className="md:col-span-7">
                                <SearchableDropdown 
                                    name="pt_package_id" 
                                    label="Pilih Member & Paket Aktif *" 
                                    options={ptPackageOptions} 
                                    placeholder={loadingPackages ? "Memuat paket..." : "Cari nama member..."}
                                />
                                <p className="text-xs text-zinc-400 mt-1">
                                    Hanya menampilkan member yang memiliki paket PT aktif.
                                </p>
                            </div>
                            <div className="md:col-span-5">
                                <SearchableDropdown 
                                    name="trainer_id" 
                                    label="Pelatih (Trainer) *" 
                                    options={trainerOptions} 
                                    placeholder={loadingTrainers ? "Memuat pelatih..." : "Pilih pelatih..."}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
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
                            <TextInput 
                                name="notes" 
                                label="Catatan Tambahan (Opsional)" 
                                placeholder="Misal: Fokus pada latihan lower body hari ini" 
                            />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}