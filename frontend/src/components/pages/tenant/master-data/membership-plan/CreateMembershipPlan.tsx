"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { MembershipPlanData } from "@/types/membership-plan";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useState } from "react";

export default function CreateMembershipPlan() {
    const router = useRouter();
    const [showSchedule, setShowSchedule] = useState(false);

    const form = useForm<MembershipPlanData>({
        mode: "onChange",
        defaultValues: {
            id: "",
            name: "",
            category: "",

            price: 0,
            duration: 1,
            durationUnit: "month",
            description: "",

            maxSharingAccess: 0,
            loyaltyPoint: 0,

            checkinSetting: {
                accessType: "all_club",
                classAccessType: "all_classes",
                unlimitedCheckinMembership: true,
                unlimitedCheckinClass: true,
            },

            availabilitySetting: {
                unlimitedSold: true,
                quota: undefined,

                alwaysAvailable: true,
                availableFrom: "2000-01-01",
                availableUntil: "2100-12-31",
            },

            /** 🔥 DEFAULT 24 JAM SETIAP HARI */
            checkinSchedule: {
                monday: { enabled: true, startAt: "00:00", endAt: "23:59" },
                tuesday: { enabled: true, startAt: "00:00", endAt: "23:59" },
                wednesday: { enabled: true, startAt: "00:00", endAt: "23:59" },
                thursday: { enabled: true, startAt: "00:00", endAt: "23:59" },
                friday: { enabled: true, startAt: "00:00", endAt: "23:59" },
                saturday: { enabled: true, startAt: "00:00", endAt: "23:59" },
                sunday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            },
        },
    });

    const onSubmit = (data: MembershipPlanData) => {
        console.log("Membership Plan Data:", data);
        router.push("/membership-plan?success=true");
    };

    const categoryOptions: DropdownOption<string>[] = [
        { key: "gym-access", label: "Gym Access", value: "Gym Access" },
        { key: "personal-training", label: "Personal Training", value: "Personal Training" },
        { key: "class-package", label: "Class Package", value: "Class Package" },
        { key: "premium", label: "Premium", value: "Premium" },
    ];

    const days = [
        { key: "monday", label: "Monday" },
        { key: "tuesday", label: "Tuesday" },
        { key: "wednesday", label: "Wednesday" },
        { key: "thursday", label: "Thursday" },
        { key: "friday", label: "Friday" },
        { key: "saturday", label: "Saturday" },
        { key: "sunday", label: "Sunday" },
    ] as const;

    const unlimitedMembership = useWatch({
        control: form.control,
        name: "checkinSetting.unlimitedCheckinMembership",
    });

    const unlimitedClass = useWatch({
        control: form.control,
        name: "checkinSetting.unlimitedCheckinClass",
    });

    const unlimitedSold = useWatch({
        control: form.control,
        name: "availabilitySetting.unlimitedSold",
    });

    const alwaysAvailable = useWatch({
        control: form.control,
        name: "availabilitySetting.alwaysAvailable",
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
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

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <TextInput name="name" label="Plan Name" placeholder="Enter plan name" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="category" label="Category" options={categoryOptions} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
                            </div>
                        </div>

                        {/* Price & Duration */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="duration" label="Duration" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown
                                    name="durationUnit"
                                    label="Duration Unit"
                                    options={[
                                        { key: "day", label: "Day", value: "day" },
                                        { key: "week", label: "Week", value: "week" },
                                        { key: "month", label: "Month", value: "month" },
                                        { key: "year", label: "Year", value: "year" },
                                    ]}
                                />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="loyaltyPoint" label="Loyalty Point" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="maxSharingAccess" label="Max Sharing Access" />
                            </div>
                        </div>

                        <hr />

                        <h2 className="text-xl font-semibold text-gray-800">Checkin setting</h2>

                        <div className="flex flex-col gap-5 text-zinc-800">
                            <div className="flex flex-row gap-5 w-full">
                                <div className="w-full">
                                    <SearchableDropdown
                                        name="checkinSetting.accessType"
                                        label="Access Type"
                                        options={[
                                            {
                                                key: "all-club",
                                                label: "All Club",
                                                value: "all_club",
                                            },
                                            {
                                                key: "single-club",
                                                label: "Single Club",
                                                value: "single_club",
                                            },
                                        ]}
                                    />
                                </div>
                                <div className="grid grid-cols-12 gap-3 items-center w-full">
                                    {/* Checkbox */}
                                    <div className="col-span-6 flex items-center gap-3 ">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("checkinSetting.unlimitedCheckinMembership")} />
                                        <span className="text-sm font-medium">Unlimited Membership Check-in</span>
                                    </div>

                                    {/* Quota muncul jika LIMITED */}
                                    {!unlimitedMembership && (
                                        <div className="col-span-6">
                                            <NumberInput name="checkinSetting.membershipQuota" label="Membership Check-in Quota" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-row w-full gap-5 ">
                                <div className="w-full">
                                    <SearchableDropdown
                                        name="checkinSetting.classAccessType"
                                        label="Class Access Type"
                                        options={[
                                            {
                                                key: "all-classes",
                                                label: "All Classes",
                                                value: "all_classes",
                                            },
                                            {
                                                key: "premium-only",
                                                label: "Premium Only",
                                                value: "premium_class_only",
                                            },
                                            {
                                                key: "regular-only",
                                                label: "Regular Only",
                                                value: "regular_class_only",
                                            },
                                            {
                                                key: "no-access",
                                                label: "No Access",
                                                value: "no_access_to_all_classes",
                                            },
                                        ]}
                                    />
                                </div>
                                <div className="grid grid-cols-12 gap-3 items-center w-full">
                                    {/* Checkbox */}
                                    <div className="col-span-6 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("checkinSetting.unlimitedCheckinClass")} />
                                        <span className="text-sm font-medium">Unlimited Class Check-in</span>
                                    </div>

                                    {/* Quota muncul jika LIMITED */}
                                    {!unlimitedClass && (
                                        <div className="col-span-6">
                                            <NumberInput name="checkinSetting.classQuota" label="Class Check-in Quota" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Availability */}

                        <hr />

                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>
                        <div className=" text-gray-800">
                            <div className="grid grid-cols-12 gap-6">
                                {/* Unlimited Sold */}
                                <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("availabilitySetting.unlimitedSold")} />
                                        <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                    </div>

                                    {!unlimitedSold && (
                                        <div className="col-span-4">
                                            <NumberInput name="availabilitySetting.quota" label="Max Sold / Quota" />
                                        </div>
                                    )}
                                </div>

                                {/* Always Available */}
                                <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" {...form.register("availabilitySetting.alwaysAvailable")} />
                                        <span className="text-sm font-medium">Always Available</span>
                                    </div>

                                    {!alwaysAvailable && (
                                        <>
                                            <div className="col-span-4">
                                                <TextInput type="date" name="availabilitySetting.availableFrom" label="Available From" />
                                            </div>
                                            <div className="col-span-4">
                                                <TextInput type="date" name="availabilitySetting.availableUntil" label="Available Until" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Toggle Schedule */}
                        <div className="flex items-center gap-3 text-zinc-800">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} />
                            <span className="text-sm font-medium">Custom Check-in Schedule</span>
                        </div>

                        {/* Check-in Schedule */}
                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg text-zinc-800">
                                <p className="text-sm font-medium mb-4">Check-in Schedule</p>

                                <div className="flex flex-col gap-3">
                                    {days.map((day) => {
                                        const enabled = form.watch(`checkinSchedule.${day.key}.enabled`);

                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border border-zinc-300">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" {...form.register(`checkinSchedule.${day.key}.enabled`)} />
                                                    <span>{day.label}</span>
                                                </div>

                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkinSchedule.${day.key}.startAt`} disabled={!enabled} />
                                                </div>

                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkinSchedule.${day.key}.endAt`} disabled={!enabled} />
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
