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
import { useCreateFacility } from "@/hooks/tenant/useFacilities";
import { FacilityCreateRequest, OperationalHours, DEFAULT_OPERATIONAL_HOURS } from "@/types/tenant/facilities";

/* =========================
 * OPTIONS
 * ========================= */

const accessTypeOptions: DropdownOption<string>[] = [
    { key: "public", label: "Public — Anyone can book", value: "public" },
    { key: "private", label: "Private — Members only", value: "private" },
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

interface CreateFacilityFormData {
    name: string;
    category: string;
    description: string;
    color: string;
    price: number;
    minutes_per_session: number;
    capacity: number;
    access_type: "public" | "private";
    always_available: boolean;
    available_from: string;
    available_until: string;
    is_active: boolean;
    operational_hours: OperationalHours;
}

export default function CreateFacility() {
    const router = useRouter();
    const createMutation = useCreateFacility();
    const { branchId } = useBranch();

    const [showSchedule, setShowSchedule] = useState(false);

    const form = useForm<CreateFacilityFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            category: "",
            description: "",
            color: "",
            price: 0,
            minutes_per_session: 60,
            capacity: 1,
            access_type: "public",
            always_available: true,
            available_from: "",
            available_until: "",
            is_active: true,
            operational_hours: DEFAULT_OPERATIONAL_HOURS,
        },
    });

    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    const onSubmit = async (formData: CreateFacilityFormData) => {
        try {
            const payload: FacilityCreateRequest = {
                name: formData.name,
                category: formData.category || undefined,
                description: formData.description || undefined,
                color: formData.color || undefined,
                price: formData.price,
                minutes_per_session: formData.minutes_per_session,
                capacity: formData.capacity,
                access_type: formData.access_type,
                always_available: formData.always_available,
                available_from: formData.always_available ? undefined : formData.available_from || undefined,
                available_until: formData.always_available ? undefined : formData.available_until || undefined,
                is_active: formData.is_active,
                operational_hours: showSchedule ? formData.operational_hours : undefined,
                branch_id: branchId ?? undefined,
            };

            await createMutation.mutateAsync(payload);
            toast.success("Facility created successfully");
            router.push("/facility?success=true");
        } catch (err) {
            toast.error("Failed to create facility");
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
                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6 text-zinc-800">
                        {/* NAME */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="name" label="Facility Name" placeholder="e.g Swimming Pool, Sauna" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="category" label="Category (optional)" placeholder="e.g Aquatic, Wellness" />
                            </div>
                        </div>

                        {/* DESCRIPTION & ACCESS TYPE */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Description" placeholder="Enter description" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="access_type" label="Access Type" options={accessTypeOptions} />
                            </div>
                        </div>

                        {/* PRICE, SESSION, CAPACITY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price per Session (Rp)" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="minutes_per_session" label="Minutes per Session" />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="capacity" label="Max Capacity (pax)" />
                            </div>
                        </div>

                        {/* COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Color (optional)</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" {...form.register("color")} className="w-10 h-10 rounded cursor-pointer border border-zinc-200" />
                                    <TextInput name="color" placeholder="#4F46E5" />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability</h2>

                        <div className="flex flex-col gap-4 text-gray-800">
                            <div className="grid grid-cols-12 gap-3 items-center">
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

                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" {...form.register("is_active")} />
                                <span className="text-sm font-medium">Active</span>
                            </div>
                        </div>

                        {/* OPERATIONAL HOURS */}
                        <div className="flex items-center gap-3 text-zinc-800">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} className="checkbox checkbox-sm" />
                            <span className="text-sm font-medium">Set Operational Hours</span>
                        </div>

                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg text-zinc-800">
                                <p className="text-sm font-medium mb-4">Operational Hours</p>
                                <div className="flex flex-col gap-3">
                                    {DAYS.map((day) => {
                                        const isOpen = form.watch(`operational_hours.${day.key}.is_open`);
                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border border-zinc-300">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" {...form.register(`operational_hours.${day.key}.is_open`)} />
                                                    <span>{day.label}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`operational_hours.${day.key}.open`} disabled={!isOpen} />
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`operational_hours.${day.key}.close`} disabled={!isOpen} />
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
