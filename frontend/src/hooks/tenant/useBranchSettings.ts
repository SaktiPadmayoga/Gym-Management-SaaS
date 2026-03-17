import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchSettingsAPI } from "@/lib/api/tenant/branchSettings";
import { UpdateSettingGroupPayload, UpdateSettingsBatchPayload } from "@/types/tenant/branch-settings";
import { useBranch } from "@/providers/BranchProvider";
import { toast } from "sonner";

/* =====================
 * QUERY KEYS
 * ===================== */

export const settingKeys = {
    all:    (branchId: string) => ["branch-settings", branchId] as const,
    group:  (branchId: string, group: string) => ["branch-settings", branchId, group] as const,
    public: (branchId: string) => ["branch-settings", branchId, "public"] as const,
};

/* =====================
 * GET ALL SETTINGS
 * ===================== */

export function useBranchSettings(group?: string) {
    const { branchId } = useBranch();

    return useQuery({
        queryKey: group ? settingKeys.group(branchId!, group) : settingKeys.all(branchId!),
        queryFn:  () => branchSettingsAPI.getAll(branchId!, group),
        enabled:  !!branchId,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET PUBLIC SETTINGS
 * ===================== */

export function usePublicBranchSettings(branchId?: string) {
    return useQuery({
        queryKey: settingKeys.public(branchId!),
        queryFn:  () => branchSettingsAPI.getPublic(branchId!),
        enabled:  !!branchId,
        staleTime: 10 * 60 * 1000,
    });
}

/* =====================
 * UPDATE GROUP
 * ===================== */

export function useUpdateSettingGroup(group: string) {
    const queryClient = useQueryClient();
    const { branchId } = useBranch();

    return useMutation({
        mutationFn: (payload: UpdateSettingGroupPayload) =>
            branchSettingsAPI.updateGroup(branchId!, group, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingKeys.all(branchId!) });
            queryClient.invalidateQueries({ queryKey: settingKeys.public(branchId!) });
            toast.success("Settings saved successfully");
        },

        onError: () => {
            toast.error("Failed to save settings");
        },
    });
}

/* =====================
 * UPDATE BATCH
 * ===================== */

export function useUpdateSettingsBatch() {
    const queryClient = useQueryClient();
    const { branchId } = useBranch();

    return useMutation({
        mutationFn: (payload: UpdateSettingsBatchPayload) =>
            branchSettingsAPI.updateBatch(branchId!, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingKeys.all(branchId!) });
            queryClient.invalidateQueries({ queryKey: settingKeys.public(branchId!) });
            toast.success("Settings saved successfully");
        },

        onError: () => {
            toast.error("Failed to save settings");
        },
    });
}

/* =====================
 * RESET GROUP
 * ===================== */

export function useResetSettingGroup(group: string) {
    const queryClient = useQueryClient();
    const { branchId } = useBranch();

    return useMutation({
        mutationFn: () => branchSettingsAPI.resetGroup(branchId!, group),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingKeys.all(branchId!) });
            queryClient.invalidateQueries({ queryKey: settingKeys.public(branchId!) });
            toast.success("Settings reset to default");
        },

        onError: () => {
            toast.error("Failed to reset settings");
        },
    });
}