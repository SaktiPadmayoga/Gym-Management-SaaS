"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { FacilityData } from "@/types/facility";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

export default function CreateFacility() {
    const router = useRouter();

    const form = useForm<FacilityData>({
        mode: "onChange",
        defaultValues: {
            id: "",
            name: "",
            description: "",
            classType: "public",
            price: 0,
            minutesPerSession: 60,
            operationalHourFrom: "",
            operationalHourUntil: "",
        },
    });

    const onSubmit = (data: FacilityData) => {
        console.log("Facility Data:", data);
        router.push("/facility?success=true");
    };

    const classTypeOptions: DropdownOption<string>[] = [
        { key: "public", label: "Publicly Available", value: "public" },
        { key: "private", label: "Private", value: "private" },
        { key: "member-only", label: "Member Only", value: "member_only" },
    ];

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/facility">Facility</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/facility")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Facility</h1>
                        </div>

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6 text-zinc-800">
                        {/* Name */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12">
                                <TextInput name="name" label="Name" placeholder="Enter facility name" />
                            </div>
                        </div>

                        {/* Description & Class Type */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="classType" label="Class Type" options={classTypeOptions} />
                            </div>
                        </div>

                        {/* Price & Minutes */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <NumberInput name="price" label="Price (Rp)" />
                            </div>
                            <div className="col-span-6">
                                <NumberInput name="minutesPerSession" label="Minutes per session" />
                            </div>
                        </div>

                        {/* Operational Hours */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput type="time" name="operationalHourFrom" label="Operational Hours From" />
                            </div>
                            <div className="col-span-6">
                                <TextInput type="time" name="operationalHourUntil" label="Operational Hours Until" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
