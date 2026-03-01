"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { ClassScheduleData } from "@/types/class-schedule";
// import { profileData } from "@/types/profile";
// import { ProfileData } from "@/lib/dummy/profileDummy";
import { DUMMY_CLASS_PLANS } from "@/lib/dummy/classPlanDummy";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { ClassPlanData } from "@/types/class-plan";

export default function CreateClassSchedule() {
    const router = useRouter();

    const form = useForm<ClassScheduleData>({
        mode: "onChange",
        defaultValues: {
            id: "",

            planId: "",
            instructorId: "",

            date: "",
            startAt: "",

            classType: "Membership Only",
            access: "PUBLIC",

            totalManualCheckin: 0,
            note: "",

            status: "Scheduled",
        },
    });

    /** 🔽 Dropdown Options */
    // const instructorOptions: DropdownOption<string>[] = ProfileData.map((profile: profileData) => ({
    //     key: profile.id,
    //     label: `${profile.name} (${profile.id})`,
    //     value: profile.id,
    // }));

    const planOptions: DropdownOption<string>[] = DUMMY_CLASS_PLANS.map((plan: ClassPlanData) => ({
        key: plan.id,
        label: `${plan.name} - Rp ${plan.price.toLocaleString("id-ID")}`,
        value: plan.id,
    }));

    const classTypeOptions: DropdownOption<string>[] = [
        { key: "membership", label: "Membership Only", value: "Membership Only" },
        { key: "public", label: "Public", value: "Public" },
        { key: "private", label: "Private", value: "Private" },
    ];

    const accessOptions: DropdownOption<string>[] = [
        { key: "public", label: "PUBLIC | Visible on mobile app", value: "PUBLIC" },
        { key: "member", label: "MEMBER ONLY | Member only", value: "MEMBER_ONLY" },
        { key: "private", label: "PRIVATE | Hidden", value: "PRIVATE" },
    ];

    const onSubmit = (data: ClassScheduleData) => {
        console.log("Class Schedule Data:", data);
        router.push("/class-schedule?success=true");
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Class</li>
                            <li>
                                <Link href="/class-schedule">Schedule</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/class-schedule")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Class</h1>
                        </div>

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* Plan & Instructor */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <SearchableDropdown name="planId" label="Plan" options={planOptions} />
                            </div>

                            {/* <div className="col-span-6">
                                <SearchableDropdown name="instructorId" label="Instructor" options={instructorOptions} />
                            </div> */}
                        </div>

                        {/* Date & Start At */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <TextInput name="date" label="Date" type="date" />
                            </div>

                            <div className="col-span-4">
                                <TextInput name="startAt" label="Start At" type="time" />
                            </div>
                        </div>

                        {/* Class Type & Access */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <SearchableDropdown name="classType" label="Class Type" options={classTypeOptions} />
                            </div>

                            <div className="col-span-6">
                                <SearchableDropdown name="access" label="Access" options={accessOptions} />
                            </div>
                        </div>

                        {/* Manual Check-in */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="totalManualCheckin" label="Total Manual Checkin" />
                            </div>
                        </div>

                        {/* Note */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="note" label="Note" placeholder="Optional note" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
