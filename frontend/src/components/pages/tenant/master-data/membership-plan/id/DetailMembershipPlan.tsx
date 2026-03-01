"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { MembershipPlanData } from "@/types/membership-plan";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useParams, useRouter, notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/** ===== DUMMY DETAIL (GANTI API) ===== */
import { DUMMY_MEMBERSHIP_PLANS } from "@/lib/dummy/membershipPlanDummy";
import Link from "next/link";

export default function MembershipPlanDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const membershipDetail = useMemo(() => {
        return DUMMY_MEMBERSHIP_PLANS.find((item) => item.id === id);
    }, [id]);

    if (!membershipDetail) notFound();

    const form = useForm<MembershipPlanData>({
        mode: "onChange",
        defaultValues: membershipDetail,
    });

    /** ================= WATCH ================= */
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

    /** ================= OPTIONS ================= */
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

    /** ================= ACTION ================= */
    const handleSave = () => {
        console.log("UPDATED:", form.getValues());
        router.push("/membership-plan?updated=true");
        toast.success("Membership updated");
        setIsEditMode(false);
    };

    const handleCancel = () => {
        form.reset(membershipDetail);
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
                                <Link href="/membership-plan">Membership Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>
                    {/* HEADER */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/membership-plan")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Membership Plan Detail</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" type="button" onClick={() => setIsEditMode(true)}>
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-3">
                                <CustomButton type="button" className="border py-2.5 px-4" onClick={handleCancel}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="button" className="bg-aksen-secondary text-white py-2.5 px-4" onClick={handleSave}>
                                    Save Changes
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* ================= BASIC INFO ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <TextInput name="name" label="Plan Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="category" label="Category" options={categoryOptions} disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="description" label="Description" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* ================= PRICE & DURATION ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="duration" label="Duration" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown
                                    name="durationUnit"
                                    label="Duration Unit"
                                    disabled={!isEditMode}
                                    options={[
                                        { key: "day", label: "Day", value: "day" },
                                        { key: "week", label: "Week", value: "week" },
                                        { key: "month", label: "Month", value: "month" },
                                        { key: "year", label: "Year", value: "year" },
                                    ]}
                                />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="loyaltyPoint" label="Loyalty Point" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="maxSharingAccess" label="Max Sharing Access" disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* ================= CHECKIN SETTING ================= */}
                        <h2 className="text-xl font-semibold text-gray-800">Checkin Setting</h2>

                        <div className="flex flex-col gap-5 text-zinc-800">
                            {/* MEMBERSHIP */}
                            <div className="flex flex-row gap-5 w-full">
                                <div className="w-full">
                                    <SearchableDropdown
                                        name="checkinSetting.accessType"
                                        label="Access Type"
                                        disabled={!isEditMode}
                                        options={[
                                            { key: "all-club", label: "All Club", value: "all_club" },
                                            { key: "single-club", label: "Single Club", value: "single_club" },
                                        ]}
                                    />
                                </div>

                                <div className="grid grid-cols-12 gap-3 items-center w-full">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("checkinSetting.unlimitedCheckinMembership")} />
                                        <span className="text-sm font-medium">Unlimited Membership Check-in</span>
                                    </div>

                                    {!unlimitedMembership && (
                                        <div className="col-span-6">
                                            <NumberInput name="checkinSetting.membershipQuota" label="Membership Check-in Quota" disabled={!isEditMode} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CLASS */}
                            <div className="flex flex-row w-full gap-5">
                                <div className="w-full">
                                    <SearchableDropdown
                                        name="checkinSetting.classAccessType"
                                        label="Class Access Type"
                                        disabled={!isEditMode}
                                        options={[
                                            { key: "all", label: "All Classes", value: "all_classes" },
                                            { key: "premium", label: "Premium Only", value: "premium_class_only" },
                                            { key: "regular", label: "Regular Only", value: "regular_class_only" },
                                            { key: "none", label: "No Access", value: "no_access_to_all_classes" },
                                        ]}
                                    />
                                </div>

                                <div className="grid grid-cols-12 gap-3 items-center w-full">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("checkinSetting.unlimitedCheckinClass")} />
                                        <span className="text-sm font-medium">Unlimited Class Check-in</span>
                                    </div>

                                    {!unlimitedClass && (
                                        <div className="col-span-6">
                                            <NumberInput name="checkinSetting.classQuota" label="Class Check-in Quota" disabled={!isEditMode} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* ================= AVAILABILITY ================= */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>

                        <div className="grid grid-cols-12 gap-6 text-gray-800">
                            {/* Unlimited Sold */}
                            <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("availabilitySetting.unlimitedSold")} />
                                    <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                </div>

                                {!unlimitedSold && (
                                    <div className="col-span-4">
                                        <NumberInput name="availabilitySetting.quota" label="Max Sold / Quota" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>

                            {/* Always Available */}
                            <div className="col-span-12 grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("availabilitySetting.alwaysAvailable")} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>

                                {!alwaysAvailable && (
                                    <>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="availabilitySetting.availableFrom" label="Available From" disabled={!isEditMode} />
                                        </div>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="availabilitySetting.availableUntil" label="Available Until" disabled={!isEditMode} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <hr />

                        {/* ================= SCHEDULE ================= */}
                        <div className="flex items-center gap-3 text-zinc-800">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} />
                            <span className="text-sm font-medium">Custom Check-in Schedule</span>
                        </div>

                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <div className="flex flex-col gap-3">
                                    {days.map((day) => {
                                        const enabled = form.watch(`checkinSchedule.${day.key}.enabled`);
                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" disabled={!isEditMode} {...form.register(`checkinSchedule.${day.key}.enabled`)} />
                                                    <span>{day.label}</span>
                                                </div>

                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkinSchedule.${day.key}.startAt`} disabled={!enabled || !isEditMode} />
                                                </div>

                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`checkinSchedule.${day.key}.endAt`} disabled={!enabled || !isEditMode} />
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
