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
import { useMembershipPlan, useUpdateMembershipPlan, useToggleMembershipPlan, useDuplicateMembershipPlan, useSyncClassPlans } from "@/hooks/tenant/useMembershipPlans";
import { useClassPlans } from "@/hooks/tenant/useClassPlans";
import { MembershipPlanUpdateRequest, DEFAULT_CHECKIN_SCHEDULE, CheckinSchedule } from "@/types/tenant/membership-plans";
import { ClassPlanData } from "@/types/tenant/class-plans";

/* =========================
 * OPTIONS
 * ========================= */

const durationUnitOptions: DropdownOption<string>[] = [
    { key: "day", label: "Day", value: "day" },
    { key: "week", label: "Week", value: "week" },
    { key: "month", label: "Month", value: "month" },
    { key: "year", label: "Year", value: "year" },
];

const accessTypeOptions: DropdownOption<string>[] = [
    { key: "single_branch", label: "Single Branch", value: "single_branch" },
    { key: "all_branches", label: "All Branches", value: "all_branches" },
];

const DAYS = [
    { key: "mon", label: "Monday" },
    { key: "tue", label: "Tuesday" },
    { key: "wed", label: "Wednesday" },
    { key: "thu", label: "Thursday" },
    { key: "fri", label: "Friday" },
    { key: "sat", label: "Saturday" },
    { key: "sun", label: "Sunday" },
] as const;

/* =========================
 * FORM TYPE
 * ========================= */

interface MembershipPlanFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    duration: number;
    duration_unit: "day" | "week" | "month" | "year";
    loyalty_points_reward: number;
    max_sharing_members: number;
    access_type: "all_branches" | "single_branch";
    unlimited_checkin: boolean;
    checkin_quota_per_month: number | undefined;
    unlimited_sold: boolean;
    total_quota: number | undefined;
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
    checkin_schedule: CheckinSchedule;
}

/* =========================
 * CLASS PLAN SELECTOR
 * (inline — tidak perlu file terpisah)
 * ========================= */

