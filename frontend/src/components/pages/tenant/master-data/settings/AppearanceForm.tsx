"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { FormActions } from "./FormActions";

interface Props {
  defaults: Record<string, any>;
  onSave: (data: any) => void;
  onReset: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function AppearanceForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

  const primaryColor = form.watch("primary_color");
  const accentColor = form.watch("accent_color");

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