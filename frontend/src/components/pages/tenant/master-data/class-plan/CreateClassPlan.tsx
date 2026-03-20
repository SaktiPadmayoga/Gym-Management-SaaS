"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import { useCreateClassPlan } from "@/hooks/tenant/useClassPlans";
import { ClassPlanCreateRequest } from "@/types/tenant/class-plans";

/* =========================
 * OPTIONS
 * ========================= */

const accessTypeOptions: DropdownOption<string>[] = [
    { key: "single_branch", label: "Single Branch", value: "single_branch" },
    { key: "all_branches", label: "All Branches", value: "all_branches" },
];

/* =========================
 * FORM TYPE
 * ========================= */

interface CreateClassPlanFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    max_capacity: number;
    minutes_per_session: number;
    access_type: "single_branch" | "all_branches";
    unlimited_daily_session: boolean;
    daily_quota: number | undefined;
    unlimited_monthly_session: boolean;
    monthly_quota: number | undefined;
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
}

export default function CreateClassPlan() {
    const router = useRouter();
    const createMutation = useCreateClassPlan();
    const { branchId } = useBranch();

    const form = useForm<CreateClassPlanFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            category: "",
            description: "",
            color: "",
            price: 0,
            max_capacity: 10,
            minutes_per_session: 60,
            access_type: "single_branch",
            unlimited_daily_session: true,
            daily_quota: undefined,
            unlimited_monthly_session: false,
            monthly_quota: undefined,
            always_available: true,
            available_from: "",
            available_until: "",
            is_active: true,
        },
    });

    const unlimitedDaily = useWatch({ control: form.control, name: "unlimited_daily_session" });
    const unlimitedMonthly = useWatch({ control: form.control, name: "unlimited_monthly_session" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });
    const colorValue = useWatch({ control: form.control, name: "color" });

    const onSubmit = async (formData: CreateClassPlanFormData) => {
        try {
            const payload: ClassPlanCreateRequest = {
                name: formData.name,
                category: formData.category || undefined,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                max_capacity: formData.max_capacity,
                minutes_per_session: formData.minutes_per_session,
                access_type: formData.access_type,
                unlimited_daily_session: formData.unlimited_daily_session,
                daily_quota: formData.unlimited_daily_session ? undefined : formData.daily_quota,
                unlimited_monthly_session: formData.unlimited_monthly_session,
                monthly_quota: formData.unlimited_monthly_session ? undefined : formData.monthly_quota,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
                branch_id: branchId ?? undefined,
            };

            await createMutation.mutateAsync(payload);
            toast.success("Class plan created successfully");
            router.push("/class-plan?success=true");
        } catch (err) {
            toast.error("Failed to create class plan");
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
                                <Link href="/class-plan">Class Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/class-plan")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Class Plan</h1>
                        </div>
                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Class Name" placeholder="e.g Yoga Morning" />
                            </div>
                            <div className="col-span-3">
                                <TextInput name="category" label="Category" placeholder="e.g Yoga, HIIT, Zumba" />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="access_type" label="Access Type" options={accessTypeOptions} />
                            </div>
                        </div>

                        {/* PRICE, DURATION, CAPACITY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="minutes_per_session" label="Duration (minutes)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="max_capacity" label="Max Capacity (pax)" />
                            </div>
                        </div>

                        {/* DESCRIPTION & COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Description (optional)" placeholder="Enter description" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Color (optional)</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" {...form.register("color")} className="w-10 h-10 rounded cursor-pointer border border-zinc-200" />
                                    <TextInput name="color" placeholder="#4F46E5" />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* SESSION SETTINGS */}
                        <h2 className="text-xl font-semibold text-gray-800">Session Settings</h2>
                        <div className="flex flex-col gap-4 text-gray-800">
                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" {...form.register("unlimited_daily_session")} className="rounded" />
                                    <span>Unlimited Daily Sessions</span>
                                </div>
                                {!unlimitedDaily && (
                                    <div className="w-48">
                                        <NumberInput name="daily_quota" label="Daily Quota" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" {...form.register("unlimited_monthly_session")} className="rounded" />
                                    <span>Unlimited Monthly Sessions</span>
                                </div>
                                {!unlimitedMonthly && (
                                    <div className="w-48">
                                        <NumberInput name="monthly_quota" label="Monthly Quota" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability</h2>
                        <div className="flex flex-col gap-4 text-gray-800">
                            <label className="flex items-center gap-3 text-sm">
                                <input type="checkbox" {...form.register("always_available")} className="rounded" />
                                <span>Always Available</span>
                            </label>

                            {!alwaysAvailable && (
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-4">
                                        <TextInput name="available_from" label="Available From" type="date" />
                                    </div>
                                    <div className="col-span-4">
                                        <TextInput name="available_until" label="Available Until" type="date" />
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center gap-3 text-sm">
                                <input type="checkbox" {...form.register("is_active")} className="rounded" />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
