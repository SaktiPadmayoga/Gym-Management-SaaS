"use client";
 
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useEffect, useState, useMemo } from "react";
 
import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
 
import { StaffUpdateRequest } from "@/types/tenant/staffs";
import { useAssignBranch, useStaffDetail, useUpdateStaff } from "@/hooks/tenant/useStaffs";
import { useRoles } from "@/hooks/tenant/useRoles";
import { useBranch } from "@/providers/BranchProvider";
 
interface EditStaffFormData {
    name: string;
    email: string;
    phone: string;
    newPassword?: string;
    branch_role: string;
}
 
export default function BranchDetailStaff() {
    const router = useRouter();
    const params = useParams();
    const staffId = params.id as string;
    const [isEditMode, setIsEditMode] = useState(false);
    const { branchId, currentBranch } = useBranch();
 
    const { data: staff, isLoading } = useStaffDetail(staffId);
    const updateMutation = useUpdateStaff();
    const assignBranchMutation = useAssignBranch();
    const { data: rolesData } = useRoles();
 
    // Map dynamic roles except owner role
    const branchRoleOptions: DropdownOption<string>[] = useMemo(() => {
        return (rolesData ?? [])
            .filter((r) => r.name !== "owner")
            .map((r) => ({
                key: r.id,
                label: r.display_name,
                value: r.name,
            }));
    }, [rolesData]);
 
    const form = useForm<EditStaffFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            newPassword: "",
            branch_role: "receptionist",
        },
    });
 
    // Get the staff's current role in THIS active branch
    const currentAssignment = useMemo(() => {
        if (!staff?.branches || !branchId) return null;
        return staff.branches.find((b: any) => b.branch_id === branchId);
    }, [staff, branchId]);
 
    // Populate form with staff data
    useEffect(() => {
        if (staff) {
            form.reset({
                name: staff.name,
                email: staff.email,
                phone: staff.phone || "",
                newPassword: "",
                branch_role: currentAssignment?.role || "receptionist",
            });
        }
    }, [staff, currentAssignment, form]);
 
    const onSubmit = async (data: EditStaffFormData) => {
        if (!branchId) {
            toast.error("Cabang aktif tidak terdeteksi");
            return;
        }
 
        try {
            // 1. Update basic info
            const payload: StaffUpdateRequest = {
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                role: "staff", // Hardcode role global ke staff di portal branch
            };
 
            if (data.newPassword?.trim()) {
                payload.password = data.newPassword;
            }
 
            await updateMutation.mutateAsync({ id: staffId, payload });
 
            // 2. Update branch role assignment
            await assignBranchMutation.mutateAsync({
                staffId,
                payload: { branch_id: branchId, role: data.branch_role },
            });
 
            toast.success("Staff details updated successfully");
            setIsEditMode(false);
            router.push(`/staffs?updated=true`);
        } catch (error: any) {
            const message =
                error?.response?.data?.error || 
                error?.response?.data?.message || 
                error?.message ||                 
                "Failed to update staff";
 
            toast.error(message);
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
                                <Link href="/staffs">Staff</Link>
                            </li>
                            <li>
                                <Link href={`/staffs/${staffId}`}>{staff.name}</Link>
                            </li>
                            <li className="text-aksen-secondary">Detail & Edit</li>
                        </ul>
                    </div>
 
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push(`/staffs`)}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Staff Details</h1>
                                {currentBranch && (
                                    <p className="text-sm text-zinc-500">
                                        Branch: <span className="font-medium text-zinc-700">{currentBranch.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>
 
                        <div className="flex gap-2">
                            {!isEditMode ? (
                                <CustomButton type="button" className="text-white px-4 py-2.5 cursor-pointer animate-fade-in" onClick={() => setIsEditMode(true)}>
                                    <Icon name="edit" className="h-5 w-5 mr-1" />
                                    Edit
                                </CustomButton>
                            ) : (
                                <>
                                    <CustomButton type="button" className="px-4 py-2.5 text-white cursor-pointer" onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </CustomButton>
                                    <CustomButton type="submit" className="px-4 py-2.5 cursor-pointer" disabled={updateMutation.isPending || assignBranchMutation.isPending}>
                                        {updateMutation.isPending || assignBranchMutation.isPending ? "Saving..." : "Save Changes"}
                                    </CustomButton>
                                </>
                            )}
                        </div>
                    </div>
 
                    <hr />
 
                    <div className="flex flex-col gap-5 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" placeholder="e.g John Doe" disabled={!isEditMode} rules={{ required: "Name is required" }} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email Address" type="email" disabled={!isEditMode} rules={{ required: "Email is required" }} />
                            </div>
                        </div>
 
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="phone" label="Phone Number" placeholder="e.g +6281234567890" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="newPassword" label="New Password (optional)" type="password" placeholder="Leave blank to keep current" disabled={!isEditMode} />
                            </div>
                        </div>
 
                        {/* BRANCH ROLE SPECIFIC TO THIS BRANCH */}
                        <hr className="mt-2" />
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-800 mb-1">Branch Role</h2>
                            <p className="text-sm text-zinc-500 mb-4">Peran staff ini khusus pada cabang aktif saat ini.</p>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown
                                    name="branch_role"
                                    label="Role in Branch"
                                    options={branchRoleOptions}
                                    disabled={!isEditMode}
                                    rules={{ required: "Branch role is required" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
