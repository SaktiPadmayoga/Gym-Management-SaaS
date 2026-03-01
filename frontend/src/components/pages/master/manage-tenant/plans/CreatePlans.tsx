"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { mapPlanFormToCreateRequest, PlansData } from "@/types/central/plans";
import { useCreatePlan } from "@/hooks/usePlans";

const currencyOptions: DropdownOption<string>[] = [
    { key: "IDR", label: "IDR", value: "IDR" },
    { key: "USD", label: "USD", value: "USD" },
];

interface CreatePlanFormData {
    name: string;
    code: string;
    pricing: {
        monthly: number;
        yearly: number;
        currency: string;
    };
    limits: {
        max_membership: number;
        max_staff: number;
        max_branches: number;
    };
    features: string;
    is_active: boolean;
    is_public: boolean;
}

export default function CreatePlans() {
    const router = useRouter();
    const createMutation = useCreatePlan();

    const form = useForm<CreatePlanFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            code: "",
            pricing: {
                monthly: 0,
                yearly: 0,
                currency: "IDR",
            },
            limits: {
                max_membership: 0,
                max_staff: 0,
                max_branches: 0,
            },
            features: "",
            is_active: true,
            is_public: true,
        },
    });

    const onSubmit = async (formData: CreatePlanFormData) => {
        try {
            const domainData: PlansData = {
                name: formData.name,
                code: formData.code,

                pricing: {
                    monthly: formData.pricing.monthly,
                    yearly: formData.pricing.yearly,
                    currency: formData.pricing.currency,
                },

                limits: {
                    max_membership: formData.limits.max_membership,
                    max_staff: formData.limits.max_staff,
                    max_branches: formData.limits.max_branches,
                },

                features: formData.features
                    ? formData.features
                          .split(",")
                          .map((f) => f.trim())
                          .filter(Boolean)
                    : [],

                is_active: formData.is_active,
                is_public: formData.is_public,
            };

            const payload = mapPlanFormToCreateRequest(domainData);

            await createMutation.mutateAsync(payload);

            toast.success("Plan created successfully");
            router.push("/admin/plans");
        } catch (err) {
            toast.error("Failed to create plan");
            console.error(err);
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
                            <li>Master Data</li>
                            <li>
                                <Link href="/plans">Plans</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/plans")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Plan</h1>
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
                                <TextInput name="name" label="Plan Name" placeholder="e.g Premium Plan" />
                            </div>

                            <div className="col-span-6">
                                <TextInput name="code" label="Plan Code" placeholder="e.g PREMIUM" />
                            </div>
                        </div>

                        {/* PRICE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <NumberInput name="pricing.monthly" label="Monthly Price" />
                            </div>

                            <div className="col-span-4">
                                <NumberInput name="pricing.yearly" label="Yearly Price" />
                            </div>

                            <div className="col-span-4">
                                <SearchableDropdown name="pricing.currency" label="Currency" options={currencyOptions} />
                            </div>
                        </div>

                        <hr />

                        {/* LIMITS */}
                        <h2 className="text-lg font-semibold text-gray-800">Limits</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <NumberInput name="limits.max_membership" label="Max Membership" />
                            </div>

                            <div className="col-span-4">
                                <NumberInput name="limits.max_staff" label="Max Staff" />
                            </div>

                            <div className="col-span-4">
                                <NumberInput name="limits.max_branches" label="Max Branches" />
                            </div>
                        </div>

                        <hr />

                        {/* FEATURES */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-semibold text-gray-800">Features</h2>

                            <TextInput name="features" label="Features (comma separated)" placeholder="Dashboard, Reports, Multi Branch" />

                            <p className="text-sm text-zinc-400">Pisahkan fitur dengan koma (,)</p>
                        </div>

                        <hr />

                        {/* VISIBILITY */}
                        <h2 className="text-lg font-semibold text-gray-800">Visibility</h2>

                        <div className="flex gap-10 text-gray-800">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...form.register("is_active")} />
                                <span>Active</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...form.register("is_public")} />
                                <span>Public</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
