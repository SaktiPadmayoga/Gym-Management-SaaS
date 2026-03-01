"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { SubscriptionsData } from "@/types/central/subscriptions";

const statusOptions: DropdownOption<string>[] = [
    { key: "trial", label: "Trial", value: "trial" },
    { key: "active", label: "Active", value: "active" },
    { key: "past_due", label: "Past Due", value: "past_due" },
    { key: "cancelled", label: "Cancelled", value: "cancelled" },
    { key: "expired", label: "Expired", value: "expired" },
];

const billingCycleOptions: DropdownOption<string>[] = [
    { key: "monthly", label: "Monthly", value: "monthly" },
    { key: "yearly", label: "Yearly", value: "yearly" },
];

export default function CreateSubscription() {
    const router = useRouter();

    const form = useForm<SubscriptionsData>({
        mode: "onChange",
        defaultValues: {
            id: "",
            tenantId: "",
            planId: "",
            status: "trial",

            startedAt: undefined,
            trialEndsAt: undefined,
            currentPeriodEndsAt: undefined,

            billingCycle: "monthly",
            amount: 0,
            autoRenew: false,

            lastInvoiceId: "",
            canceledAt: undefined,
        },
    });

    const onSubmit = (data: SubscriptionsData) => {
        console.log("CREATE SUBSCRIPTION:", data);
        router.push("/subscriptions?success=true");
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li>
                                <Link href="/subscriptions">Subscriptions</Link>
                            </li>
                            <li className="text-aksen-secondary">Create</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => router.push("/subscriptions")}>
                                <Icon name="back" className="h-7 w-7" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Subscription</h1>
                        </div>

                        <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2.5">
                            Create & Save
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* IDENTIFIER */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="tenantId" label="Tenant ID" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="planId" label="Plan ID" />
                            </div>
                        </div>

                        {/* STATUS */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="status" label="Status" options={statusOptions} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="billingCycle" label="Billing Cycle" options={billingCycleOptions} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="amount" label="Amount" />
                            </div>
                        </div>

                        {/* DATES */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="startedAt" label="Started At" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="trialEndsAt" label="Trial Ends At" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="currentPeriodEndsAt" label="Current Period Ends At" />
                            </div>
                        </div>

                        {/* FLAGS */}
                        <div className="flex items-center gap-3">
                            <input type="checkbox" {...form.register("autoRenew")} />
                            <span className="text-gray-800">Auto Renew</span>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
