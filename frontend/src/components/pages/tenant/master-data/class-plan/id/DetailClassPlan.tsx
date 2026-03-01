"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { ClassPlanData } from "@/types/class-plan";
import { DUMMY_CLASS_PLANS } from "@/lib/dummy/classPlanDummy";
import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function ClassPlanDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const classPlanDetail = useMemo(() => DUMMY_CLASS_PLANS.find((item) => item.id === id), [id]);
    if (!classPlanDetail) notFound();

    const form = useForm<ClassPlanData>({ mode: "onChange", defaultValues: classPlanDetail });

    const unlimitedDaily = useWatch({ control: form.control, name: "sessionSetting.unlimitedDailySession" });
    const unlimitedMonthly = useWatch({ control: form.control, name: "sessionSetting.unlimitedMonthlySession" });

    const accessTypeOptions: DropdownOption<string>[] = [
        { key: "regular", label: "Regular", value: "regular" },
        { key: "premium", label: "Premium", value: "premium" },
        { key: "vip", label: "VIP", value: "vip" },
    ];

    const handleSave = () => {
        console.log("UPDATED:", form.getValues());
        toast.success("Class plan updated");
        setIsEditMode(false);
        router.push("/class-plan?updated=true");
    };

    const handleCancel = () => {
        form.reset(classPlanDetail);
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb + Header */}

                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/class-plan">Class Plan</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/class-plan">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <h1 className="text-2xl font-semibold">Class Plan Detail</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton type="button" iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={() => setIsEditMode(true)}>
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton type="button" className="border px-4 py-2.5" onClick={handleCancel}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="button" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={handleSave}>
                                    Save
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="name" label="Class Name" placeholder="Enter class name" disabled={!isEditMode} />
                            </div>

                            <div className="col-span-6">
                                <SearchableDropdown name="accessType" label="Access Type" options={accessTypeOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Price & Max Visitor */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="minutesPerSession" label="Duration (minutes)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="maxVisitor" label="Max Visitor" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="description" label="Description" placeholder="Enter description" disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* Session Settings */}
                        <h2 className="text-xl font-semibold text-gray-800">Session Settings</h2>
                        <div className="flex flex-col gap-4 text-gray-800">
                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" className="" {...form.register("sessionSetting.unlimitedDailySession")} disabled={!isEditMode} />
                                    <span>Unlimited Daily Sessions</span>
                                </div>
                                {!unlimitedDaily && <NumberInput name="sessionSetting.dailyQuota" label="Daily Quota" disabled={!isEditMode} />}
                            </div>

                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex gap-4 w-1/3 items-center">
                                    <input type="checkbox" {...form.register("sessionSetting.unlimitedMonthlySession")} disabled={!isEditMode} />
                                    <span>Unlimited Monthly Sessions</span>
                                </div>
                                {!unlimitedMonthly && <NumberInput name="sessionSetting.monthlyQuota" label="Monthly Quota" disabled={!isEditMode} />}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