function ClassPlanSelector({ membershipPlanId, includedClassPlans }: { membershipPlanId: string; includedClassPlans: ClassPlanData[] }) {
    const { data: allPlansData } = useClassPlans({ is_active: true, per_page: 100 });
    const syncMutation = useSyncClassPlans();
    const allPlans: ClassPlanData[] = allPlansData ?? [];

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(includedClassPlans.map((cp) => cp.id)));
    const [isDirty, setIsDirty] = useState(false);

    // Sync selectedIds jika includedClassPlans berubah (setelah fetch)
    useEffect(() => {
        setSelectedIds(new Set(includedClassPlans.map((cp) => cp.id)));
    }, [includedClassPlans.length]);

    const toggle = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
        setIsDirty(true);
    };

    const handleSync = async () => {
        try {
            await syncMutation.mutateAsync({
                id: membershipPlanId,
                classPlansIds: Array.from(selectedIds),
            });
            toast.success("Class plans updated");
            setIsDirty(false);
        } catch {
            toast.error("Failed to update class plans");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Included Class Plans</h2>
                    <p className="text-sm text-zinc-500">Select class plans that members with this plan can access</p>
                </div>
                {isDirty && (
                    <CustomButton type="button" className="bg-aksen-secondary text-white px-4 py-2" onClick={handleSync} disabled={syncMutation.isPending}>
                        {syncMutation.isPending ? "Saving..." : "Save Changes"}
                    </CustomButton>
                )}
            </div>

            {allPlans.length === 0 ? (
                <p className="text-sm text-zinc-400">No class plans available. Create one first.</p>
            ) : (
                <div className="grid grid-cols-12 gap-3">
                    {allPlans.map((cp) => {
                        const isSelected = selectedIds.has(cp.id);
                        return (
                            <div
                                key={cp.id}
                                onClick={() => toggle(cp.id)}
                                className={`col-span-4 cursor-pointer rounded-xl border-2 p-4 transition-all ${isSelected ? "border-aksen-secondary bg-aksen-secondary/5" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {cp.color && <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: cp.color }} />}
                                        <p className="font-medium text-zinc-800 text-sm">{cp.name}</p>
                                    </div>
                                    <input type="checkbox" checked={isSelected} onChange={() => toggle(cp.id)} onClick={(e) => e.stopPropagation()} className="rounded" />
                                </div>
                                <div className="mt-2 space-y-0.5 text-xs text-zinc-500">
                                    <p>
                                        {cp.minutes_per_session} min · {cp.max_capacity} pax
                                    </p>
                                    <p>{cp.unlimited_monthly_session ? "Unlimited / month" : `${cp.monthly_quota ?? "-"}x / month`}</p>
                                    {cp.category && <span className="inline-block bg-zinc-100 text-zinc-600 rounded px-1.5 py-0.5 mt-1">{cp.category}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* =========================
 * MAIN PAGE
 * ========================= */

export default function DetailMembershipPlan() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const { data: plan, isLoading, isError } = useMembershipPlan(id);
    const updateMutation = useUpdateMembershipPlan();
    const toggleMutation = useToggleMembershipPlan();
    const duplicateMutation = useDuplicateMembershipPlan();

    const form = useForm<MembershipPlanFormData>({ mode: "onChange" });

    const unlimitedCheckin = useWatch({ control: form.control, name: "unlimited_checkin" });
    const unlimitedSold = useWatch({ control: form.control, name: "unlimited_sold" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!plan) return;
        setShowSchedule(!!plan.checkin_schedule);
        form.reset({
            name: plan.name,
            category: plan.category,
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            duration: plan.duration,
            duration_unit: plan.duration_unit,
            loyalty_points_reward: plan.loyalty_points_reward,
            max_sharing_members: plan.max_sharing_members,
            access_type: plan.access_type,
            unlimited_checkin: plan.unlimited_checkin,
            checkin_quota_per_month: plan.checkin_quota_per_month ?? undefined,
            unlimited_sold: plan.unlimited_sold,
            total_quota: plan.total_quota ?? undefined,
            always_available: plan.always_available,
            available_from: plan.available_from ?? "",
            available_until: plan.available_until ?? "",
            is_active: plan.is_active,
            checkin_schedule: (plan.checkin_schedule as CheckinSchedule) ?? DEFAULT_CHECKIN_SCHEDULE,
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
            const payload: MembershipPlanUpdateRequest = {
                name: formData.name,
                category: formData.category,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                duration: formData.duration,
                duration_unit: formData.duration_unit,
                loyalty_points_reward: formData.loyalty_points_reward,
                max_sharing_members: formData.max_sharing_members,
                access_type: formData.access_type,
                unlimited_checkin: formData.unlimited_checkin,
                checkin_quota_per_month: formData.unlimited_checkin ? undefined : formData.checkin_quota_per_month,
                unlimited_sold: formData.unlimited_sold,
                total_quota: formData.unlimited_sold ? undefined : formData.total_quota,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
                checkin_schedule: showSchedule ? formData.checkin_schedule : undefined,
            };

            await updateMutation.mutateAsync({ id, payload });
            toast.success("Membership plan updated successfully");
            setIsEditMode(false);
            router.push("/membership-plan?updated=true");
        } catch {
            toast.error("Failed to update membership plan");
        }
    };

    const handleCancel = () => {
        if (!plan) return;
        setShowSchedule(!!plan.checkin_schedule);
        form.reset({
            name: plan.name,
            category: plan.category,
            description: plan.description ?? "",
            color: plan.color ?? "",
            price: Number(plan.price),
            duration: plan.duration,
            duration_unit: plan.duration_unit,
            loyalty_points_reward: plan.loyalty_points_reward,
            max_sharing_members: plan.max_sharing_members,
            access_type: plan.access_type,
            unlimited_checkin: plan.unlimited_checkin,
            checkin_quota_per_month: plan.checkin_quota_per_month ?? undefined,
            unlimited_sold: plan.unlimited_sold,
            total_quota: plan.total_quota ?? undefined,
            always_available: plan.always_available,
            available_from: plan.available_from ?? "",
            available_until: plan.available_until ?? "",
            is_active: plan.is_active,
            checkin_schedule: (plan.checkin_schedule as CheckinSchedule) ?? DEFAULT_CHECKIN_SCHEDULE,
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
                                <Link href="/membership-plan">Membership Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">{plan?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/membership-plan")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div className="flex items-center gap-2">
                                {plan?.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />}
                                <h1 className="text-2xl font-semibold">Membership Plan Detail</h1>
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
                                <div className="flex gap-2">
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
                            <div className="col-span-4">
                                <TextInput name="name" label="Plan Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="category" label="Category" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="description" label="Description" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* PRICE & DURATION */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="duration" label="Duration" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="duration_unit" label="Duration Unit" options={durationUnitOptions} disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="loyalty_points_reward" label="Loyalty Points Reward" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="max_sharing_members" label="Max Sharing Members" disabled={!isEditMode} />
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

                        {/* CHECKIN SETTING */}
                        <h2 className="text-xl font-semibold text-gray-800">Check-in Setting</h2>

                        <div className="flex flex-col gap-5 text-zinc-800">
                            <div className="flex flex-row gap-5 w-full">
                                <div className="w-full">
                                    <SearchableDropdown name="access_type" label="Access Type" options={accessTypeOptions} disabled={!isEditMode} />
                                </div>
                                <div className="grid grid-cols-12 gap-3 items-center w-full">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("unlimited_checkin")} />
                                        <span className="text-sm font-medium">Unlimited Check-in</span>
                                    </div>
                                    {!unlimitedCheckin && (
                                        <div className="col-span-6">
                                            <NumberInput name="checkin_quota_per_month" label="Check-in Quota / Month" disabled={!isEditMode} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>

                        <div className="grid grid-cols-12 gap-6 text-gray-800">
                            <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("unlimited_sold")} />
                                    <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                </div>
                                {!unlimitedSold && (
                                    <div className="col-span-4">
                                        <NumberInput name="total_quota" label="Max Sold / Quota" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>

                            <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("always_available")} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>
                                {!alwaysAvailable && (
                                    <>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="available_from" label="Available From" disabled={!isEditMode} />
                                        </div>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="available_until" label="Available Until" disabled={!isEditMode} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="col-span-12 flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("is_active")} />
                                <span className="text-sm font-medium">Active</span>
                            </div>
                        </div>

                        <hr />

                        {/* CHECKIN SCHEDULE */}
                        <div className="flex items-center gap-3 text-zinc-800">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} disabled={!isEditMode} className="checkbox checkbox-sm" />
                            <span className="text-sm font-medium">Custom Check-in Schedule</span>
                        </div>

                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <p className="text-sm font-medium mb-4 text-zinc-700">Check-in Schedule</p>
                                <div className="flex flex-col gap-3">
                                    {DAYS.map((day) => {
                                        const isOpen = form.watch(`checkin_schedule.${day.key}.is_open`);
                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border border-zinc-300">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" disabled={!isEditMode} {...form.register(`checkin_schedule.${day.key}.is_open`)} />
                                                    <span>{day.label}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkin_schedule.${day.key}.open`} disabled={!isOpen || !isEditMode} />
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkin_schedule.${day.key}.close`} disabled={!isOpen || !isEditMode} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <hr />

                        {/* CLASS PLAN INCLUSIONS */}
                        {/* Section ini independen dari isEditMode — bisa diubah kapan saja */}
                        <ClassPlanSelector membershipPlanId={id} includedClassPlans={(plan?.class_plans ?? []) as ClassPlanData[]} />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
