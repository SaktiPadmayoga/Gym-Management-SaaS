"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { FormActions } from "./FormActions";

const timezoneOptions: DropdownOption<string>[] = [
  { key: "Asia/Jakarta",  label: "WIB — Asia/Jakarta",  value: "Asia/Jakarta"  },
  { key: "Asia/Makassar", label: "WITA — Asia/Makassar", value: "Asia/Makassar" },
  { key: "Asia/Jayapura", label: "WIT — Asia/Jayapura",  value: "Asia/Jayapura" },
];

const currencyOptions: DropdownOption<string>[] = [
  { key: "IDR", label: "IDR — Indonesian Rupiah", value: "IDR" },
  { key: "USD", label: "USD — US Dollar",         value: "USD" },
];

const languageOptions: DropdownOption<string>[] = [
  { key: "id", label: "Bahasa Indonesia", value: "id" },
  { key: "en", label: "English",          value: "en" },
];

interface Props {
  defaults: Record<string, any>;
  onSave: (data: any) => void;
  onReset: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function BusinessForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

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