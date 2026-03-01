"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { MembershipData } from "@/types/membership";
import { DUMMY_MEMBERSHIPS } from "@/lib/dummy/membershipDummy";
// import { ProfileData } from "@/lib/dummy/profileDummy";
import { DUMMY_MEMBERSHIP_PLANS } from "@/lib/dummy/membershipPlanDummy";
import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function MembershipDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const membershipDetail = useMemo(() => DUMMY_MEMBERSHIPS.find((item) => item.id === id), [id]);

    if (!membershipDetail) notFound();

    const form = useForm<MembershipData>({
        mode: "onChange",
        defaultValues: membershipDetail,
    });

    /** 🔽 Dropdown Options */
    // const memberOptions: DropdownOption<string>[] = ProfileData.map((profile) => ({
    //     key: profile.id,
    //     label: `${profile.name} (${profile.id})`,
    //     value: profile.id,
    // }));

    const membershipPlanOptions: DropdownOption<string>[] = DUMMY_MEMBERSHIP_PLANS.map((plan) => ({
        key: plan.id,
        label: `${plan.name} - Rp ${plan.price.toLocaleString("id-ID")}`,
        value: plan.id,
    }));

    const salesTypeOptions: DropdownOption<string>[] = [
        { key: "walkin", label: "Walk In", value: "Walk In" },
        { key: "online", label: "Online", value: "Online" },
        { key: "referral", label: "Referral", value: "Referral" },
    ];

    const statusOptions: DropdownOption<MembershipData["membershipStatus"]>[] = [
        { key: "active", label: "Active", value: "Active" },
        { key: "inactive", label: "Inactive", value: "Inactive" },
        { key: "expired", label: "Expired", value: "Expired" },
        { key: "suspended", label: "Suspended", value: "Suspended" },
    ];

    const handleSave = () => {
        console.log("UPDATED MEMBERSHIP:", form.getValues());
        toast.success("Membership updated");
        setIsEditMode(false);
        router.push("/membership?updated=true");
    };

    const handleCancel = () => {
        form.reset(membershipDetail);
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
                                <Link href="/membership">Membership</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/membership">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <h1 className="text-2xl font-semibold">Membership Detail</h1>
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
                        {/* Member & Plan */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                {/* <SearchableDropdown name="memberProfileId" label="Member Profile" options={memberOptions} disabled={!isEditMode} /> */}
                            </div>

                            <div className="col-span-6">
                                <SearchableDropdown name="membershipPlanId" label="Membership Plan" options={membershipPlanOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Join Date & Sales */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <TextInput name="joinDate" label="Join Date" type="date" disabled={!isEditMode} />
                            </div>

                            <div className="col-span-4">
                                <SearchableDropdown name="salesType" label="Sales Type" options={salesTypeOptions} disabled={!isEditMode} />
                            </div>

                            <div className="col-span-4">
                                <SearchableDropdown name="membershipStatus" label="Membership Status" options={statusOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="discountAmount" label="Discount (Rp)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="discountPercent" label="Discount (%)" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Extra Benefit */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="extraDurationDay" label="Extra Duration (Day)" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="extraMembershipSession" label="Extra Session" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* Note */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="simpleNote" label="Simple Note" disabled={!isEditMode} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
