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

export function SecurityForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

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