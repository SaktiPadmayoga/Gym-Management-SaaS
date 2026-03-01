"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { PtSessionData } from "@/types/pt-session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

/* =======================
   DUMMY OPTIONS
======================= */
const ptSessionPlanOptions: DropdownOption<string>[] = [
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

export default function CreatePtSession() {
    const router = useRouter();

    const form = useForm<PtSessionData>({
        mode: "onChange",
        defaultValues: {
            id: "",

            ptSessionPlanId: "",
            memberProfileId: "",
            ptId: "",
            additionalFeeId: undefined,

            joinDate: "",
            referralSalesId: undefined,
            salesType: "Walk In",

            discountAmount: 0,
            discountPercent: 0,

            extraDurationDay: 0,
            extraSession: 0,

            simpleNote: "",
            ptSessionStatus: "Active",
        },
    });

    const onSubmit = (data: PtSessionData) => {
        console.log("PT SESSION DATA:", data);
        router.push("/pt-sessios?success=true");
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Transaction</li>
                            <li>
                                <Link href="/pt-sessions">PT Session</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/pt-sessions")}>
                                <Icon name="back" className="h-7 w-7" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create PT Session</h1>
                        </div>

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* PLAN */}
                        <SearchableDropdown name="ptSessionPlanId" label="PT Session Plan *" options={ptSessionPlanOptions} />

                        {/* MEMBER & PT */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <SearchableDropdown name="memberProfileId" label="Member Profile *" options={memberOptions} />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="ptId" label="PT *" options={ptOptions} />
                            </div>
                        </div>

                        {/* ADDITIONAL FEE & DATE */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <SearchableDropdown name="additionalFeeId" label="Additional Fee" options={additionalFeeOptions} isClearable />
                            </div>
                            <div className="col-span-6">
                                <TextInput type="date" name="joinDate" label="Join Date / Start Date *" />
                            </div>
                        </div>

                        {/* SALES */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <SearchableDropdown
                                    name="referralSalesId"
                                    label="Referral by Sales"
                                    options={[
                                        { key: "SL-001", label: "Sales Andi", value: "SL-001" },
                                        { key: "SL-002", label: "Sales Budi", value: "SL-002" },
                                    ]}
                                    isClearable
                                />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="salesType" label="Sales Type" options={salesTypeOptions} />
                            </div>
                        </div>

                        {/* DISCOUNT */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <NumberInput name="discountAmount" label="Discount (Rp)" />
                            </div>
                            <div className="col-span-6">
                                <NumberInput name="discountPercent" label="Discount (%)" />
                            </div>
                        </div>

                        {/* EXTRA */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <NumberInput name="extraDurationDay" label="Extra Duration Day" />
                            </div>
                            <div className="col-span-6">
                                <NumberInput name="extraSession" label="Extra Session" />
                            </div>
                        </div>

                        {/* NOTE & STATUS */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="simpleNote" label="Simple Note" placeholder="This note is visible to the member" />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown name="ptSessionStatus" label="PT Session Status" options={statusOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
