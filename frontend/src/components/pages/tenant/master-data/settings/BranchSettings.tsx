"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Toaster } from "sonner";
import Link from "next/link";

import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import {
    useBranchSettings,
    useUpdateSettingGroup,
    useResetSettingGroup,
} from "@/hooks/tenant/useBranchSettings";

/* =========================
 * CONSTANTS
 * ========================= */

const TABS = [
    { key: "appearance",   label: "Appearance"   },
    { key: "business",     label: "Business"     },
    { key: "operational",  label: "Operational"  },
    { key: "membership",   label: "Membership"   },
    { key: "notification", label: "Notification" },
    { key: "security",     label: "Security"     },
] as const;

type TabKey = typeof TABS[number]["key"];

const timezoneOptions: DropdownOption<string>[] = [
    { key: "Asia/Jakarta",    label: "WIB — Asia/Jakarta",    value: "Asia/Jakarta"    },
    { key: "Asia/Makassar",   label: "WITA — Asia/Makassar",  value: "Asia/Makassar"  },
    { key: "Asia/Jayapura",   label: "WIT — Asia/Jayapura",   value: "Asia/Jayapura"  },
];

const currencyOptions: DropdownOption<string>[] = [
    { key: "IDR", label: "IDR — Indonesian Rupiah", value: "IDR" },
    { key: "USD", label: "USD — US Dollar",         value: "USD" },
];

const languageOptions: DropdownOption<string>[] = [
    { key: "id", label: "Bahasa Indonesia", value: "id" },
    { key: "en", label: "English",          value: "en" },
];

/* =========================
 * HELPER — flatten grouped settings to flat key-value
 * ========================= */

function flattenGroup(group: Record<string, { value: any }> | undefined): Record<string, any> {
    if (!group) return {};
    return Object.fromEntries(Object.entries(group).map(([k, v]) => [k, v.value]));
}

/* =========================
 * SECTION COMPONENTS
 * ========================= */

function AppearanceForm({
    defaults,
    onSave,
    onReset,
    isSaving,
    isResetting,
}: {
    defaults: Record<string, any>;
    onSave: (data: any) => void;
    onReset: () => void;
    isSaving: boolean;
    isResetting: boolean;
}) {
    const form = useForm({ defaultValues: defaults });

    useEffect(() => { form.reset(defaults); }, [defaults]);

    const primaryColor = form.watch("primary_color");
    const accentColor  = form.watch("accent_color");

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Appearance</h2>
                    <p className="text-sm text-zinc-500">Customize the look of your branch dashboard.</p>
                </div>

                <hr />

                {/* Color preview */}
                <div className="flex gap-4 items-center">
                    <div
                        className="w-12 h-12 rounded-xl border border-zinc-200 shadow-sm"
                        style={{ backgroundColor: primaryColor ?? "#4F46E5" }}
                        title="Primary color preview"
                    />
                    <div
                        className="w-12 h-12 rounded-xl border border-zinc-200 shadow-sm"
                        style={{ backgroundColor: accentColor ?? "#7C3AED" }}
                        title="Accent color preview"
                    />
                    <p className="text-xs text-zinc-400">Live color preview</p>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                {...form.register("primary_color")}
                                className="w-10 h-10 rounded cursor-pointer border border-zinc-200"
                            />
                            <TextInput name="primary_color" placeholder="#4F46E5" />
                        </div>
                    </div>
                    <div className="col-span-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Accent Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                {...form.register("accent_color")}
                                className="w-10 h-10 rounded cursor-pointer border border-zinc-200"
                            />
                            <TextInput name="accent_color" placeholder="#7C3AED" />
                        </div>
                    </div>
                    <div className="col-span-4">
                        <TextInput name="logo_url" label="Logo URL (optional)" placeholder="https://..." />
                    </div>
                </div>

                <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
            </form>
        </FormProvider>
    );
}

