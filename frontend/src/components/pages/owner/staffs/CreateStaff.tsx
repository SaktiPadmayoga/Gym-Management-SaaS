"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { StaffCreateRequest } from "@/types/tenant/staffs";
import { useCreateStaff } from "@/hooks/tenant/useStaffs";
import { useTenantBranches } from "@/hooks/useTenantBranches";
import { useRoles } from "@/hooks/tenant/useRoles";

/* =========================
 * OPTIONS
 * ========================= */
const globalRoleOptions: DropdownOption<string>[] = [
    { key: "staff", label: "Staf", value: "staff" },
    { key: "owner", label: "Owner", value: "owner" },
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
    branch_id?: string;
    branch_role?: string;
}

export default function CreateStaff() {
    const router = useRouter();
    const createMutation = useCreateStaff();

    // Ambil data branches dengan penanganan tipe yang aman
    const { data: branchesResponse, isLoading: isBranchesLoading } = useTenantBranches();
    const { data: rolesData } = useRoles();

    // Pastikan kita selalu bekerja dengan array
    const branches = branchesResponse?.data ?? [];
    
    // Map dynamic roles except owner role
    const branchRoleOptions: DropdownOption<string>[] = (rolesData ?? [])
        .filter((r) => r.name !== "owner")
        .map((r) => ({
            key: r.id,
            label: r.display_name,
            value: r.name,
        }));

    const form = useForm<CreateStaffFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "staff",
            branch_id: undefined,
            branch_role: "receptionist",
        },
    });

    const selectedRole = form.watch("role");

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
                if (!formData.branch_id) {
                    toast.error("Cabang harus dipilih untuk staf");
                    return;
                }
                payload.branch_id = formData.branch_id;
                payload.branch_role = formData.branch_role;
            }

            await createMutation.mutateAsync(payload);
            router.push("/owner/staffs?success=true");
        } catch (error: any) {

            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Gagal membuat staf";

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
                            <li>Manajemen Pengguna</li>
                            <li>
                                <Link href="/owner/staffs">Staf</Link>
                            </li>
                            <li className="text-aksen-secondary">Tambah baru</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/owner/staffs")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Tambah Staf Baru</h1>
                                <p className="text-sm text-zinc-500">Tambahkan akun staf atau owner baru ke sistem</p>
                            </div>
                        </div>

                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-6 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Menyimpan..." : "Tambah Staf"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-5 mt-6">
                        {/* BASIC INFORMATION */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Nama Lengkap" placeholder="Contoh: John Doe" rules={{ required: "Nama wajib diisi" }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Alamat Email" type="email" placeholder="Contoh: staff@gym.com" rules={{ required: "Email wajib diisi" }} />
                            </div>
                        </div>

                        {/* PASSWORD & PHONE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="password" label="Password" type="password" placeholder="Minimal 8 karakter" rules={{ required: "Password wajib diisi", minLength: { value: 8, message: "Password harus minimal 8 karakter" } }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="phone" label="Nomor Telepon (opsional)" placeholder="Contoh: +6281234567890" />
                            </div>
                        </div>

                        {/* GLOBAL ROLE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown name="role" label="Peran (Role) Global" options={globalRoleOptions} rules={{ required: "Role global wajib diisi" }} />
                            </div>
                        </div>

                        {/* BRANCH ASSIGNMENT - Hanya untuk Staff */}
                        {selectedRole === "staff" && (
                            <>
                                <hr className="my-2" />

                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Penugasan Cabang</h2>
                                        <p className="text-sm text-zinc-500 mt-1">Pilih cabang dan peran staf di cabang tersebut</p>
                                    </div>

                                    <div className="grid grid-cols-12 gap-4">
                                        {/* Pilih Cabang */}
                                        <div className="col-span-6">
                                            <Controller
                                                name="branch_id"
                                                control={form.control}
                                                rules={{ required: "Cabang wajib dipilih untuk staf" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <SearchableDropdown
                                                            name="branch_id"
                                                            label="Tugaskan ke Cabang"
                                                            options={branches.map((branch) => ({
                                                                key: branch.id,
                                                                label: branch.name,
                                                                value: branch.id,
                                                                subtitle: branch.branch_code ? `(${branch.branch_code})` : undefined,
                                                            }))}
                                                            placeholder="Pilih cabang..."
                                                        />
                                                        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-6">
                                            <SearchableDropdown name="branch_role" label="Peran (Role) di Cabang" options={branchRoleOptions} rules={{ required: "Role cabang wajib diisi" }} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Informasi untuk Owner */}
                        {selectedRole === "owner" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                                <p>
                                    <strong>Catatan:</strong> Akun dengan role <strong>Owner</strong> akan memiliki akses penuh ke semua cabang dan fitur Dashboard Owner. Tidak diperlukan penugasan cabang spesifik.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
