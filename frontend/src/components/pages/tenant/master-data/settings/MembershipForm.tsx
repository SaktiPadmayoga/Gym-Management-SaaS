"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TextInput } from "@/components/ui/input/Input";
import { FormActions } from "./FormActions";

interface Props {
  defaults: Record<string, any>;
  onSave: (data: any) => void;
  onReset: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function MembershipForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

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