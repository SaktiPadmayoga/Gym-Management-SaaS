"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { PTSessionPlanData } from "@/types/pt-session-plan";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useParams, useRouter, notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/** ===== DUMMY DETAIL (GANTI API) ===== */
import { DUMMY_PT_SESSION_PLANS } from "@/lib/dummy/ptSessionPlanDummy";
import Link from "next/link";

export default function PTSessionPlanDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const ptDetail = useMemo(() => {
        return DUMMY_PT_SESSION_PLANS.find((item) => item.id === id);
    }, [id]);

    if (!ptDetail) notFound();

    const form = useForm<PTSessionPlanData>({
        mode: "onChange",
        defaultValues: ptDetail,
    });

    const unlimitedSold = useWatch({
        control: form.control,
        name: "availabilitySetting.unlimitedSold",
    });

    const alwaysAvailable = useWatch({
        control: form.control,
        name: "availabilitySetting.alwaysAvailable",
    });

    const categoryOptions: DropdownOption<string>[] = [
        { key: "daily", label: "Daily Visit", value: "Daily Visit" },
        { key: "weekly", label: "Weekly Plan", value: "Weekly Plan" },
        { key: "monthly", label: "Monthly Plan", value: "Monthly Plan" },
        { key: "quarterly", label: "Quarterly Plan", value: "Quarterly Plan" },
    ];

    /** ================= ACTION ================= */
    const handleSave = () => {
        console.log("UPDATED PT SESSION PLAN:", form.getValues());
        toast.success("PT Session Plan updated");
        router.push("/pt-sessions-plan?updated=true");
        setIsEditMode(false);
    };

    const handleCancel = () => {
        form.reset(ptDetail);
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
                                <Link href="/pt-sessions-plan">PT Session Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>

                    {/* HEADER */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/pt-sessions-plan")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">PT Session Plan Detail</h1>
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
                        {/* Basic Info */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Session Name" placeholder="Enter session name" disabled={!isEditMode} />
                            </div>

                            <div className="col-span-3">
                                <NumberInput name="duration" label="Duration" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
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
                        </div>

                        {/* Price, Duration & Minutes */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="price" label="Price (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="minutesPerSession" label="Minutes per Session" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="loyaltyPoint" label="Loyalty Point" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="category" label="Category" options={categoryOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Loyalty Point */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="description" label="Description" placeholder="Enter description" disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* Availability Setting */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>
                        <div className="flex gap-6 items-start flex-col text-gray-800">
                            <div className="w-1/2 flex flex-row gap-8 items-center  w-full ">
                                <div className="flex flex-row gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm " {...form.register("availabilitySetting.unlimitedSold")} disabled={!isEditMode} />
                                    <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                </div>

                                {!unlimitedSold && (
                                    <div className="">
                                        <NumberInput name="availabilitySetting.quota" label="Max Sold / Quota" disabled={!isEditMode} />
                                    </div>
                                )}
                            </div>
                            <div className="w-1/2 flex flex-row gap-8 items-center  w-full ">
                                <div className=" flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" {...form.register("availabilitySetting.alwaysAvailable")} disabled={!isEditMode} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>

                                {!alwaysAvailable && (
                                    <>
                                        <div className="">
                                            <TextInput type="date" name="availabilitySetting.availableFrom" label="Available From" disabled={!isEditMode} />
                                        </div>
                                        <div className="">
                                            <TextInput type="date" name="availabilitySetting.availableUntil" label="Available Until" disabled={!isEditMode} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
