"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { FormProvider, useForm } from "react-hook-form";
import { useParams, useRouter, notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/** ===== DUMMY DETAIL (GANTI API) ===== */
import { DUMMY_FACILITIES } from "@/lib/dummy/facilityDummy";
import Link from "next/link";
import { FacilityData } from "@/types/facility";

export default function DetailFacility() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const facilityDetail = useMemo(() => {
        return DUMMY_FACILITIES.find((item) => item.id === id);
    }, [id]);

    if (!facilityDetail) notFound();

    const form = useForm<FacilityData>({
        mode: "onChange",
        defaultValues: facilityDetail,
    });

    /** ================= OPTIONS ================= */
    const classTypeOptions: DropdownOption<string>[] = [
        { key: "public", label: "Publicly Available", value: "public" },
        { key: "private", label: "Private", value: "private" },
        { key: "member-only", label: "Member Only", value: "member_only" },
    ];

    /** ================= ACTION ================= */
    const handleSave = () => {
        console.log("UPDATED:", form.getValues());
        router.push("/facility?updated=true");
        toast.success("Facility updated");
        setIsEditMode(false);
    };

    const handleCancel = () => {
        form.reset(facilityDetail);
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
                                <Link href="/facility">Facility</Link>
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
                            <h1 className="text-2xl font-semibold">Facility Detail</h1>
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

                    <div className="flex flex-col gap-6 mt-6 text-zinc-800">
                        {/* Name */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12">
                                <TextInput name="name" label="Name" placeholder="Enter facility name" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Description & Class Type */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Description" placeholder="Enter description" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="classType" label="Class Type" options={classTypeOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Price & Minutes */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <NumberInput name="price" label="Price (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <NumberInput name="minutesPerSession" label="Minutes per session" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Operational Hours */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput type="time" name="operationalHourFrom" label="Operational Hours From" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput type="time" name="operationalHourUntil" label="Operational Hours Until" disabled={!isEditMode} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
