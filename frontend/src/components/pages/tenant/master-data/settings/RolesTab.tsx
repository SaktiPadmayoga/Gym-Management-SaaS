"use client";

import { useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { Icon } from "@/components/icon";
import { useDebounce } from "@/hooks/useDebounce";
import {
    useRoles,
    useDeleteRole,
    useCreateRole,
    useUpdateRole,
    usePermissions,
    useUpdateAccessLevel,
} from "@/hooks/tenant/useRoles";
import {
    Role,
    RoleCreateRequest,
    AccessLevel,
    PermissionGroup,
    RESOURCE_GROUP_LABELS,
    RESOURCE_GROUP_ICONS,
} from "@/types/tenant/roles";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type View = "list" | "create" | "edit" | "permissions";

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function RolesTab() {
    const [view, setView] = useState<View>("list");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setView("edit");
    };

    const handlePermissions = (role: Role) => {
        setSelectedRole(role);
        setView("permissions");
    };

    const handleBack = () => {
        setSelectedRole(null);
        setView("list");
    };

    if (view === "create") return <RoleForm mode="create" onBack={handleBack} />;
    if (view === "edit" && selectedRole)
        return <RoleForm mode="edit" role={selectedRole} onBack={handleBack} />;
    if (view === "permissions" && selectedRole)
        return <PermissionManager role={selectedRole} onBack={handleBack} />;

    return (
        <RoleList
            onEdit={handleEdit}
            onPermissions={handlePermissions}
            onCreate={() => setView("create")}
        />
    );
}

/* ─── Role List ──────────────────────────────────────────────────────────────── */

function RoleList({
    onEdit,
    onPermissions,
    onCreate,
}: {
    onEdit: (r: Role) => void;
    onPermissions: (r: Role) => void;
    onCreate: () => void;
}) {
    const form = useForm<{ search: string }>({ defaultValues: { search: "" } });
    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useRoles({ search: debouncedSearch });
    const deleteMutation = useDeleteRole();

    const entries: Role[] = data ?? [];

    /** Derive access level from permissions array */
    const getAccessSummary = (permissions: string[]): { view: number; manage: number; none: number } => {
        const groups = new Set(permissions.map(p => p.split('.')[0]));
        let view = 0, manage = 0;
        const allGroups = Object.keys(RESOURCE_GROUP_LABELS);

        allGroups.forEach(g => {
            const hasManage = permissions.includes(`${g}.manage`);
            const hasView = permissions.includes(`${g}.view`);
            if (hasManage) manage++;
            else if (hasView) view++;
        });

        return { view, manage, none: allGroups.length - view - manage };
    };

    const columns: Column<Role>[] = [
        {
            header: "Role Name",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">{item.display_name}</span>
                    <span className="text-xs text-zinc-500 font-mono">{item.name}</span>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Description",
            render: (item) => (
                <span className="text-sm text-zinc-500">{item.description ?? "-"}</span>
            ),
            width: "w-64",
        },
        {
            header: "Permissions",
            render: (item) => {
                const summary = getAccessSummary(item.permissions);
                return (
                    <div className="flex items-center gap-1.5">
                        {summary.manage > 0 && (
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {summary.manage} Full
                            </span>
                        )}
                        {summary.view > 0 && (
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                {summary.view} View
                            </span>
                        )}
                        {summary.none > 0 && (
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-400 border border-gray-100">
                                {summary.none} Off
                            </span>
                        )}
                    </div>
                );
            },
            width: "w-56",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium text-sm">
                        Active
                    </span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium text-sm">
                        Inactive
                    </span>
                ),
            width: "w-24",
        },
    ];

    const actions: ActionItem<Role>[] = [
        {
            label: "Manage Permissions",
            icon: "masterData",
            className: "text-purple-600 hover:bg-purple-50",
            onClick: (row) => {
                if (row.name === "owner") {
                    toast.error("Owner role has full access and cannot be modified");
                    return;
                }
                onPermissions(row);
            },
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => onEdit(row),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (row.name === "owner") {
                    toast.error("Owner role cannot be deleted");
                    return;
                }
                if (confirm("Are you sure you want to delete this role?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Role deleted successfully"),
                        onError: () => toast.error("Failed to delete role"),
                    });
                }
            },
        },
    ];

    if (isError) return (
        <div className="py-10 text-center text-red-500">Error loading roles</div>
    );

    return (
        <FormProvider {...form}>
            <div className="space-y-4">
                {/* Sub-header */}
                <div>
                    <h2 className="text-base font-semibold text-zinc-800 mb-1">Roles & Permissions</h2>
                    <p className="text-sm text-zinc-500">Manage staff roles and access permissions for this branch.</p>
                </div>

                <hr />

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="w-64 text-zinc-800">
                        <SearchInput name="search" />
                    </div>
                    <CustomButton
                        iconName="plus"
                        className="text-white px-3 bg-aksen-secondary"
                        onClick={onCreate}
                    >
                        New Role
                    </CustomButton>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <CustomTable
                        columns={columns}
                        data={entries}
                        actions={actions}
                        onRowClick={(row) => {
                            if (row.name === "owner") {
                                onEdit(row);
                            } else {
                                onPermissions(row);
                            }
                        }}
                    />
                )}

                <div className="text-sm text-zinc-500">
                    Showing {entries.length > 0 ? 1 : 0} to {entries.length} of {entries.length} data
                </div>
            </div>
        </FormProvider>
    );
}

