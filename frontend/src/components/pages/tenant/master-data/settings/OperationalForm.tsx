"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TextInput } from "@/components/ui/input/Input";
import { FormActions } from "./FormActions";

const DAYS = [
  { key: "mon", label: "Monday"    },
  { key: "tue", label: "Tuesday"   },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday"  },
  { key: "fri", label: "Friday"    },
  { key: "sat", label: "Saturday"  },
  { key: "sun", label: "Sunday"    },
] as const;

interface Props {
  defaults: Record<string, any>;
  onSave: (data: any) => void;
  onReset: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function OperationalForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

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
            {DAYS.map(({ key, label }) => (
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