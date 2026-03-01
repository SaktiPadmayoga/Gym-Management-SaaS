"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { PlansData, mapPlanFormToCreateRequest } from "@/types/central/plans";
import { usePlan, useUpdatePlan } from "@/hooks/usePlans";

/* =====================================
 * OPTIONS
 * ===================================== */
const currencyOptions: DropdownOption<string>[] = [
    { key: "IDR", label: "IDR", value: "IDR" },
    { key: "USD", label: "USD", value: "USD" },
];

/* =====================================
 * FORM SHAPE (SAMA DENGAN CREATE)
 * ===================================== */
interface PlanFormData {
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

    features: string; // comma separated di UI
    is_active: boolean;
    is_public: boolean;
}

export default function PlanDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: plan, isLoading, isError } = usePlan(id);
    const updateMutation = useUpdatePlan();

    const form = useForm<PlanFormData>({
        mode: "onChange",
    });

    /* =====================================
     * SET DEFAULT VALUE DARI API
     * ===================================== */
    useEffect(() => {
        if (!plan) return;

        form.reset({
            name: plan.name,
            code: plan.code,

            pricing: {
                monthly: plan.pricing.monthly,
                yearly: plan.pricing.yearly,
                currency: plan.pricing.currency,
            },

            limits: {
                max_membership: plan.limits.max_membership,
                max_staff: plan.limits.max_staff,
                max_branches: plan.limits.max_branches,
            },

            features: plan.features.join(", "),
            is_active: plan.is_active,
            is_public: plan.is_public,
        });
    }, [plan, form]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError) return notFound();
    if (!plan) return null; 

    /* =====================================
     * SAVE UPDATE
     * ===================================== */
    const handleSave = async () => {
        try {
            const formData = form.getValues();

            const domainData: PlansData = {
                ...plan, // keep id & immutable fields
                name: formData.name,
                code: formData.code,

                pricing: formData.pricing,
                limits: formData.limits,

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

            await updateMutation.mutateAsync({
                id,
                payload,
            });

            toast.success("Plan updated successfully");
            setIsEditMode(false);
            router.push("/plans");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update plan");
        }
    };

    const handleCancel = () => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            code: plan.code,
            pricing: plan.pricing,
            limits: plan.limits,
            features: plan.features.join(", "),
            is_active: plan.is_active,
            is_public: plan.is_public,
        });
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/plans">Plans</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/plans">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <h1 className="text-2xl font-semibold">Plan Detail</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton type="button" iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={() => setIsEditMode(true)}>
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton type="button" className="border px-4 py-2.5" onClick={handleCancel}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="button" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={handleSave} disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Saving..." : "Save"}
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Plan Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="code" label="Plan Code" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* PRICE */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <NumberInput name="pricing.monthly" label="Monthly Price" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="pricing.yearly" label="Yearly Price" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="pricing.currency" label="Currency" options={currencyOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* LIMITS */}
                        <h2 className="text-lg font-semibold text-gray-800">Limits</h2>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <NumberInput name="limits.max_membership" label="Max Membership" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="limits.max_staff" label="Max Staff" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="limits.max_branches" label="Max Branches" disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* FEATURES */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-semibold text-gray-800">Features</h2>
                            <TextInput name="features" label="Features (comma separated)" disabled={!isEditMode} />
                        </div>

                        <hr />

                        {/* VISIBILITY */}
                        <h2 className="text-lg font-semibold text-gray-800">Visibility</h2>
                        <div className="flex gap-10 text-gray-800">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...form.register("is_active")} disabled={!isEditMode} />
                                <span>Active</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...form.register("is_public")} disabled={!isEditMode} />
                                <span>Public</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
