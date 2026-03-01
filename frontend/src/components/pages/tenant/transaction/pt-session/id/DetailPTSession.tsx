"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { PtSessionData } from "@/types/pt-session";
import { FormProvider, useForm } from "react-hook-form";
import { useParams, useRouter, notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

/* ===== DUMMY ===== */
import { DUMMY_PT_SESSIONS } from "@/lib/dummy/ptSessionDummy";

/* =======================
   OPTIONS
======================= */
const salesTypeOptions: DropdownOption<string>[] = [
    { key: "walk-in", label: "Walk In", value: "Walk In" },
    { key: "online", label: "Online", value: "Online" },
    { key: "referral", label: "Referral", value: "Referral" },
];

const statusOptions: DropdownOption<string>[] = [
    { key: "active", label: "Active", value: "Active" },
    { key: "expired", label: "Expired", value: "Expired" },
    { key: "suspended", label: "Suspended", value: "Suspended" },
];

const planOptions: DropdownOption<string>[] = [
    { key: "PTP-001", label: "10 Sessions PT Package", value: "PTP-001" },
    { key: "PTP-002", label: "20 Sessions PT Package", value: "PTP-002" },
];

const memberOptions: DropdownOption<string>[] = [
    { key: "PROFILE-001", label: "Aditya Putra", value: "PROFILE-001" },
    { key: "PROFILE-002", label: "Yanto Kacul", value: "PROFILE-002" },
];

const ptOptions: DropdownOption<string>[] = [
    { key: "PT-001", label: "Coach Andi", value: "PT-001" },
    { key: "PT-002", label: "Coach Budi", value: "PT-002" },
];

const additionalFeeOptions: DropdownOption<string>[] = [
    { key: "AF-001", label: "Locker Fee", value: "AF-001" },
    { key: "AF-002", label: "Nutrition Plan", value: "AF-002" },
];

export default function PtSessionDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const ptSessionDetail = useMemo(() => {
        return DUMMY_PT_SESSIONS.find((item) => item.id === id);
    }, [id]);

    if (!ptSessionDetail) notFound();

    const form = useForm<PtSessionData>({
        mode: "onChange",
        defaultValues: ptSessionDetail,
    });

    /* =======================
       ACTION
    ======================= */
    const handleSave = () => {
        console.log("UPDATED:", form.getValues());
        toast.success("PT Session updated");
        setIsEditMode(false);
        router.push("/pt-sessions?updated=true");
    };

    const handleCancel = () => {
        form.reset(ptSessionDetail);
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Transaction</li>
                            <li>
                                <Link href="/pt-sessions">PT Session</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/pt-sessions")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">PT Session Detail</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton type="button" iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={() => setIsEditMode(true)}>
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-3">
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
                        {/* ================= BASIC ================= */}
                        <SearchableDropdown name="ptSessionPlanId" label="PT Session Plan" options={planOptions} disabled={!isEditMode} />

                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <SearchableDropdown name="memberProfileId" label="Member" options={memberOptions} disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="ptId" label="Personal Trainer" options={ptOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* ================= DATE & FEE ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput type="date" name="joinDate" label="Join Date" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="additionalFeeId" label="Additional Fee" options={additionalFeeOptions} disabled={!isEditMode} isClearable />
                            </div>
                        </div>

                        {/* ================= SALES ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="referralSalesId" label="Referral Sales ID" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="salesType" label="Sales Type" options={salesTypeOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* ================= DISCOUNT ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <NumberInput name="discountAmount" label="Discount Amount (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <NumberInput name="discountPercent" label="Discount Percent (%)" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* ================= EXTRA ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <NumberInput name="extraDurationDay" label="Extra Duration (Day)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <NumberInput name="extraSession" label="Extra Session" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* ================= NOTE & STATUS ================= */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="simpleNote" label="Simple Note" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="ptSessionStatus" label="PT Session Status" options={statusOptions} disabled={!isEditMode} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
