"use client";

import CustomButton from "@/components/ui/button/CustomButton";

interface FormActionsProps {
  isSaving: boolean;
  isResetting: boolean;
  onReset: () => void;
}

export function FormActions({ isSaving, isResetting, onReset }: FormActionsProps) {
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