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

            toast.success("Staff created successfully");
            router.push("/staffs?success=true");
        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create staff";

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
                            <li>Management</li>
                            <li>
                                <Link href="/staffs">Staff</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/staffs")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Create Staff</h1>
                                {/* Tampilkan branch aktif sebagai info */}
                                {currentBranch && (
                                    <p className="text-sm text-zinc-500">
                                        Branch: <span className="font-medium text-zinc-700">{currentBranch.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" placeholder="e.g John Doe" rules={{ required: "Name is required" }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email Address" type="email" placeholder="e.g staff@gym.com" rules={{ required: "Email is required" }} />
                            </div>
                        </div>

                        {/* SECURITY & PHONE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="password" label="Password" type="password" placeholder="Minimum 8 characters" rules={{ required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="phone" label="Phone (optional)" placeholder="e.g +62812345678" />
                            </div>
                        </div>

                        {/* BRANCH ASSIGNMENT */}
                        <hr />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-1">Branch Assignment</h2>
                            <p className="text-sm text-zinc-500 mb-4">
                                Staff will be assigned to <span className="font-medium text-zinc-700">{currentBranch?.name}</span> automatically.
                            </p>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown name="branch_role" label="Role in Branch" options={branchRoleOptions} rules={{ required: "Branch role is required" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
