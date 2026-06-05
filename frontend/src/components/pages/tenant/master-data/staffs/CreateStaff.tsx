"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { StaffCreateRequest } from "@/types/tenant/staffs";
import { useCreateStaff } from "@/hooks/tenant/useStaffs";
import { useBranch } from "@/providers/BranchProvider";

/* =========================
 * OPTIONS
 * ========================= */
const globalRoleOptions: DropdownOption<string>[] = [
    { key: "staff", label: "Staf", value: "staff" },
    { key: "owner", label: "Pemilik", value: "owner" },
];

const branchRoleOptions: DropdownOption<string>[] = [
    { key: "branch_manager", label: "Manajer Cabang", value: "branch_manager" },
    { key: "trainer", label: "Trainer", value: "trainer" },
    { key: "receptionist", label: "Resepsionis", value: "receptionist" },
    { key: "cashier", label: "Kasir", value: "cashier" },
];

/* =========================
 * FORM TYPE
 * ========================= */
interface CreateStaffFormData {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "owner" | "staff";
    branch_role: "branch_manager" | "trainer" | "receptionist" | "cashier";
}

export default function BranchCreateStaff() {
    const router = useRouter();
    const createMutation = useCreateStaff();
    const { currentBranch, branchId } = useBranch(); // ← ambil branch dari context

    const form = useForm<CreateStaffFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "staff",
            branch_role: "receptionist",
        },
    });

    const onSubmit = async (formData: CreateStaffFormData) => {
        try {
            const payload: StaffCreateRequest = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                role: formData.role,
            };

            if (formData.role === "staff") {
                if (!branchId) {
                    toast.error("Cabang aktif tidak terdeteksi");
                    return;
                }
                payload.branch_id = branchId;
                payload.branch_role = formData.branch_role;
            }

            await createMutation.mutateAsync(payload);

            toast.success("Staf berhasil ditambahkan");
            router.push("/staffs?success=true");
        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Gagal menambahkan staf";

            toast.error(message);
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
                                <Link href="/staffs">Staf</Link>
                            </li>
                            <li className="text-aksen-secondary">Tambah baru</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/staffs")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Tambah Staf</h1>
                                {/* Tampilkan branch aktif sebagai info */}
                                {currentBranch && (
                                    <p className="text-sm text-zinc-500">
                                        Cabang: <span className="font-medium text-zinc-700">{currentBranch.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Menyimpan..." : "Tambah dan Simpan"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Nama Lengkap" placeholder="Misal: John Doe" rules={{ required: "Nama wajib diisi" }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Alamat Email" type="email" placeholder="Misal: staff@gym.com" rules={{ required: "Email wajib diisi" }} />
                            </div>
                        </div>

                        {/* SECURITY & PHONE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="password" label="Kata Sandi" type="password" placeholder="Minimal 8 karakter" rules={{ required: "Kata Sandi wajib diisi", minLength: { value: 8, message: "Kata sandi harus minimal 8 karakter" } }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="phone" label="Telepon (opsional)" placeholder="Misal: +62812345678" />
                            </div>
                        </div>

                        {/* BRANCH ASSIGNMENT */}
                        <hr />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-1">Penugasan Cabang</h2>
                            <p className="text-sm text-zinc-500 mb-4">
                                Staf akan ditugaskan ke cabang <span className="font-medium text-zinc-700">{currentBranch?.name}</span> secara otomatis.
                            </p>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown name="branch_role" label="Peran di Cabang" options={branchRoleOptions} rules={{ required: "Peran di cabang wajib diisi" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
