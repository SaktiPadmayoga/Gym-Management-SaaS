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

import { DomainUpdateRequest } from "@/types/central/domains";
import { useDomain, useUpdateDomain } from "@/hooks/useDomains";
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

export default function EditDomain() {
    const router = useRouter();
    const params = useParams();
    const domainId = params.id as string;

    const { data: domain, isLoading } = useDomain(domainId);
    const updateMutation = useUpdateDomain();
    const { data: branchesData } = useTenantBranches({ per_page: 100 });

    const branchOptions: DropdownOption<string>[] = [
        { key: "", label: "-- No Branch --", value: "" },
        ...(branchesData?.data?.map((branch) => ({
            key: branch.id,
            label: branch.name,
            value: branch.id,
        })) || []),
    ];

    const form = useForm<DomainUpdateRequest>({
        mode: "onChange",
        defaultValues: {
            branch_id: null,
            domain: "",
            type: "branch",
            is_primary: false,
        },
    });

    // Populate form when domain data loads
    useEffect(() => {
        if (domain) {
            form.reset({
                branch_id: domain.branch_id || null,
                domain: domain.domain,
                type: domain.type,
                is_primary: domain.is_primary,
            });
        }
    }, [domain, form]);

    const onSubmit = async (data: DomainUpdateRequest) => {
        try {
            const payload = {
                ...data,
                branch_id: data.branch_id || null,
                is_primary: data.is_primary === true || data.is_primary === ("true" as never),
            };

            await updateMutation.mutateAsync({
                id: domainId,
                payload,
            });
            toast.success("Domain updated successfully");
            router.push(`/owner/domains/${domainId}?updated=true`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update domain");
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
                                <Link href="/owner/domains">Domains</Link>
                            </li>
                            <li>
                                <Link href={`/owner/domains/${domainId}`}>{domain?.domain || "Detail"}</Link>
                            </li>
                            <li className="text-aksen-secondary">Edit</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push(`/owner/domains/${domainId}`)}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Edit Domain</h1>
                        </div>

                        <div className="flex gap-2">
                            <CustomButton type="button" className="bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50" onClick={() => router.push(`/owner/domains/${domainId}`)}>
                                Cancel
                            </CustomButton>
                            <CustomButton type="submit" className="px-4 py-2" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </CustomButton>
                        </div>
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