function BusinessForm({ defaults, onSave, onReset, isSaving, isResetting }: any) {
    const form = useForm({ defaultValues: defaults });
    useEffect(() => { form.reset(defaults); }, [defaults]);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Business</h2>
                    <p className="text-sm text-zinc-500">Regional and localization settings for your branch.</p>
                </div>
                <hr />
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <SearchableDropdown name="timezone" label="Timezone" options={timezoneOptions} />
                    </div>
                    <div className="col-span-6">
                        <SearchableDropdown name="language" label="Language" options={languageOptions} />
                    </div>
                    <div className="col-span-4">
                        <SearchableDropdown name="currency" label="Currency" options={currencyOptions} />
                    </div>
                    <div className="col-span-4">
                        <TextInput name="currency_symbol" label="Currency Symbol" placeholder="Rp" />
                    </div>
                    <div className="col-span-4">
                        <TextInput name="date_format" label="Date Format" placeholder="DD/MM/YYYY" />
                    </div>
                </div>
                <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
            </form>
        </FormProvider>
    );
}

function OperationalForm({ defaults, onSave, onReset, isSaving, isResetting }: any) {
    const form = useForm({ defaultValues: defaults });
    useEffect(() => { form.reset(defaults); }, [defaults]);

    const days = [
        { key: "mon", label: "Monday"    },
        { key: "tue", label: "Tuesday"   },
        { key: "wed", label: "Wednesday" },
        { key: "thu", label: "Thursday"  },
        { key: "fri", label: "Friday"    },
        { key: "sat", label: "Saturday"  },
        { key: "sun", label: "Sunday"    },
    ];

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Operational</h2>
                    <p className="text-sm text-zinc-500">Set operating hours and capacity for this branch.</p>
                </div>
                <hr />

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <TextInput name="max_capacity" label="Max Capacity (people)" placeholder="50" />
                    </div>
                    <div className="col-span-4">
                        <TextInput name="session_duration_min" label="Default Session Duration (min)" placeholder="60" />
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-zinc-700 mb-3">Operating Hours</p>
                    <div className="space-y-2">
                        {days.map(({ key, label }) => (
                            <div key={key} className="grid grid-cols-12 items-center gap-3">
                                <div className="col-span-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...form.register(`operating_hours.${key}.is_open`)}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-zinc-700 w-20">{label}</span>
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="time"
                                        {...form.register(`operating_hours.${key}.open`)}
                                        className="w-full border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-700"
                                    />
                                </div>
                                <span className="text-zinc-400 text-sm">to</span>
                                <div className="col-span-2">
                                    <input
                                        type="time"
                                        {...form.register(`operating_hours.${key}.close`)}
                                        className="w-full border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-700"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
            </form>
        </FormProvider>
    );
}

function MembershipForm({ defaults, onSave, onReset, isSaving, isResetting }: any) {
    const form = useForm({ defaultValues: defaults });
    useEffect(() => { form.reset(defaults); }, [defaults]);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Membership</h2>
                    <p className="text-sm text-zinc-500">Configure membership rules and policies.</p>
                </div>
                <hr />
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <TextInput name="grace_period_days" label="Grace Period (days)" placeholder="7" />
                    </div>
                    <div className="col-span-4">
                        <TextInput name="late_penalty_amount" label="Late Penalty Amount (Rp)" placeholder="0" />
                    </div>
                    <div className="col-span-4">
                        <TextInput name="max_freeze_days" label="Max Freeze Days" placeholder="30" />
                    </div>
                </div>

                <div className="flex flex-col gap-3 text-zinc-700">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...form.register("auto_renewal")} className="rounded" />
                        Enable Auto Renewal
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...form.register("freeze_allowed")} className="rounded" />
                        Allow Membership Freeze
                    </label>
                </div>

                <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
            </form>
        </FormProvider>
    );
}

