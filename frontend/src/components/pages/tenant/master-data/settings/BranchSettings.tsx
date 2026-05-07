"use client";

import { useState } from "react";
import { Toaster } from "sonner";

import { useBranch } from "@/providers/BranchProvider";
import { useBranchSettings, useUpdateSettingGroup, useResetSettingGroup } from "@/hooks/tenant/useBranchSettings";

// ── Split form components ──────────────────────────────────────────────────────
import { AppearanceForm }   from "./AppearanceForm";
import { BusinessForm }     from "./BussinesForm";
import { OperationalForm }  from "./OperationalForm";
import { MembershipForm }   from "./MembershipForm";
import { NotificationForm } from "./NotificationForm";
import { SecurityForm }     from "./SecurityForm";
import { RolesTab }         from "./RolesTab";

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const TABS = [
  { key: "appearance",   label: "Appearance"   },
  { key: "business",     label: "Business"     },
  { key: "operational",  label: "Operational"  },
  { key: "membership",   label: "Membership"   },
  { key: "notification", label: "Notification" },
  { key: "security",     label: "Security"     },
  { key: "roles",        label: "Roles & Permissions" }, // ← Tab baru, tanpa route baru
] as const;

type TabKey = typeof TABS[number]["key"];

/* ─── Helper ─────────────────────────────────────────────────────────────────── */

function flattenGroup(group: Record<string, { value: any }> | undefined): Record<string, any> {
  if (!group) return {};
  return Object.fromEntries(Object.entries(group).map(([k, v]) => [k, v.value]));
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */

export default function BranchSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("appearance");
  const { currentBranch } = useBranch();

  const { data: settingsData, isLoading } = useBranchSettings();

  // Hooks update & reset hanya aktif untuk tab settings (bukan "roles")
  const isSettingsTab = activeTab !== "roles";
  const updateMutation = useUpdateSettingGroup(isSettingsTab ? activeTab : "appearance");
  const resetMutation  = useResetSettingGroup(isSettingsTab ? activeTab : "appearance");

  const groupSettings = isSettingsTab 
    ? settingsData?.settings?.[activeTab as Exclude<TabKey, "roles">] ?? {} 
    : {};
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
            <p className="text-zinc-500">Configure {currentBranch?.name ?? "this branch"}</p>
          </div>
        </div>

        <hr />

        {/* Tabs */}
        <div className="flex gap-1 mt-4 mb-6 border-b border-zinc-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-aksen-secondary text-aksen-secondary"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Roles tab: tidak perlu loading state dari settings API */}
          {activeTab === "roles" ? (
            <RolesTab />
          ) : isLoading ? (
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
    </div>
  );
}