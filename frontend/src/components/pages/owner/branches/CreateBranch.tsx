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
    { key: "true", label: "Active", value: "true" },
    { key: "false", label: "Inactive", value: "false" },
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
            // Set tenant_id from current tenant
            const payload = {
                ...data,
                tenant_id: tenant?.id || "",
            };

            await createMutation.mutateAsync(payload);
            toast.success("Branch created successfully");
            router.push("/owner/branches?success=true");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create branch");
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
                                <Link href="/owner/branches">Branches</Link>
                            </li>
                            <li className="text-aksen-secondary">Create New</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push("/owner/branches")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold ">Create Branch</h1>
                        </div>

                        <CustomButton type="submit" className="px-4 py-2" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Creating..." : "Create & Save"}
                        </CustomButton>
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
                            <label className="flex items-center gap-2 cols-span-4">
                                <input type="checkbox" name="is_active" />
                                <span>Active</span>
                            </label>
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
