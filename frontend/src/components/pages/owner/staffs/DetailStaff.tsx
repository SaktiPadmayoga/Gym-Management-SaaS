"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { StaffData, StaffUpdateRequest } from "@/types/tenant/staffs";
import { useAssignBranch, useStaffDetail, useUpdateStaff } from "@/hooks/tenant/useStaffs";
import { useTenantBranches } from "@/hooks/useTenantBranches";

/* =====================
 * OPTIONS
 * ===================== */
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

interface EditStaffFormData {
    name: string;
    email: string;
    phone: string;
    newPassword?: string;
    role: "owner" | "staff";
    // Untuk menambah branch baru
    add_branch_id?: string;
    add_branch_role?: "branch_manager" | "trainer" | "receptionist" | "cashier";
}

export default function DetailStaff() {
    const router = useRouter();
    const params = useParams();
    const staffId = params.id as string;

    const { data: staff, isLoading } = useStaffDetail(staffId);
    const updateMutation = useUpdateStaff();
    const { data: branchesResponse } = useTenantBranches();
    const branches = branchesResponse?.data ?? [];
    const assignBranchMutation = useAssignBranch();

    const form = useForm<EditStaffFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            newPassword: "",
            role: "staff",
            add_branch_id: undefined,
            add_branch_role: "receptionist",
        },
    });

    const selectedRole = form.watch("role");

    // Populate form dengan data staff yang ada
    useEffect(() => {
        if (staff) {
            form.reset({
                name: staff.name,
                email: staff.email,
                phone: staff.phone || "",
                role: staff.role,
                newPassword: "",
                add_branch_id: undefined,
                add_branch_role: "receptionist",
            });
        }
    }, [staff, form]);

    const onSubmit = async (data: EditStaffFormData) => {
        try {
            const payload: StaffUpdateRequest = {
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                role: data.role,
            };

            // Password hanya dikirim jika diisi
            if (data.newPassword?.trim()) {
                payload.password = data.newPassword;
            }

            await updateMutation.mutateAsync({ id: staffId, payload });

            toast.success("Staff updated successfully");
            router.push(`/owner/staffs/${staffId}?updated=true`);
        } catch (error) {
            toast.error("Failed to update staff");
            console.error(error);
        }
    };

    // Fungsi tambah branch (bisa dipanggil terpisah)
    const handleAddBranch = async () => {
        const branchId = form.getValues("add_branch_id");
        const branchRole = form.getValues("add_branch_role");

        if (!branchId || !branchRole) {
            toast.error("Pilih cabang dan role terlebih dahulu");
            return;
        }

        try {
            await assignBranchMutation.mutateAsync({
                staffId,
                payload: { branch_id: branchId, role: branchRole },
            });

            toast.success("Staff berhasil ditambahkan ke cabang baru");

            // Reset field add
            form.setValue("add_branch_id", undefined);
            form.setValue("add_branch_role", "receptionist");
        } catch (error) {
            toast.error("Gagal menambahkan staff ke cabang");
            console.error(error);
        }
    };

    if (isLoading || !staff) {
        return (
            <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

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
                            <li>
                                <Link href={`/owner/staffs/${staffId}`}>{staff.name}</Link>
                            </li>
                            <li className="text-aksen-secondary">Edit</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push(`/owner/staffs/${staffId}`)}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Edit Staff</h1>
                                <p className="text-sm text-zinc-500">{staff.name}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <CustomButton type="button" className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50" onClick={() => router.push(`/owner/staffs/${staffId}`)}>
                                Cancel
                            </CustomButton>
                            <CustomButton type="submit" className="px-4 py-2" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </CustomButton>
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" placeholder="e.g John Doe" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email Address" type="email" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="phone" label="Phone Number" placeholder="e.g +6281234567890" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="newPassword" label="New Password (optional)" type="password" placeholder="Leave blank to keep current" />
                            </div>
                        </div>

                        {/* GLOBAL ROLE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown name="role" label="Global Role" options={globalRoleOptions} />
                            </div>
                        </div>

                        {/* BRANCH ASSIGNMENT SECTION */}
                        {selectedRole === "staff" && (
                            <>
                                <hr className="my-4" />

                                {/* Current Assignments */}
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-800 mb-3">Current Branch Assignments</h2>
                                    {staff.branches && staff.branches.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {staff.branches.map((assignment) => (
                                                <span key={assignment.id} className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1 text-sm">
                                                    {assignment.branch?.name || assignment.branch_id}
                                                    <span className="text-xs font-medium text-zinc-500">({assignment.role})</span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-zinc-400 text-sm">Belum ditugaskan ke cabang manapun</p>
                                    )}
                                </div>

                                {/* Add to New Branch */}
                                <div className="mt-6">
                                    <h2 className="text-lg font-semibold text-zinc-800 mb-1">Add to New Branch</h2>
                                    <p className="text-sm text-zinc-500 mb-4">Tambahkan staff ini ke cabang lain</p>

                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-6">
                                            <Controller
                                                name="add_branch_id"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <SearchableDropdown
                                                        name="add_branch_id"
                                                        label="Select Branch"
                                                        options={branches.map((b) => ({
                                                            key: b.id,
                                                            label: b.name,
                                                            value: b.id,
                                                            subtitle: b.branch_code ? `(${b.branch_code})` : undefined,
                                                        }))}
                                                        placeholder="Pilih cabang..."
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-4">
                                            <SearchableDropdown name="add_branch_role" label="Role in Branch" options={branchRoleOptions} />
                                        </div>

                                        <div className="col-span-2 flex items-end">
                                            <CustomButton type="button" onClick={handleAddBranch} className="w-full bg-aksen-secondary text-white">
                                                Add
                                            </CustomButton>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Info untuk Owner */}
                        {selectedRole === "owner" && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">Owner memiliki akses penuh ke semua cabang. Tidak diperlukan penugasan cabang tambahan.</div>}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