function NotificationForm({ defaults, onSave, onReset, isSaving, isResetting }: any) {
    const form = useForm({ defaultValues: defaults });
    useEffect(() => { form.reset(defaults); }, [defaults]);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Notification</h2>
                    <p className="text-sm text-zinc-500">Manage how and when members are notified.</p>
                </div>
                <hr />

                <div className="flex flex-col gap-3 text-zinc-700">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...form.register("email_enabled")} className="rounded" />
                        Enable Email Notifications
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...form.register("whatsapp_enabled")} className="rounded" />
                        Enable WhatsApp Notifications
                    </label>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Expiry Reminder Days
                            <span className="text-zinc-400 font-normal ml-1">(comma separated, e.g. 3,7,14)</span>
                        </label>
                        <input
                            type="text"
                            {...form.register("expiry_reminder_days")}
                            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700"
                            placeholder="3,7,14"
                        />
                    </div>
                    <div className="col-span-12">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Expiry Message Template
                            <span className="text-zinc-400 font-normal ml-1">
                                — variables: {"{member_name}"}, {"{branch_name}"}, {"{expiry_date}"}
                            </span>
                        </label>
                        <textarea
                            {...form.register("expiry_message_template")}
                            rows={3}
                            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 resize-none"
                        />
                    </div>
                </div>

                <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
            </form>
        </FormProvider>
    );
}

function SecurityForm({ defaults, onSave, onReset, isSaving, isResetting }: any) {
    const form = useForm({ defaultValues: defaults });
    useEffect(() => { form.reset(defaults); }, [defaults]);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Security</h2>
                    <p className="text-sm text-zinc-500">Access and session security configuration.</p>
                </div>
                <hr />
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <TextInput name="max_login_attempt" label="Max Login Attempts" placeholder="5" />
                    </div>
                    <div className="col-span-4">
                        <TextInput name="session_timeout_min" label="Session Timeout (minutes)" placeholder="120" />
                    </div>
                </div>
                <div className="flex flex-col gap-3 text-zinc-700">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...form.register("require_checkin_pin")} className="rounded" />
                        Require PIN for Check-in
                    </label>
                </div>
                <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
            </form>
        </FormProvider>
    );
}

/* =========================
 * SHARED FORM ACTIONS
 * ========================= */

function FormActions({ isSaving, isResetting, onReset }: {
    isSaving: boolean;
    isResetting: boolean;
    onReset: () => void;
}) {
    return (
        <div className="flex items-center justify-between pt-2">
            <button
                type="button"
                onClick={onReset}
                disabled={isResetting}
                className="text-sm text-zinc-400 hover:text-red-500 transition disabled:opacity-50"
            >
                {isResetting ? "Resetting..." : "Reset to default"}
            </button>
            <CustomButton
                type="submit"
                disabled={isSaving}
                className="bg-aksen-secondary text-white px-4 py-2 disabled:opacity-50"
            >
                {isSaving ? "Saving..." : "Save changes"}
            </CustomButton>
        </div>
    );
}

/* =========================
 * MAIN PAGE
 * ========================= */

export default function BranchSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("appearance");
    const { currentBranch } = useBranch();

    const { data: settingsData, isLoading } = useBranchSettings();

    const updateMutation  = useUpdateSettingGroup(activeTab);
    const resetMutation   = useResetSettingGroup(activeTab);

    const groupSettings = settingsData?.settings?.[activeTab] ?? {};
    const defaults      = flattenGroup(groupSettings as Record<string, { value: any }>);

    const handleSave  = (data: any) => updateMutation.mutate(data);
    const handleReset = () => {
        if (confirm(`Reset all ${activeTab} settings to default?`)) {
            resetMutation.mutate();
        }
    };

    const formProps = {
        defaults,
        onSave:      handleSave,
        onReset:     handleReset,
        isSaving:    updateMutation.isPending,
        isResetting: resetMutation.isPending,
    };

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />

            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">

                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Settings</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Branch Settings</h1>
                        <p className="text-zinc-500">
                            Configure {currentBranch?.name ?? "this branch"}
                        </p>
                    </div>
                </div>

                <hr />

                {/* Tabs */}
                <div className="flex gap-1 mt-4 mb-6 border-b border-zinc-100">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px ${
                                activeTab === tab.key
                                    ? "border-aksen-secondary text-aksen-secondary"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {activeTab === "appearance"   && <AppearanceForm   {...formProps} />}
                        {activeTab === "business"     && <BusinessForm     {...formProps} />}
                        {activeTab === "operational"  && <OperationalForm  {...formProps} />}
                        {activeTab === "membership"   && <MembershipForm   {...formProps} />}
                        {activeTab === "notification" && <NotificationForm {...formProps} />}
                        {activeTab === "security"     && <SecurityForm     {...formProps} />}
                    </>
                )}
            </div>
        </div>
    );
}