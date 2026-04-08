"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useState } from "react";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import { useCreateMembershipPlan } from "@/hooks/tenant/useMembershipPlans";
import { MembershipPlanCreateRequest, DEFAULT_CHECKIN_SCHEDULE, CheckinSchedule } from "@/types/tenant/membership-plans";

/* =========================
 * OPTIONS
 * ========================= */

const durationUnitOptions: DropdownOption<string>[] = [
    { key: "day", label: "Day", value: "day" },
    { key: "week", label: "Week", value: "week" },
    { key: "month", label: "Month", value: "month" },
    { key: "year", label: "Year", value: "year" },
];

// PERBAIKAN: Mengganti 'all_branches' menjadi 'cross_branch'
const accessTypeOptions: DropdownOption<string>[] = [
    { key: "single_branch", label: "Single Branch", value: "single_branch" },
    { key: "cross_branch", label: "Cross Branch (Multiple)", value: "cross_branch" },
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

interface CreateMembershipPlanFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    duration: number;
    duration_unit: "day" | "week" | "month" | "year";
    loyalty_points_reward: number;
    max_sharing_members: number;
    access_type: "cross_branch" | "single_branch"; // PERBAIKAN TYPE
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

export default function CreateMembershipPlan() {
    const router = useRouter();
    const createMutation = useCreateMembershipPlan();
    const { branchId } = useBranch();

    const [showSchedule, setShowSchedule] = useState(false);

    const form = useForm<CreateMembershipPlanFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            category: "",
            description: "",
            color: "",
            price: 0,
            duration: 1,
            duration_unit: "month",
            loyalty_points_reward: 0,
            max_sharing_members: 0,
            access_type: "single_branch",
            unlimited_checkin: true,
            checkin_quota_per_month: undefined,
            unlimited_sold: true,
            total_quota: undefined,
            always_available: true,
            available_from: "",
            available_until: "",
            is_active: true,
            checkin_schedule: DEFAULT_CHECKIN_SCHEDULE,
        },
    });

    const unlimitedCheckin = useWatch({ control: form.control, name: "unlimited_checkin" });
    const unlimitedSold = useWatch({ control: form.control, name: "unlimited_sold" });
    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    const onSubmit = async (formData: CreateMembershipPlanFormData) => {
        try {
            const payload: MembershipPlanCreateRequest = {
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
                branch_id: branchId ?? undefined,
            };

            await createMutation.mutateAsync(payload);
            toast.success("Membership plan created successfully");
            router.push("/membership-plan?success=true");
        } catch (err) {
            toast.error("Failed to create membership plan");
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
                                <Link href="/membership-plan">Membership Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/membership-plan")}>
                                <Icon name="back" className="h-7 w-7" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Membership Plan</h1>
                        </div>
                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <TextInput name="name" label="Plan Name" placeholder="Enter plan name" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="category" label="Category" placeholder="e.g Basic, Premium, VIP" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
                            </div>
                        </div>

                        {/* PRICE & DURATION */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="duration" label="Duration" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="duration_unit" label="Duration Unit" options={durationUnitOptions} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="loyalty_points_reward" label="Loyalty Points Reward" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="max_sharing_members" label="Max Sharing Members" />
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

                        {/* CHECKIN SETTING */}
                        <h2 className="text-xl font-semibold text-gray-800">Check-in Setting</h2>

                        <div className="flex flex-col gap-5 text-zinc-800">
                            <div className="flex flex-row gap-5 w-full">
                                <div className="w-full">
                                    <SearchableDropdown name="access_type" label="Access Type" options={accessTypeOptions} />
                                </div>
                                <div className="grid grid-cols-12 gap-3 items-center w-full">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("unlimited_checkin")} />
                                        <span className="text-sm font-medium">Unlimited Check-in</span>
                                    </div>
                                    {!unlimitedCheckin && (
                                        <div className="col-span-6">
                                            <NumberInput name="checkin_quota_per_month" label="Check-in Quota / Month" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>

                        <div className="text-gray-800">
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("unlimited_sold")} />
                                        <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                    </div>
                                    {!unlimitedSold && (
                                        <div className="col-span-4">
                                            <NumberInput name="total_quota" label="Max Sold / Quota" />
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("always_available")} />
                                        <span className="text-sm font-medium">Always Available</span>
                                    </div>
                                    {!alwaysAvailable && (
                                        <>
                                            <div className="col-span-4">
                                                <TextInput type="date" name="available_from" label="Available From" />
                                            </div>
                                            <div className="col-span-4">
                                                <TextInput type="date" name="available_until" label="Available Until" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="col-span-12 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" {...form.register("is_active")} />
                                    <span className="text-sm font-medium">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* CHECKIN SCHEDULE */}
                        <div className="flex items-center gap-3 text-zinc-800">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} className="checkbox checkbox-sm" />
                            <span className="text-sm font-medium">Custom Check-in Schedule</span>
                        </div>

                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg text-zinc-800">
                                <p className="text-sm font-medium mb-4">Check-in Schedule</p>
                                <div className="flex flex-col gap-3">
                                    {DAYS.map((day) => {
                                        const isOpen = form.watch(`checkin_schedule.${day.key}.is_open`);
                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border border-zinc-300">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" {...form.register(`checkin_schedule.${day.key}.is_open`)} />
                                                    <span>{day.label}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkin_schedule.${day.key}.open`} disabled={!isOpen} />
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkin_schedule.${day.key}.close`} disabled={!isOpen} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}