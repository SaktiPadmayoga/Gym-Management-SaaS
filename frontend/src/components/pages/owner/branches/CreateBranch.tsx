"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { TenantBranchCreateRequest } from "@/types/central/tenant-branches";
import { useCreateTenantBranch } from "@/hooks/useTenantBranches";
import { useTenant } from "@/hooks/useTenant";

/* =====================
 * OPTIONS
 * ===================== */
const timezoneOptions: DropdownOption<string>[] = [
    { key: "Asia/Jakarta", label: "Asia/Jakarta", value: "Asia/Jakarta" },
    { key: "Asia/Makassar", label: "Asia/Makassar (WITA)", value: "Asia/Makassar" },
    { key: "Asia/Jayapura", label: "Asia/Jayapura (WIT)", value: "Asia/Jayapura" },
];

const activeOptions: DropdownOption<string>[] = [
    { key: "true", label: "Aktif", value: "true" },
    { key: "false", label: "Tidak Aktif", value: "false" },
];

export default function CreateBranch() {
    const router = useRouter();
    const createMutation = useCreateTenantBranch();
    const { tenant } = useTenant();

    const form = useForm<TenantBranchCreateRequest>({
        mode: "onChange",
        defaultValues: {
            tenant_id: "",
            branch_code: "",
            name: "",
            address: "",
            city: "",
            phone: "",
            email: "",
            timezone: "Asia/Jakarta",
            is_active: true,
        },
    });

    const onSubmit = async (data: TenantBranchCreateRequest) => {
        try {
            const payload = {
                ...data,
                tenant_id: tenant?.id || "",
            };

            await createMutation.mutateAsync(payload);
            router.push("/owner/branches?success=true");
        } catch (error: any) {

            const message =
                error?.response?.data?.error || 
                error?.response?.data?.message || 
                error?.message ||                 
                "Gagal menambahkan cabang";

            toast.error(message);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border border-zinc-200 px-6 py-4">

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Cabang & Langganan</li>
                            <li>
                                <Link  href="/owner/branches">Cabang</Link>
                            </li>
                            <li className="text-aksen-secondary">Tambah Baru</li> 
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push("/owner/branches")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold ">Tambah Cabang</h1>
                        </div>

                        <CustomButton  type="submit" className="px-4 py-2.5 text-white" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Menyimpan..." : "Buat & Simpan"}
                        </CustomButton>
                    </div>

                    <hr className="border-zinc-200" />

                    <div className="flex flex-col gap-5 mt-6">
                        {/* BRANCH INFO */}
                        <h2 className="text-lg font-semibold text-zinc-800">Informasi Cabang</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="branch_code" label="Kode Cabang" placeholder="Misal: MAIN, BR001" rules={{ required: "Kode cabang wajib diisi" }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="name" label="Nama Cabang" placeholder="Misal: Cabang Utama Jakarta" rules={{ required: "Nama cabang wajib diisi" }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="email" label="Email" placeholder="Misal: cabang@gym.com" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="phone" label="Nomor Telepon" placeholder="Misal: +62 21 1234567" />
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="address" label="Alamat" placeholder="Alamat lengkap"  />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="city" label="Kota" placeholder="Misal: Jakarta" />
                            </div>
                        </div>
                        <hr className="border-zinc-200" />
                        {/* SETTINGS */}
                        <h2 className="text-lg font-semibold text-zinc-800">Pengaturan</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="timezone" label="Zona Waktu" options={timezoneOptions} />
                            </div>
                            
                            <div className="col-span-4">
                                <TextInput name="opened_at" label="Tanggal Dibuka" type="date" />
                            </div>
                            <label className="flex items-center gap-2 cols-span-4 text-zinc-900">
                                <input type="checkbox" name="is_active" defaultChecked />
                                <span>Aktif</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
