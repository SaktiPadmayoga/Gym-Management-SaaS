"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormActions } from "./FormActions";

interface Props {
  defaults: Record<string, any>;
  onSave: (data: any) => void;
  onReset: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function NotificationForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

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