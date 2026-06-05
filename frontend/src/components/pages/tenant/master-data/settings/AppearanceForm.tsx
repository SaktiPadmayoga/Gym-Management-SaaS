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

const PREVIEW_STYLE_ID = "branch-theme-preview";

function isValidHex(color: string | undefined | null): color is string {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
}

/** 0 = black, 255 = white. Warna terlalu terang (>210) tidak cocok untuk background button */
function getBrightness(hex: string): number {
  const full = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

const MIN_BRIGHTNESS = 30;   // jangan terlalu gelap
const MAX_BRIGHTNESS = 210;  // jangan terlalu terang (putih = 255)

export function AppearanceForm({ defaults, onSave, onReset, isSaving, isResetting }: Props) {
  const form = useForm({ defaultValues: defaults });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults]);

  const primaryColor   = form.watch("primary_color");
  const accentColor    = form.watch("accent_color");

  // ── Brightness warnings ─────────────────────────────────────────────────────
  const primaryBrightness   = isValidHex(primaryColor)  ? getBrightness(primaryColor)  : 100;
  const secondaryBrightness = isValidHex(accentColor)   ? getBrightness(accentColor)   : 100;

  const isPrimaryTooLight   = primaryBrightness   > MAX_BRIGHTNESS;
  const isPrimaryTooDark    = primaryBrightness   < MIN_BRIGHTNESS;
  const isSecondaryTooLight = secondaryBrightness > MAX_BRIGHTNESS;
  const isSecondaryTooDark  = secondaryBrightness < MIN_BRIGHTNESS;

  const hasWarning = isPrimaryTooLight || isPrimaryTooDark || isSecondaryTooLight || isSecondaryTooDark;

  // ── Live preview injection (warna berubah real-time saat user pick color) ───
  useEffect(() => {
    const primary   = isValidHex(primaryColor)  ? primaryColor  : "#00b7b5";
    const secondary = isValidHex(accentColor)   ? accentColor   : "#018790";

    let styleTag = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = PREVIEW_STYLE_ID;
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root, html {
        --color-aksen-primary: ${primary};
        --color-aksen-secondary: ${secondary};
      }
    `;
  }, [primaryColor, accentColor]);

  // Cleanup preview style on unmount
  useEffect(() => {
    return () => {
      document.getElementById(PREVIEW_STYLE_ID)?.remove();
    };
  }, []);

  const handleSubmit = (data: any) => {
    if (hasWarning) {
      const confirmed = window.confirm(
        "Warna yang dipilih mungkin terlalu terang atau terlalu gelap sehingga teks tidak terbaca dengan baik.\n\nLanjutkan menyimpan?"
      );
      if (!confirmed) return;
    }
    onSave(data);
  };

  const resolvedPrimary   = isValidHex(primaryColor)  ? primaryColor  : "#00b7b5";
  const resolvedSecondary = isValidHex(accentColor)   ? accentColor   : "#018790";

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-zinc-800 mb-1">Appearance</h2>
          <p className="text-sm text-zinc-500">Customize the look of your branch dashboard.</p>
        </div>

        <hr />

        {/* Color preview swatches */}
        <div>
          <p className="text-sm font-medium text-zinc-700 mb-3">Live Preview</p>
          <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl border border-zinc-200 bg-zinc-50">
            {/* Swatch primary */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl border border-zinc-200 shadow-sm transition-all duration-300"
                  style={{ backgroundColor: resolvedPrimary }}
                />
                {(isPrimaryTooLight || isPrimaryTooDark) && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow">
                    !
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Primary</span>
            </div>
            {/* Swatch secondary */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl border border-zinc-200 shadow-sm transition-all duration-300"
                  style={{ backgroundColor: resolvedSecondary }}
                />
                {(isSecondaryTooLight || isSecondaryTooDark) && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow">
                    !
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Secondary</span>
            </div>
            {/* Button preview */}
            <div className="flex flex-col items-center gap-1.5 ml-2">
              <div
                className="px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all duration-300"
                style={{ backgroundColor: resolvedPrimary }}
              >
                Button Primary
              </div>
              <div
                className="px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all duration-300"
                style={{ backgroundColor: resolvedSecondary }}
              >
                Button Secondary
              </div>
            </div>
            {/* Sidebar item preview */}
            <div className="flex flex-col items-center gap-1.5 ml-2">
              <div
                className="px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all duration-300"
                style={{ backgroundColor: resolvedPrimary }}
              >
                <span className="w-3 h-3 rounded-full bg-white/60 inline-block" />
                Active Menu
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Sidebar item</span>
            </div>
          </div>

          {/* Warning banner */}
          {hasWarning && (
            <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
              <span className="font-bold shrink-0 mt-0.5">⚠</span>
              <span>
                {(isPrimaryTooLight || isSecondaryTooLight)
                  ? "Warna terlalu terang — teks putih pada button/sidebar akan sulit terbaca."
                  : "Warna terlalu gelap — pastikan kontras cukup untuk tampilan yang baik."}
              </span>
            </div>
          )}
        </div>

        {/* Color pickers */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Primary Color
              <span className="text-xs font-normal text-zinc-400 ml-1">(aksen-primary)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...form.register("primary_color")}
                className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 flex-shrink-0"
              />
              <TextInput name="primary_color" placeholder="#00b7b5" />
            </div>
            {isPrimaryTooLight && (
              <p className="mt-1 text-xs text-amber-600">Terlalu terang untuk background button</p>
            )}
            {isPrimaryTooDark && (
              <p className="mt-1 text-xs text-amber-600">Terlalu gelap, kontras mungkin rendah</p>
            )}
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Secondary Color
              <span className="text-xs font-normal text-zinc-400 ml-1">(aksen-secondary)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...form.register("accent_color")}
                className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 flex-shrink-0"
              />
              <TextInput name="accent_color" placeholder="#018790" />
            </div>
            {isSecondaryTooLight && (
              <p className="mt-1 text-xs text-amber-600">Terlalu terang untuk background button</p>
            )}
            {isSecondaryTooDark && (
              <p className="mt-1 text-xs text-amber-600">Terlalu gelap, kontras mungkin rendah</p>
            )}
          </div>
          <div className="col-span-12 sm:col-span-4">
            <TextInput name="logo_url" label="Logo URL (optional)" placeholder="https://..." />
          </div>
        </div>

        <FormActions isSaving={isSaving} isResetting={isResetting} onReset={onReset} />
      </form>
    </FormProvider>
  );
}