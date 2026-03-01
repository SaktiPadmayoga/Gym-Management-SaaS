"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { DomainCreateRequest } from "@/types/central/domains";
import { useCreateDomain } from "@/hooks/useDomains";
import { useTenant } from "@/hooks/useTenant";
import { useTenantBranches } from "@/hooks/useTenantBranches";

/* =====================
 * OPTIONS
 * ===================== */
const typeOptions: DropdownOption<string>[] = [
    { key: "tenant", label: "Tenant", value: "tenant" },
    { key: "branch", label: "Branch", value: "branch" },
    { key: "custom", label: "Custom", value: "custom" },
];

const primaryOptions: DropdownOption<string>[] = [
    { key: "true", label: "Yes", value: "true" },
    { key: "false", label: "No", value: "false" },
];

export default function CreateDomain() {
    const router = useRouter();
    const createMutation = useCreateDomain();
    const { tenant } = useTenant();
    const { data: branchesData } = useTenantBranches({ per_page: 100 });

    const branchOptions: DropdownOption<string>[] = [
        { key: "", label: "-- No Branch --", value: "" },
        ...(branchesData?.data?.map((branch) => ({
            key: branch.id,
            label: branch.name,
            value: branch.id,
        })) || []),
    ];

    const form = useForm<DomainCreateRequest>({
        mode: "onChange",
        defaultValues: {
            tenant_id: "",
            branch_id: null,
            domain: "",
            type: "branch",
            is_primary: false,
        },
    });

    const onSubmit = async (data: DomainCreateRequest) => {
        try {
            const payload = {
                ...data,
                tenant_id: tenant?.id || "",
                branch_id: data.branch_id || null,
                is_primary: data.is_primary === true || data.is_primary === ("true" as never),
            };

            await createMutation.mutateAsync(payload);
            toast.success("Domain created successfully");
            router.push("/owner/domains?success=true");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create domain");
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
                                <Link href="/owner/domains">Domains</Link>
                            </li>
                            <li className="text-aksen-secondary">Create New</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push("/owner/domains")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold ">Create Domain</h1>
                        </div>

                        <CustomButton type="submit" className="px-4 py-2" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Creating..." : "Create & Save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* DOMAIN INFO */}
                        <h2 className="text-lg font-semibold text-zinc-800">Domain Information</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8">
                                <TextInput name="domain" label="Domain Name" placeholder="e.g. main.gymbali.localhost" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="type" label="Type" options={typeOptions} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <SearchableDropdown name="branch_id" label="Branch (Optional)" options={branchOptions} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="is_primary" label="Primary Domain" options={primaryOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