/* ─── Role Form (Create & Edit) ──────────────────────────────────────────────── */

interface RoleFormProps {
    mode: "create" | "edit";
    role?: Role;
    onBack: () => void;
}

function RoleForm({ mode, role, onBack }: RoleFormProps) {
    const createMutation = useCreateRole();
    const updateMutation = useUpdateRole();

    const isPending = createMutation.isPending || updateMutation.isPending;

    const form = useForm<RoleCreateRequest>({
        mode: "onChange",
        defaultValues: {
            name:         role?.name         ?? "",
            display_name: role?.display_name ?? "",
            description:  role?.description  ?? "",
            is_active:    role?.is_active    ?? true,
        },
    });

    const onSubmit = async (formData: RoleCreateRequest) => {
        try {
            const payload: RoleCreateRequest = {
                ...formData,
                name: formData.name.toLowerCase().replace(/\s+/g, "_"),
            };

            if (mode === "create") {
                await createMutation.mutateAsync(payload);
                toast.success("Role created successfully");
            } else {
                await updateMutation.mutateAsync({ id: role!.id, payload });
                toast.success("Role updated successfully");
            }

            onBack();
        } catch {
            toast.error(mode === "create" ? "Failed to create role" : "Failed to update role");
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Sub-header */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-zinc-400 hover:text-zinc-700 transition"
                    >
                        <Icon name="back" className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-base font-semibold text-zinc-800">
                            {mode === "create" ? "Create New Role" : `Edit Role — ${role?.display_name}`}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {mode === "create"
                                ? "Define a new role for your staff."
                                : "Update role details."}
                        </p>
                    </div>
                </div>

                <hr />

                {/* Basic info */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <TextInput name="display_name" label="Display Name" placeholder="e.g. Branch Manager" />
                    </div>
                    <div className="col-span-6">
                        <TextInput
                            name="name"
                            label="Role Code (System Name)"
                            placeholder="e.g. branch_manager"
                            disabled={mode === "edit"}
                        />
                    </div>
                    <div className="col-span-12">
                        <TextInput
                            name="description"
                            label="Description"
                            placeholder="Brief description of what this role can do"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        {...form.register("is_active")}
                    />
                    <span className="text-sm font-medium text-zinc-700">Active</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-zinc-400 hover:text-zinc-600 transition"
                    >
                        ← Back to list
                    </button>
                    <CustomButton
                        type="submit"
                        disabled={isPending}
                        className="bg-aksen-secondary text-white px-4 py-2 disabled:opacity-50"
                    >
                        {isPending
                            ? mode === "create" ? "Creating..." : "Saving..."
                            : mode === "create" ? "Create and save" : "Save changes"}
                    </CustomButton>
                </div>
            </form>
        </FormProvider>
    );
}

/* ─── Permission Manager ─────────────────────────────────────────────────────── */

interface PermissionManagerProps {
    role: Role;
    onBack: () => void;
}

function PermissionManager({ role, onBack }: PermissionManagerProps) {
    const { data: permissionGroups, isLoading } = usePermissions();
    const { data: rolesData } = useRoles();
    const updateAccessLevel = useUpdateAccessLevel();

    // Get latest role data from cache (optimistic updates)
    const currentRole = useMemo(() => {
        const freshRole = rolesData?.find(r => r.id === role.id);
        return freshRole ?? role;
    }, [rolesData, role]);

    /** Get access level for a group from current role permissions. */
    const getAccessLevel = (group: string): AccessLevel => {
        const hasManage = currentRole.permissions.includes(`${group}.manage`);
        const hasView = currentRole.permissions.includes(`${group}.view`);
        if (hasManage) return "manage";
        if (hasView) return "view";
        return "none";
    };

    /** Check if a group has a manage permission available. */
    const hasManageOption = (group: PermissionGroup): boolean => {
        return group.permissions.some(p => p.action === "manage");
    };

    const handleAccessChange = (group: string, level: AccessLevel) => {
        updateAccessLevel.mutate(
            { roleId: currentRole.id, group, level },
            {
                onError: () => {
                    toast.error(`Failed to update ${group} access`);
                },
            }
        );
    };

    // Count summary
    const summary = useMemo(() => {
        if (!permissionGroups) return { full: 0, view: 0, none: 0, total: 0 };
        let full = 0, view = 0, none = 0;
        permissionGroups.forEach(pg => {
            const level = getAccessLevel(pg.group);
            if (level === "manage") full++;
            else if (level === "view") view++;
            else none++;
        });
        return { full, view, none, total: permissionGroups.length };
    }, [permissionGroups, currentRole.permissions]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-zinc-100 rounded animate-pulse w-64" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 bg-zinc-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-zinc-400 hover:text-zinc-700 transition"
                >
                    <Icon name="back" className="h-6 w-6" />
                </button>
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-zinc-800">
                        Permissions — {currentRole.display_name}
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Set access level for each module. Changes are saved automatically.
                    </p>
                </div>
                {/* Summary badges */}
                <div className="flex items-center gap-1.5">
                    {summary.full > 0 && (
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                            {summary.full} Full
                        </span>
                    )}
                    {summary.view > 0 && (
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                            {summary.view} View
                        </span>
                    )}
                    {summary.none > 0 && (
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-50 text-zinc-400 border border-zinc-200">
                            {summary.none} Off
                        </span>
                    )}
                </div>
            </div>

            <hr />

            {/* Permission Rows */}
            <div className="space-y-2">
                {permissionGroups?.map((pg) => {
                    const level = getAccessLevel(pg.group);
                    const icon = RESOURCE_GROUP_ICONS[pg.group] ?? "📦";
                    const canManage = hasManageOption(pg);

                    return (
                        <div
                            key={pg.group}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                level === "manage"
                                    ? "bg-emerald-50/50 border-emerald-200"
                                    : level === "view"
                                    ? "bg-blue-50/50 border-blue-200"
                                    : "bg-zinc-50/50 border-zinc-200"
                            }`}
                        >
                            {/* Left: Icon + Label */}
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl flex-shrink-0">{icon}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-800">{pg.label}</p>
                                    <p className="text-xs text-zinc-400 font-mono">{pg.group}</p>
                                </div>
                            </div>

                            {/* Right: Segmented Control */}
                            <div className="flex items-center bg-white rounded-lg border border-zinc-200 p-0.5 shadow-sm">
                                <AccessButton
                                    label="No Access"
                                    isActive={level === "none"}
                                    variant="none"
                                    onClick={() => handleAccessChange(pg.group, "none")}
                                />
                                <AccessButton
                                    label="View Only"
                                    isActive={level === "view"}
                                    variant="view"
                                    onClick={() => handleAccessChange(pg.group, "view")}
                                />
                                {canManage && (
                                    <AccessButton
                                        label="Full Access"
                                        isActive={level === "manage"}
                                        variant="manage"
                                        onClick={() => handleAccessChange(pg.group, "manage")}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Back link */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-zinc-400 hover:text-zinc-600 transition"
                >
                    ← Back to list
                </button>
            </div>
        </div>
    );
}

/* ─── Access Button (Segmented Control) ──────────────────────────────────────── */

function AccessButton({
    label,
    isActive,
    variant,
    onClick,
}: {
    label: string;
    isActive: boolean;
    variant: "none" | "view" | "manage";
    onClick: () => void;
}) {
    const activeClasses: Record<string, string> = {
        none:   "bg-zinc-100 text-zinc-700 shadow-sm",
        view:   "bg-blue-500 text-white shadow-sm",
        manage: "bg-emerald-500 text-white shadow-sm",
    };

    const inactiveClass = "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                isActive ? activeClasses[variant] : inactiveClass
            }`}
        >
            {label}
        </button>
    );
}