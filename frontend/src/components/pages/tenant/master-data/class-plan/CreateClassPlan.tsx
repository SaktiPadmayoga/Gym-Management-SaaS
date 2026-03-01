"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { ClassPlanData } from "@/types/class-plan";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useState } from "react";

export default function CreateClassPlan() {
    const router = useRouter();

    const form = useForm<ClassPlanData>({
        mode: "onChange",
        defaultValues: {
            id: "",
            name: "",

            description: "",
            price: 0,
            minutesPerSession: 60,
            maxVisitor: 10,
            accessType: "regular",
            sessionSetting: {
                unlimitedDailySession: true,
                unlimitedMonthlySession: false,
                dailyQuota: undefined,
                monthlyQuota: undefined,
            },
        },
    });

    const unlimitedDaily = useWatch({
        control: form.control,
        name: "sessionSetting.unlimitedDailySession",
    });

    const unlimitedMonthly = useWatch({
        control: form.control,
        name: "sessionSetting.unlimitedMonthlySession",
    });

    const accessTypeOptions: DropdownOption<string>[] = [
        { key: "regular", label: "Regular", value: "regular" },
        { key: "premium", label: "Premium", value: "premium" },
        { key: "vip", label: "VIP", value: "vip" },
    ];

    const onSubmit = (data: ClassPlanData) => {
        console.log("Class Plan Data:", data);
        router.push("/class-plan?success=true");
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

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Class Name" placeholder="Enter class name" />
                            </div>

                            <div className="col-span-6">
                                <SearchableDropdown name="accessType" label="Access Type" options={accessTypeOptions} />
                            </div>
                        </div>

                        {/* Price & Max Visitor */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="minutesPerSession" label="Duration (minutes)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="maxVisitor" label="Max Visitor" />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
                            </div>
                        </div>

                        <hr />

                        {/* Session Settings */}
                        <h2 className="text-xl font-semibold text-gray-800">Session Settings</h2>
                        <div className="flex flex-col gap-4 text-gray-800">
                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" className="" {...form.register("sessionSetting.unlimitedDailySession")} />
                                    <span>Unlimited Daily Sessions</span>
                                </div>
                                {!unlimitedDaily && <NumberInput name="sessionSetting.dailyQuota" label="Daily Quota" />}
                            </div>

                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" {...form.register("sessionSetting.unlimitedMonthlySession")} />
                                    <span>Unlimited Monthly Sessions</span>
                                </div>
                                {!unlimitedMonthly && <NumberInput name="sessionSetting.monthlyQuota" label="Monthly Quota" />}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
