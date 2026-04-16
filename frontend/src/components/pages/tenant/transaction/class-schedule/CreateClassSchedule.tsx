"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useCreateClassSchedule } from "@/hooks/tenant/useClassSchedules";
import { useClassPlans } from "@/hooks/tenant/useClassPlans";
import { useStaff } from "@/hooks/tenant/useStaffs";
import {
    ClassScheduleCreateRequest,
    ClassScheduleCreateRequestSchema,
} from "@/types/tenant/class-schedules";

const classTypeOptions: DropdownOption<string>[] = [
    { key: "membership_only", label: "Member Only", value: "membership_only" },
    { key: "public",          label: "Publik",      value: "public" },
    { key: "private",         label: "Private",     value: "private" },
];

export default function CreateClassSchedule() {
    const router = useRouter();
    const createMutation = useCreateClassSchedule();

    const { data: classPlansData } = useClassPlans({ per_page: 100 });
    const { data: staffData }      = useStaff({ per_page: 100 });

    const classPlans = classPlansData ?? [];
    const staffList  = Array.isArray(staffData) ? staffData : staffData?.data ?? [];

    const classPlansOptions: DropdownOption<string>[] = classPlans.map((p: any) => ({
        key:   p.id,
        label: p.name,
        value: p.id,
        subtitle: p.category ?? undefined,
    }));

    const instructorOptions: DropdownOption<string>[] = staffList.map((s: any) => ({
        key:   s.id,
        label: s.name,
        value: s.id,
        subtitle: s.role ?? undefined,
    }));

    const form = useForm<ClassScheduleCreateRequest>({
        defaultValues: {
            class_type: "membership_only",
        },
    });

    const onSubmit = async (data: ClassScheduleCreateRequest) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success("Jadwal berhasil dibuat");
            router.push("/class-schedules?success=true");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Gagal membuat jadwal");
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    <Toaster position="top-center" />

                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li><Link href="/class-schedules">Jadwal Kelas</Link></li>
                            <li className="text-aksen-secondary">Buat Jadwal</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/class-schedules")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Buat Jadwal Kelas</h1>
                                <p className="text-sm text-zinc-500">Tambahkan jadwal kelas baru</p>
                            </div>
                        </div>
                        <CustomButton
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-aksen-secondary text-white px-6 py-2.5 disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Menyimpan..." : "Simpan Jadwal"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown
                                    name="class_plan_id"
                                    label="Kelas *"
                                    options={classPlansOptions}
                                    placeholder="Pilih kelas..."
                                />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown
                                    name="instructor_id"
                                    label="Instruktur *"
                                    options={instructorOptions}
                                    placeholder="Pilih instruktur..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="date" label="Tanggal *" type="date" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="start_at" label="Jam Mulai *" type="time" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="end_at" label="Jam Selesai *" type="time" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown
                                    name="class_type"
                                    label="Tipe Kelas"
                                    options={classTypeOptions}
                                />
                            </div>
                            <div className="col-span-4">
                                <TextInput
                                    name="max_capacity"
                                    label="Kapasitas (kosongkan = ikut plan)"
                                    type="number"
                                    placeholder="Contoh: 20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12">
                                <TextInput name="notes" label="Catatan (opsional)" placeholder="Catatan tambahan..." />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}