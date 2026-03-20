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
import { useCreatePtSessionPlan } from "@/hooks/tenant/usePtSessionPlans";
import { PtSessionPlanCreateRequest } from "@/types/tenant/pt-session-plans";

/* =========================
 * OPTIONS
 * ========================= */

const durationUnitOptions: DropdownOption<string>[] = [
    { key: "day", label: "Day", value: "day" },
    { key: "week", label: "Week", value: "week" },
    { key: "month", label: "Month", value: "month" },
    { key: "year", label: "Year", value: "year" },
];

/* =========================
 * FORM TYPE
 * ========================= */

interface CreatePtSessionPlanFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    duration: number;
    duration_unit: "day" | "week" | "month" | "year";
    minutes_per_session: number;
    total_sessions: number;
    loyalty_points_reward: number;
    unlimited_sold: boolean;
    total_quota: number | undefined;
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
}

export default function CreatePtSessionPlan() {
    const router = useRouter();
    const createMutation = useCreatePtSessionPlan();
    const { branchId } = useBranch();

    const form = useForm<CreatePtSessionPlanFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            category: "",
            description: "",
            color: "",
            price: 0,
            duration: 1,
            duration_unit: "month",
            minutes_per_session: 60,
            total_sessions: 1,
            loyalty_points_reward: 0,
            unlimited_sold: true,
            total_quota: undefined,
            always_available: true,
            available_from: "",
            available_until: "",
            is_active: true,
        },
    });

    const unlimitedSold = useWatch({ control: form.control, name: "unlimited_sold" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    const onSubmit = async (formData: CreatePtSessionPlanFormData) => {
        try {
            const payload: PtSessionPlanCreateRequest = {
                name: formData.name,
                category: formData.category,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                duration: formData.duration,
                duration_unit: formData.duration_unit,
                minutes_per_session: formData.minutes_per_session,
                total_sessions: formData.total_sessions,
                loyalty_points_reward: formData.loyalty_points_reward,
                unlimited_sold: formData.unlimited_sold,
                total_quota: formData.unlimited_sold ? undefined : formData.total_quota,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
                branch_id: branchId ?? undefined,
            };

            await createMutation.mutateAsync(payload);
            toast.success("PT session plan created successfully");
            router.push("/pt-sessions-plan?success=true");
        } catch (err) {
            toast.error("Failed to create PT session plan");
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
                                <Link href="/pt-sessions-plan">PT Session Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/pt-sessions-plan")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create PT Session Plan</h1>
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
                                <TextInput name="name" label="Session Name" placeholder="Enter session name" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="duration" label="Duration" />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="duration_unit" label="Duration Unit" options={durationUnitOptions} />
                            </div>
                        </div>

                        {/* PRICE, SESSIONS, MINUTES */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="total_sessions" label="Total Sessions" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="minutes_per_session" label="Minutes per Session" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="loyalty_points_reward" label="Loyalty Points" />
                            </div>
                        </div>

                        {/* CATEGORY, DESCRIPTION, COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <TextInput name="category" label="Category" placeholder="e.g Personal Training" />
                            </div>
                            <div className="col-span-5">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
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

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>

                        <div className="flex gap-6 items-start flex-col text-gray-800">
                            <div className="flex flex-row gap-8 items-center w-full">
                                <div className="flex flex-row gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" {...form.register("unlimited_sold")} />
                                    <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                </div>
                                {!unlimitedSold && (
                                    <div className="w-48">
                                        <NumberInput name="total_quota" label="Max Sold / Quota" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row gap-8 items-center w-full">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" {...form.register("always_available")} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>
                                {!alwaysAvailable && (
                                    <>
                                        <div className="w-48">
                                            <TextInput type="date" name="available_from" label="Available From" />
                                        </div>
                                        <div className="w-48">
                                            <TextInput type="date" name="available_until" label="Available Until" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" {...form.register("is_active")} />
                                <span className="text-sm font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
