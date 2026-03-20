"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useFacility, useUpdateFacility, useToggleFacility } from "@/hooks/tenant/useFacilities";
import { FacilityUpdateRequest, OperationalHours, DEFAULT_OPERATIONAL_HOURS } from "@/types/tenant/facilities";

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

interface FacilityFormData {
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

export default function FacilityDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const { data: facility, isLoading, isError } = useFacility(id);
    const updateMutation = useUpdateFacility();
    const toggleMutation = useToggleFacility();

    const form = useForm<FacilityFormData>({ mode: "onChange" });

    const alwaysAvailable = useWatch({ control: form.control, name: "always_available" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!facility) return;
        const hasSchedule = !!facility.operational_hours;
        setShowSchedule(hasSchedule);
        form.reset({
            name: facility.name,
            category: facility.category ?? "",
            description: facility.description ?? "",
            color: facility.color ?? "",
            price: Number(facility.price),
            minutes_per_session: facility.minutes_per_session,
            capacity: facility.capacity,
            access_type: facility.access_type,
            always_available: facility.always_available,
            available_from: facility.available_from ?? "",
            available_until: facility.available_until ?? "",
            is_active: facility.is_active,
            operational_hours: (facility.operational_hours as OperationalHours) ?? DEFAULT_OPERATIONAL_HOURS,
        });
    }, [facility]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError) return notFound();

    /* =========================
     * SAVE
     * ========================= */
    const handleSave = async () => {
        try {
            const formData = form.getValues();
            const payload: FacilityUpdateRequest = {
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
            };

            await updateMutation.mutateAsync({ id, payload });
            toast.success("Facility updated successfully");
            setIsEditMode(false);
            router.push("/facility?updated=true");
        } catch {
            toast.error("Failed to update facility");
        }
    };

    const handleCancel = () => {
        if (!facility) return;
        setShowSchedule(!!facility.operational_hours);
        form.reset({
            name: facility.name,
            category: facility.category ?? "",
            description: facility.description ?? "",
            color: facility.color ?? "",
            price: Number(facility.price),
            minutes_per_session: facility.minutes_per_session,
            capacity: facility.capacity,
            access_type: facility.access_type,
            always_available: facility.always_available,
            available_from: facility.available_from ?? "",
            available_until: facility.available_until ?? "",
            is_active: facility.is_active,
            operational_hours: (facility.operational_hours as OperationalHours) ?? DEFAULT_OPERATIONAL_HOURS,
        });
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <Toaster position="top-center" />
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/facility">Facility</Link>
                            </li>
                            <li className="text-aksen-secondary">{facility?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/facility">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <div className="flex items-center gap-2">
                                {facility?.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: facility.color }} />}
                                <h1 className="text-2xl font-semibold">Facility Detail</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <CustomButton
                                type="button"
                                className={`border px-3 py-2 text-sm ${facility?.is_active ? "text-orange-600 border-orange-200" : "text-green-600 border-green-200"}`}
                                onClick={() =>
                                    toggleMutation.mutate(id, {
                                        onSuccess: () => toast.success(`Facility ${facility?.is_active ? "deactivated" : "activated"}`),
                                        onError: () => toast.error("Failed to update status"),
                                    })
                                }
                                disabled={toggleMutation.isPending}
                            >
                                {facility?.is_active ? "Deactivate" : "Activate"}
                            </CustomButton>

                            {!isEditMode ? (
                                <CustomButton iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" type="button" onClick={() => setIsEditMode(true)}>
                                    Edit
                                </CustomButton>
                            ) : (
                                <div className="flex gap-3">
                                    <CustomButton type="button" className="border py-2.5 px-4" onClick={handleCancel}>
                                        Cancel
                                    </CustomButton>
                                    <CustomButton type="button" className="bg-aksen-secondary text-white py-2.5 px-4" onClick={handleSave} disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </CustomButton>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6 text-zinc-800">
                        {/* NAME & CATEGORY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="name" label="Facility Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="category" label="Category" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* DESCRIPTION & ACCESS TYPE */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <TextInput name="description" label="Description" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="access_type" label="Access Type" options={accessTypeOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* PRICE, SESSION, CAPACITY */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <NumberInput name="price" label="Price per Session (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="minutes_per_session" label="Minutes per Session" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="capacity" label="Max Capacity (pax)" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* COLOR */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" {...form.register("color")} disabled={!isEditMode} className="w-10 h-10 rounded cursor-pointer border border-zinc-200 disabled:opacity-50" />
                                    <TextInput name="color" disabled={!isEditMode} />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* AVAILABILITY */}
                        <h2 className="text-xl font-semibold text-gray-800">Availability</h2>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("always_available")} />
                                    <span className="text-sm font-medium">Always Available</span>
                                </div>
                                {!alwaysAvailable && (
                                    <>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="available_from" label="Available From" disabled={!isEditMode} />
                                        </div>
                                        <div className="col-span-4">
                                            <TextInput type="date" name="available_until" label="Available Until" disabled={!isEditMode} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="checkbox checkbox-sm" disabled={!isEditMode} {...form.register("is_active")} />
                                <span className="text-sm font-medium">Active</span>
                            </div>
                        </div>

                        <hr />

                        {/* OPERATIONAL HOURS */}
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={showSchedule} onChange={() => setShowSchedule(!showSchedule)} disabled={!isEditMode} className="checkbox checkbox-sm" />
                            <span className="text-sm font-medium">Set Operational Hours</span>
                        </div>

                        {showSchedule && (
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <p className="text-sm font-medium mb-4 text-zinc-700">Operational Hours</p>
                                <div className="flex flex-col gap-3">
                                    {DAYS.map((day) => {
                                        const isOpen = form.watch(`operational_hours.${day.key}.is_open`);
                                        return (
                                            <div key={day.key} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-md border border-zinc-300">
                                                <div className="col-span-3 flex gap-2 items-center">
                                                    <input type="checkbox" disabled={!isEditMode} {...form.register(`operational_hours.${day.key}.is_open`)} />
                                                    <span>{day.label}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`operational_hours.${day.key}.open`} disabled={!isOpen || !isEditMode} />
                                                </div>
                                                <div className="col-span-4">
                                                    <TextInput type="time" name={`operational_hours.${day.key}.close`} disabled={!isOpen || !isEditMode} />
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
