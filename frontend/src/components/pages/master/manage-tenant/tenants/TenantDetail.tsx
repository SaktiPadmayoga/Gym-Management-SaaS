"use client";

import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { TenantUpdateRequest } from "@/types/central/tenants";
import { useTenant, useUpdateTenant } from "@/hooks/useTenants";

/* =====================
 * OPTIONS
 * ===================== */
const statusOptions: DropdownOption<string>[] = [
    { key: "trial", label: "Trial", value: "trial" },
    { key: "active", label: "Active", value: "active" },
    { key: "suspended", label: "Suspended", value: "suspended" },
    { key: "expired", label: "Expired", value: "expired" },
];

const timezoneOptions: DropdownOption<string>[] = [
    { key: "Asia/Jakarta", label: "Asia/Jakarta (WIB)", value: "Asia/Jakarta" },
    { key: "Asia/Makassar", label: "Asia/Makassar (WITA)", value: "Asia/Makassar" },
    { key: "Asia/Jayapura", label: "Asia/Jayapura (WIT)", value: "Asia/Jayapura" },
];

const localeOptions: DropdownOption<string>[] = [
    { key: "id", label: "Indonesian", value: "id" },
    { key: "en", label: "English", value: "en" },
];

export default function TenantDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    console.log("Detail Page - ID:", id); // Debug
    console.log("Params:", params); // Debug

    const { data: tenant, isLoading, isError, error } = useTenant(id);

    console.log("Tenant Data:", tenant); // Debug
    console.log("Loading:", isLoading); // Debug
    console.log("Error:", isError, error); // Debug
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch tenant data
    // const { data: tenant, isLoading, isError } = useTenant(id);
    const updateMutation = useUpdateTenant();

    const form = useForm<TenantUpdateRequest>({
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
            trial_ends_at: "",
            subscription_ends_at: "",
        }, // ✅ Provide initial default values
    });

    // ✅ Update form when data loads
    useEffect(() => {
        if (tenant) {
            form.reset({
                name: tenant.name || "",
                slug: tenant.slug || "",
                owner_name: tenant.owner_name || "",
                owner_email: tenant.owner_email || "",
                status: tenant.status || "trial",
                logo_url: tenant.logo_url || "",
                timezone: tenant.timezone || "Asia/Jakarta",
                locale: tenant.locale || "id",
                trial_ends_at: tenant.trial_ends_at || "",
                subscription_ends_at: tenant.subscription_ends_at || "",
            });
        }
    }, [tenant, form.reset]);

    const handleSave = async (data: TenantUpdateRequest) => {
        try {
            await updateMutation.mutateAsync({ id, payload: data });
            toast.success("Tenant updated successfully");
            setIsEditMode(false);
            // Optionally redirect or refetch
            // router.push("/admin/tenants?updated=true");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update tenant");
        }
    };

    const handleCancel = () => {
        if (tenant) {
            form.reset({
                name: tenant.name || "",
                slug: tenant.slug || "",
                owner_name: tenant.owner_name || "",
                owner_email: tenant.owner_email || "",
                status: tenant.status || "trial",
                logo_url: tenant.logo_url || "",
                timezone: tenant.timezone || "Asia/Jakarta",
                locale: tenant.locale || "id",
                trial_ends_at: tenant.trial_ends_at || "",
                subscription_ends_at: tenant.subscription_ends_at || "",
            });
        }
        setIsEditMode(false);
    };

    if (isLoading) {
        return (
            <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (isError || !tenant) {
        notFound();
    }

    const calculateDaysRemaining = (endDate: string | null) => {
        if (!endDate) return null;
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const trialDaysRemaining = calculateDaysRemaining(tenant?.trial_ends_at || null);
    const subscriptionDaysRemaining = calculateDaysRemaining(tenant?.subscription_ends_at || null);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li>
                                <Link href="/admin/tenants">Tenants</Link>
                            </li>
                            <li className="text-aksen-secondary">{tenant.name}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-900">
                            <button type="button" onClick={() => router.push("/admin/tenants")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">{tenant.name}</h1>
                                <p className="text-sm text-zinc-500 mt-1">ID: {tenant.id}</p>
                            </div>
                        </div>

                        {!isEditMode ? (
                            <CustomButton type="button" iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={() => setIsEditMode(true)}>
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton type="button" className="border border-zinc-300 text-zinc-700 px-4 py-2.5" onClick={handleCancel}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    {/* Overview Cards */}
                    {!isEditMode && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
                            {/* Status Card */}
                            <div className="border rounded-lg p-4">
                                <div className="text-sm text-zinc-500 mb-1">Status</div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-lg font-medium ${
                                            tenant.latestSubscription?.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : tenant.status === "trial"
                                                ? "bg-blue-100 text-blue-700"
                                                : tenant.status === "suspended"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {tenant.latestSubscription.status.charAt(0).toUpperCase() + tenant.latestSubscription.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Trial Period Card */}
                            <div className="border rounded-lg p-4">
                                <div className="text-sm text-zinc-500 mb-1">Trial Period</div>
                                <div className="text-lg font-semibold text-zinc-800">{tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</div>
                                {trialDaysRemaining !== null && (
                                    <div className={`text-sm mt-1 ${trialDaysRemaining < 0 ? "text-red-600" : trialDaysRemaining <= 7 ? "text-orange-600" : "text-zinc-500"}`}>
                                        {trialDaysRemaining < 0 ? `Expired ${Math.abs(trialDaysRemaining)}d ago` : trialDaysRemaining === 0 ? "Expires today" : `${trialDaysRemaining}d remaining`}
                                    </div>
                                )}
                            </div>

                            {/* Subscription Card */}
                            <div className="border rounded-lg p-4">
                                <div className="text-sm text-zinc-500 mb-1">Subscription Until</div>
                                <div className="text-lg font-semibold text-zinc-800">
                                    {tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                                </div>
                                {subscriptionDaysRemaining !== null && (
                                    <div className={`text-sm mt-1 ${subscriptionDaysRemaining < 0 ? "text-red-600" : subscriptionDaysRemaining <= 30 ? "text-orange-600" : "text-green-600"}`}>
                                        {subscriptionDaysRemaining < 0 ? `Expired ${Math.abs(subscriptionDaysRemaining)}d ago` : subscriptionDaysRemaining === 0 ? "Expires today" : `${subscriptionDaysRemaining}d left`}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tenant Information */}
                    <div className="flex flex-col gap-6 mt-6">
                        <h2 className="text-lg font-semibold text-zinc-800">Tenant Information</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Tenant Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="slug" label="Slug" disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="owner_name" label="Owner Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="owner_email" label="Owner Email" disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="logo_url" label="Logo URL" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="status" label="Status" options={statusOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* System Configuration */}
                        <h2 className="text-lg font-semibold text-zinc-800">System Configuration</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="timezone" label="Timezone" options={timezoneOptions} disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="locale" label="Locale" options={localeOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* Domains */}
                        <h2 className="text-lg font-semibold text-zinc-800">Domains</h2>

                        {tenant.domains && tenant.domains.length > 0 ? (
                            <div className="space-y-2">
                                {tenant.domains.map((domain, index) => (
                                    <div key={domain.id || index} className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50">
                                        <div>
                                            <div className="font-medium text-zinc-800">{domain.domain}</div>
                                            <div className="text-sm text-zinc-500">
                                                Type: {domain.type} {domain.is_primary && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>}
                                            </div>
                                        </div>
                                        <a href={`http://${domain.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                                            Visit →
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm">No domains configured</div>
                        )}

                        <hr />

                        {/* Branches */}
                        <h2 className="text-lg font-semibold text-zinc-800">
                            Branches{" "}
                            <span className="text-sm font-normal text-zinc-500">
                                ({tenant?.current_branch_count || 0}/{tenant.max_branches || 0})
                            </span>
                        </h2>

                        {tenant.branches && tenant.branches.length > 0 ? (
                            <div className="space-y-4">
                                {tenant.branches.map((branch, index) => (
                                    <div key={branch.id || index} className="border rounded-lg p-4 bg-zinc-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-semibold text-zinc-800">{branch.name}</div>
                                                <div className="text-sm text-zinc-500">Code: {branch.code}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded ${branch.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{branch.is_active ? "Active" : "Inactive"}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {branch.address && (
                                                <div>
                                                    <div className="text-zinc-500">Address</div>
                                                    <div className="text-zinc-800">{branch.address}</div>
                                                </div>
                                            )}
                                            {branch.city && (
                                                <div>
                                                    <div className="text-zinc-500">City</div>
                                                    <div className="text-zinc-800">{branch.city}</div>
                                                </div>
                                            )}
                                            {branch.phone && (
                                                <div>
                                                    <div className="text-zinc-500">Phone</div>
                                                    <div className="text-zinc-800">{branch.phone}</div>
                                                </div>
                                            )}
                                            {branch.email && (
                                                <div>
                                                    <div className="text-zinc-500">Email</div>
                                                    <div className="text-zinc-800">{branch.email}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm">No branches configured</div>
                        )}

                        <hr />

                        {/* Subscription Details */}
                        <h2 className="text-lg font-semibold text-zinc-800">Subscription Details</h2>

                        {tenant.latestSubscription && tenant.latestSubscription.plan ? (
                            <div className="border rounded-lg p-4 bg-zinc-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-zinc-500">Plan</div>
                                        <div className="font-semibold text-zinc-800">{tenant.latestSubscription.plan?.name || "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-zinc-500">Status</div>
                                        <div>
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded ${
                                                    tenant.latestSubscription.status === "active" ? "bg-green-100 text-green-700" : tenant.latestSubscription.status === "trial" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {tenant.latestSubscription.status.charAt(0).toUpperCase() + tenant.latestSubscription.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm">No active subscription</div>
                        )}

                        <hr />

                        {/* Metadata */}
                        <h2 className="text-lg font-semibold text-zinc-800">Metadata</h2>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-zinc-500">Created At</div>
                                <div className="text-zinc-800">{new Date(tenant.created_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</div>
                            </div>
                            <div>
                                <div className="text-zinc-500">Last Updated</div>
                                <div className="text-zinc-800">{new Date(tenant.updated_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
