"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { NumberInput, TextInput } from "@/components/ui/input/Input";
import { MembershipData } from "@/types/membership";
// import { profileData } from "@/types/profile";
import { MembershipPlanData } from "@/types/membership-plan";
// import { ProfileData } from "@/lib/dummy/profileDummy";
import { DUMMY_MEMBERSHIP_PLANS } from "@/lib/dummy/membershipPlanDummy";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

export default function CreateMembership() {
    const router = useRouter();

    const form = useForm<MembershipData>({
        mode: "onChange",
        defaultValues: {
            id: "",

            membershipPlanId: "",
            memberProfileId: "",

            additionalFeeId: undefined,

            joinDate: "",

            referralSalesId: undefined,
            salesType: "Walk In",

            discountAmount: 0,
            discountPercent: 0,

            extraDurationDay: 0,
            extraMembershipSession: 0,

            simpleNote: "",

            membershipStatus: "Active",
        },
    });

    /** 🔽 Dropdown Options */
    // const memberOptions: DropdownOption<string>[] = ProfileData.map((profile: profileData) => ({
    //     key: profile.id,
    //     label: `${profile.name} (${profile.id})`,
    //     value: profile.id,
    // }));

    const membershipPlanOptions: DropdownOption<string>[] = DUMMY_MEMBERSHIP_PLANS.map((plan: MembershipPlanData) => ({
        key: plan.id,
        label: `${plan.name} - Rp ${plan.price.toLocaleString("id-ID")}`,
        value: plan.id,
    }));

    const salesTypeOptions: DropdownOption<string>[] = [
        { key: "walkin", label: "Walk In", value: "Walk In" },
        { key: "online", label: "Online", value: "Online" },
        { key: "referral", label: "Referral", value: "Referral" },
    ];

    const onSubmit = (data: MembershipData) => {
        console.log("Membership Data:", data);
        router.push("/membership?success=true");
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
                                <Link href="/membership">Membership</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/membership")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Membership</h1>
                        </div>

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create and save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* Member & Plan */}
                        <div className="grid grid-cols-12 gap-3">
                            {/* <div className="col-span-6">
                                <SearchableDropdown name="memberProfileId" label="Member Profile" options={memberOptions} />
                            </div> */}

                            <div className="col-span-6">
                                <SearchableDropdown name="membershipPlanId" label="Membership Plan" options={membershipPlanOptions} />
                            </div>
                        </div>

                        {/* Join Date & Sales */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <TextInput name="joinDate" label="Join Date" type="date" />
                            </div>

                            <div className="col-span-4">
                                <SearchableDropdown name="salesType" label="Sales Type" options={salesTypeOptions} />
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="discountAmount" label="Discount (Rp)" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="discountPercent" label="Discount (%)" />
                            </div>
                        </div>

                        {/* Extra Benefit */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                                <NumberInput name="extraDurationDay" label="Extra Duration (Day)" />
                            </div>
                            <div className="col-span-3">
                                <NumberInput name="extraMembershipSession" label="Extra Session" />
                            </div>
                        </div>

                        {/* Note */}
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <TextInput name="simpleNote" label="Simple Note" placeholder="Optional note" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
