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

/* =========================
 * OPTIONS
 * ========================= */
const globalRoleOptions: DropdownOption<string>[] = [
    { key: "staff", label: "Staff", value: "staff" },
    { key: "owner", label: "Owner", value: "owner" },
];

const branchRoleOptions: DropdownOption<string>[] = [
    { key: "branch_manager", label: "Branch Manager", value: "branch_manager" },
    { key: "trainer", label: "Trainer", value: "trainer" },
    { key: "receptionist", label: "Receptionist", value: "receptionist" },
    { key: "cashier", label: "Cashier", value: "cashier" },
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
    branch_role?: "branch_manager" | "trainer" | "receptionist" | "cashier";
}

export default function CreateStaff() {
    const router = useRouter();
    const createMutation = useCreateStaff();

    // Ambil data branches dengan penanganan tipe yang aman
    const { data: branchesResponse, isLoading: isBranchesLoading } = useTenantBranches();

    // Pastikan kita selalu bekerja dengan array
    const branches = branchesResponse?.data ?? [];

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
                    toast.error("Cabang harus dipilih untuk staff");
                    return;
                }
                payload.branch_id = formData.branch_id;
                payload.branch_role = formData.branch_role;
            }

            await createMutation.mutateAsync(payload);

            toast.success("Staff berhasil dibuat");
            router.push("/owner/staffs?success=true");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Gagal membuat staff. Silakan coba lagi.";
            toast.error(message);
            console.error("Failed to create staff:", error);
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
                            <li>Management</li>
                            <li>
                                <Link href="/owner/staffs">Staff</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/owner/staffs")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Create New Staff</h1>
                                <p className="text-sm text-zinc-500">Tambahkan staff atau owner baru ke sistem</p>
                            </div>
                        </div>

                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-6 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Creating..." : "Create Staff"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFORMATION */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" placeholder="e.g John Doe" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email Address" type="email" placeholder="e.g staff@gym.com" />
                            </div>
                        </div>

                        {/* PASSWORD & PHONE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="password" label="Password" type="password" placeholder="Minimal 8 karakter" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="phone" label="Phone Number (optional)" placeholder="e.g +6281234567890" />
                            </div>
                        </div>

                        {/* GLOBAL ROLE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown name="role" label="Global Role" options={globalRoleOptions} />
                            </div>
                        </div>

                        {/* BRANCH ASSIGNMENT - Hanya untuk Staff */}
                        {selectedRole === "staff" && (
                            <>
                                <hr className="my-4" />

                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Branch Assignment</h2>
                                        <p className="text-sm text-zinc-500 mt-1">Pilih cabang dan peran staff di cabang tersebut</p>
                                    </div>

                                    <div className="grid grid-cols-12 gap-4">
                                        {/* Pilih Cabang */}
                                        <div className="col-span-6">
                                            <Controller
                                                name="branch_id"
                                                control={form.control}
                                                rules={{ required: "Cabang wajib dipilih untuk staff" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <SearchableDropdown
                                                            name="branch_id"
                                                            label="Assign to Branch"
                                                            options={branches.map((branch) => ({
                                                                key: branch.id,
                                                                label: branch.name,
                                                                value: branch.id,
                                                                subtitle: branch.branch_code ? `(${branch.branch_code})` : undefined,
                                                            }))}
                                                            placeholder="Pilih cabang..."

                                                            // Controller akan handle value & onChange otomatis
                                                        />
                                                        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        {/* Role di Cabang */}
                                        <div className="col-span-6">
                                            <SearchableDropdown name="branch_role" label="Role in Branch" options={branchRoleOptions} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Informasi untuk Owner */}
                        {selectedRole === "owner" && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                                <p>
                                    <strong>Catatan:</strong> Akun dengan role <strong>Owner</strong> akan memiliki akses penuh ke semua cabang dan fitur Owner Dashboard. Tidak diperlukan penugasan cabang spesifik.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
