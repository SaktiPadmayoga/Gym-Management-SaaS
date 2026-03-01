"use client";

import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput, NumberInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { SubscriptionsData } from "@/types/central/subscriptions";
import { DUMMY_SUBSCRIPTIONS } from "@/lib/dummy/central/subscriptionsDummy";

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

export default function SubscriptionDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const subscription = useMemo(() => DUMMY_SUBSCRIPTIONS.find((s) => s.id === id), [id]);

    if (!subscription) notFound();

    const form = useForm<SubscriptionsData>({
        mode: "onChange",
        defaultValues: subscription,
    });

    const handleSave = () => {
        console.log("UPDATED SUBSCRIPTION:", form.getValues());
        toast.success("Subscription updated");
        setIsEditMode(false);
        router.push("/subscriptions?updated=true");
    };

    const handleCancel = () => {
        form.reset(subscription);
        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li>
                                <Link href="/subscriptions">Subscriptions</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href="/subscriptions">
                                <Icon name="back" className="h-7 w-7" />
                            </Link>
                            <h1 className="text-2xl font-semibold">Subscription Detail</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton iconName="edit" className="bg-aksen-secondary text-white px-4 py-2.5" onClick={() => setIsEditMode(true)}>
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton className="border px-4 py-2.5" onClick={handleCancel}>
                                    Cancel
                                </CustomButton>
                                <CustomButton className="bg-aksen-secondary text-white px-4 py-2.5" onClick={handleSave}>
                                    Save
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="tenantId" label="Tenant ID" disabled />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="planId" label="Plan ID" disabled />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <SearchableDropdown name="status" label="Status" options={statusOptions} disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="billingCycle" label="Billing Cycle" options={billingCycleOptions} disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <NumberInput name="amount" label="Amount" disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" {...form.register("autoRenew")} disabled={!isEditMode} />
                            <span>Auto Renew</span>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
