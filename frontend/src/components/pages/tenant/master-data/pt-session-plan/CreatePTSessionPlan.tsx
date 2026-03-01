"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { PTSessionPlanData } from "@/types/pt-session-plan";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useState } from "react";

export default function CreatePTSessionPlan() {
    const router = useRouter();

    const form = useForm<PTSessionPlanData>({
        mode: "onChange",
        defaultValues: {
            id: "",
            name: "",
            category: "Daily Visit",
            description: "",
            duration: 1,
            durationUnit: "day",
            price: 0,
            minutesPerSession: 60,
            loyaltyPoint: 0,
            availabilitySetting: {
                unlimitedSold: true,
                quota: undefined,
                alwaysAvailable: true,
                availableFrom: "2000-01-01",
                availableUntil: "2100-12-31",
            },
        },
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

    const onSubmit = (data: PTSessionPlanData) => {
        console.log("PT Session Plan Data:", data);
        router.push("/pt-sessions-plan?success=true");
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/pt-session-plan">PT Session Plan</Link>
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

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Session Name" placeholder="Enter session name" />
                            </div>

                            <div className="col-span-3">
                                <NumberInput name="duration" label="Duration" />
                            </div>
                            <div className="col-span-3">
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
                        </div>

                        {/* Price, Duration & Minutes */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="minutesPerSession" label="Minutes per Session" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="loyaltyPoint" label="Loyalty Point" />
                            </div>
                            <div className="col-span-3">
                                <SearchableDropdown name="category" label="Category" options={categoryOptions} />
                            </div>
                        </div>

                        {/* Loyalty Point */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
                            </div>
                        </div>

                        <hr />

                        {/* Availability Setting */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability Setting</h2>
                        <div className="flex gap-6 items-start flex-col text-gray-800">
                            <div className="w-1/2 flex flex-row gap-8 items-center  w-full ">
                                <div className="flex flex-row gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm " {...form.register("availabilitySetting.unlimitedSold")} />
                                    <span className="text-sm font-medium">Unlimited Sold / Quota</span>
                                </div>

                                {!unlimitedSold && (
                                    <div className="">
                                        <NumberInput name="availabilitySetting.quota" label="Max Sold / Quota" />
                                    </div>
                                )}
                            </div>
                            <div className="w-1/2 flex flex-row gap-8 items-center  w-full ">
                                <div className=" flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" {...form.register("availabilitySetting.alwaysAvailable")} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>

                                {!alwaysAvailable && (
                                    <>
                                        <div className="">
                                            <TextInput type="date" name="availabilitySetting.availableFrom" label="Available From" />
                                        </div>
                                        <div className="">
                                            <TextInput type="date" name="availabilitySetting.availableUntil" label="Available Until" />
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
