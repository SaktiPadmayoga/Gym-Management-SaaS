"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useEffect } from "react";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { TenantBranchUpdateRequest } from "@/types/central/tenant-branches";
import { useTenantBranch, useUpdateTenantBranch } from "@/hooks/useTenantBranches";

/* =====================
 * OPTIONS
 * ===================== */
const timezoneOptions: DropdownOption<string>[] = [
    { key: "Asia/Jakarta", label: "Asia/Jakarta", value: "Asia/Jakarta" },
    { key: "Asia/Makassar", label: "Asia/Makassar (WITA)", value: "Asia/Makassar" },
    { key: "Asia/Jayapura", label: "Asia/Jayapura (WIT)", value: "Asia/Jayapura" },
];

const activeOptions: DropdownOption<string>[] = [
    { key: "true", label: "Active", value: "true" },
    { key: "false", label: "Inactive", value: "false" },
];

export default function EditBranch() {
    const router = useRouter();
    const params = useParams();
    const branchId = params.id as string;

    const { data: branch, isLoading } = useTenantBranch(branchId);
    const updateMutation = useUpdateTenantBranch();

    const form = useForm<TenantBranchUpdateRequest>({
        mode: "onChange",
        defaultValues: {
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

    // Populate form when branch data loads
    useEffect(() => {
        if (branch) {
            form.reset({
                branch_code: branch.branch_code,
                name: branch.name,
                address: branch.address || "",
                city: branch.city || "",
                phone: branch.phone || "",
                email: branch.email || "",
                timezone: branch.timezone || "Asia/Jakarta",
                is_active: branch.is_active,
            });
        }
    }, [branch, form]);

    const onSubmit = async (data: TenantBranchUpdateRequest) => {
        try {
            await updateMutation.mutateAsync({
                id: branchId,
                payload: data,
            });
            toast.success("Branch updated successfully");
            router.push(`/owner/branches/${branchId}?updated=true`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update branch");
        }
    };

    if (isLoading) {
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
                                <Link href="/owner/branches">Branches</Link>
                            </li>
                            <li>
                                <Link href={`/owner/branches/${branchId}`}>{branch?.name || "Detail"}</Link>
                            </li>
                            <li className="text-aksen-secondary">Edit</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push(`/owner/branches/${branchId}`)}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Edit Branch</h1>
                        </div>

                        <div className="flex gap-2">
                            <CustomButton type="button" className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50" onClick={() => router.push(`/owner/branches/${branchId}`)}>
                                Cancel
                            </CustomButton>
                            <CustomButton type="submit" className="px-4 py-2" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </CustomButton>
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BRANCH INFO */}
                        <h2 className="text-lg font-semibold text-zinc-800">Branch Information</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="branch_code" label="Branch Code" placeholder="e.g. MAIN, BR001" />
                            </div>
                            <div className="col-span-8">
                                <TextInput name="name" label="Branch Name" placeholder="e.g. Main Branch Jakarta" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="address" label="Address" placeholder="Full address" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="city" label="City" placeholder="e.g. Jakarta" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="phone" label="Phone" placeholder="e.g. +62 21 1234567" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email" placeholder="e.g. branch@gym.com" />
                            </div>
                        </div>

                        <hr />

                        {/* SETTINGS */}
                        <h2 className="text-lg font-semibold text-zinc-800">Settings</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="timezone" label="Timezone" options={timezoneOptions} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="is_active" label="Status" options={activeOptions} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="opened_at" label="Opened At" type="date" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
