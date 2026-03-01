"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { TenantCreateRequest } from "@/types/central/tenants";
import { useCreateTenant } from "@/hooks/useTenants";

/* =====================
 * OPTIONS
 * ===================== */
const statusOptions: DropdownOption<string>[] = [
    { key: "trial", label: "Trial", value: "trial" },
    { key: "active", label: "Active", value: "active" },
    { key: "suspended", label: "Suspended", value: "suspended" },
    { key: "expired", label: "Expired", value: "expired" },
];

const timezoneOptions: DropdownOption<string>[] = [{ key: "Asia/Jakarta", label: "Asia/Jakarta", value: "Asia/Jakarta" }];

const localeOptions: DropdownOption<string>[] = [
    { key: "id", label: "Indonesian", value: "id" },
    { key: "en", label: "English", value: "en" },
];

export default function CreateTenant() {
    const router = useRouter();
    const createMutation = useCreateTenant();

    const form = useForm<TenantCreateRequest>({
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            owner_name: "",
            owner_email: "",
            status: "trial",
            logo_url: "",
            timezone: "Asia/Jakarta",
            locale: "id",

            branch: {
                branch_code: "MAIN",
                name: "",
                address: "",
                city: "",
                phone: "",
                email: "",
                timezone: "Asia/Jakarta",
            },
        },
    });

    const onSubmit = async (data: TenantCreateRequest) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success("Tenant created successfully");
            router.push("/tenants/admin?success=true");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create tenant");
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
                            <li>Tenant & Subscription</li>
                            <li>
                                <Link href="/admin/tenants">Tenants</Link>
                            </li>
                            <li className="text-aksen-secondary">Create New</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push("/admin/tenants")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold ">Create Tenant</h1>
                        </div>

                        <CustomButton type="submit" className="px-4 py-2" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Creating..." : "Create & Save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* TENANT */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Tenant Name" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="slug" label="Slug" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="owner_name" label="Owner Name" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="owner_email" label="Owner Email" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="logo_url" label="Logo URL" />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="status" label="Status" options={statusOptions} />
                            </div>
                        </div>

                        {/* SYSTEM */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="timezone" label="Timezone" options={timezoneOptions} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="locale" label="Locale" options={localeOptions} />
                            </div>
                        </div>

                        <hr />

                        {/* BRANCH */}
                        <h2 className="text-lg font-semibold">Default Branch</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="branch.branch_code" label="Branch Code" />
                            </div>
                            <div className="col-span-8">
                                <TextInput name="branch.name" label="Branch Name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="branch.address" label="Address" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="branch.city" label="City" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="branch.phone" label="Phone" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="branch.email" label="Email" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="branch.timezone" label="Branch Timezone" options={timezoneOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
