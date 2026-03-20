"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { usePtSessionPlan, useUpdatePtSessionPlan, useTogglePtSessionPlan, useDuplicatePtSessionPlan } from "@/hooks/tenant/usePtSessionPlans";
import { PtSessionPlanUpdateRequest } from "@/types/tenant/pt-session-plans";

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

interface PtSessionPlanFormData {
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

export default function PtSessionPlanDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: plan, isLoading, isError } = usePtSessionPlan(id);
    const updateMutation = useUpdatePtSessionPlan();
    const toggleMutation = useTogglePtSessionPlan();
    const duplicateMutation = useDuplicatePtSessionPlan();

    const form = useForm<PtSessionPlanFormData>({ mode: "onChange" });

    const unlimitedSold = useWatch({ control: form.control, name: "unlimited_sold" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            category: plan.category,
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            duration: plan.duration,
            duration_unit: plan.duration_unit,
            minutes_per_session: plan.minutes_per_session,
            total_sessions: plan.total_sessions,
            loyalty_points_reward: plan.loyalty_points_reward,
            unlimited_sold: plan.unlimited_sold,
            total_quota: plan.total_quota ?? undefined,
            always_available: plan.always_available,
            available_from: plan.available_from ?? "",
            available_until: plan.available_until ?? "",
            is_active: plan.is_active,
        });
    }, [plan]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError) return notFound();

    /* =========================
     * SAVE
     * ========================= */
    const handleSave = async () => {
        try {
            const formData = form.getValues();
            const payload: PtSessionPlanUpdateRequest = {
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
            };

            await updateMutation.mutateAsync({ id, payload });
            toast.success("PT session plan updated successfully");
            setIsEditMode(false);
            router.push("/pt-sessions-plan?updated=true");
        } catch {
            toast.error("Failed to update PT session plan");
        }
    };

    const handleCancel = () => {
        if (!plan) return;
        form.reset({
            name: plan.name,
            category: plan.category,
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            duration: plan.duration,
            duration_unit: plan.duration_unit,
            minutes_per_session: plan.minutes_per_session,
            total_sessions: plan.total_sessions,
            loyalty_points_reward: plan.loyalty_points_reward,
            unlimited_sold: plan.unlimited_sold,
            total_quota: plan.total_quota ?? undefined,
            always_available: plan.always_available,
            available_from: plan.available_from ?? "",
            available_until: plan.available_until ?? "",
            is_active: plan.is_active,
        });
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <Toaster position="top-center" />
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/pt-sessions-plan">PT Session Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">{plan?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/pt-sessions-plan")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div className="flex items-center gap-2">
                                {plan?.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />}
                                <h1 className="text-2xl font-semibold">PT Session Plan Detail</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <CustomButton
                                type="button"
                                className="border text-zinc-600 px-3 py-2 text-sm"
                                onClick={() =>
                                    duplicateMutation.mutate(id, {
                                        onSuccess: () => toast.success("Plan duplicated"),
                                        onError: () => toast.error("Failed to duplicate"),
                                    })
                                }
                                disabled={duplicateMutation.isPending}
                            >
                                Duplicate
                            </CustomButton>

                            <CustomButton
                                type="button"
                                className={`border px-3 py-2 text-sm ${plan?.is_active ? "text-orange-600 border-orange-200" : "text-green-600 border-green-200"}`}
                                onClick={() =>
                                    toggleMutation.mutate(id, {
                                        onSuccess: () => toast.success(`Plan ${plan?.is_active ? "deactivated" : "activated"}`),
                                        onError: () => toast.error("Failed to update status"),
                                    })
                                }
                                disabled={toggleMutation.isPending}
                            >
                                {plan?.is_active ? "Deactivate" : "Activate"}
                            </CustomButton>

                            {!isEditMode ? (
                                <CustomButton iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" type="button" onClick={() => setIsEditMode(true)}>
                                    Edit
                                </CustomButton>
                            ) : (
                                <div className="flex gap-3">
                                    <CustomButton type="button" className="border py-2.5 px-4" onClick={handleCancel}>
                                        Cancel
                                    </CustomButton>
                                    <CustomButton type="button" className="bg-aksen-secondary text-white py-2.5 px-4" onClick={handleSave} disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </CustomButton>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Session Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="duration" label="Duration" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="duration_unit" label="Duration Unit" options={durationUnitOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* PRICE, SESSIONS, MINUTES */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="price" label="Price (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="total_sessions" label="Total Sessions" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="minutes_per_session" label="Minutes per Session" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="loyalty_points_reward" label="Loyalty Points" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* CATEGORY, DESCRIPTION, COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <TextInput name="category" label="Category" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-5">
                                <TextInput name="description" label="Description" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" {...form.register("color")} disabled={!isEditMode} className="w-10 h-10 rounded cursor-pointer border border-zinc-200 disabled:opacity-50" />
                                    <TextInput name="color" disabled={!isEditMode} />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>

                        <div className="flex gap-6 items-start flex-col text-gray-800">
                            <div className="flex flex-row gap-8 items-center w-full">
                                <div className="flex flex-row gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("unlimited_sold")} />
                                    <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                </div>
                                {!unlimitedSold && (
                                    <div className="w-48">
                                        <NumberInput name="total_quota" label="Max Sold / Quota" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row gap-8 items-center w-full">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("always_available")} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>
                                {!alwaysAvailable && (
                                    <>
                                        <div className="w-48">
                                            <TextInput type="date" name="available_from" label="Available From" disabled={!isEditMode} />
                                        </div>
                                        <div className="w-48">
                                            <TextInput type="date" name="available_until" label="Available Until" disabled={!isEditMode} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("is_active")} />
                                <span className="text-sm font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
