"use client";

import { useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { Icon } from "@/components/icon";
import { useDebounce } from "@/hooks/useDebounce";
import { useRoles, useDeleteRole, useCreateRole, useUpdateRole, usePermissions, useUpdateAccessLevel, useCreatePermission } from "@/hooks/tenant/useRoles";
import { Role, RoleCreateRequest, AccessLevel, PermissionGroup, RESOURCE_GROUP_LABELS, RESOURCE_GROUP_ICONS } from "@/types/tenant/roles";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type View = "list" | "create" | "edit" | "permissions" | "create_permission";

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function RolesAndPermissions() {
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

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />

            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Pengelolaan Pengguna</li>
                        <li className="text-aksen-secondary">Role & Hak</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-zinc-800">Role & Hak Akses</h1>
                    <p className="text-zinc-500">Kelola peran staf dan tingkat hak akses modul di ekosistem gym Anda secara dinamis.</p>
                </div>

                <hr className="mb-6" />

                <div className="min-h-[400px]">
                    {view === "create" && <RoleForm mode="create" onBack={handleBack} />}
                    {view === "edit" && selectedRole && <RoleForm mode="edit" role={selectedRole} onBack={handleBack} />}
                    {view === "permissions" && selectedRole && <PermissionManager role={selectedRole} onBack={handleBack} />}
                    {view === "create_permission" && <PermissionForm onBack={handleBack} />}
                    {view === "list" && <RoleList onEdit={handleEdit} onPermissions={handlePermissions} onCreate={() => setView("create")} onCreatePermission={() => setView("create_permission")} />}
                </div>
            </div>
        </div>
    );
}

/* ─── Role List ──────────────────────────────────────────────────────────────── */

function RoleList({ onEdit, onPermissions, onCreate, onCreatePermission }: { onEdit: (r: Role) => void; onPermissions: (r: Role) => void; onCreate: () => void; onCreatePermission: () => void }) {
    const form = useForm<{ search: string }>({ defaultValues: { search: "" } });
    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useRoles({ search: debouncedSearch });
    const deleteMutation = useDeleteRole();

    const entries: Role[] = data ?? [];

    /** Derive access level from permissions array */
    const getAccessSummary = (permissions: string[]): { view: number; manage: number; none: number } => {
        let view = 0,
            manage = 0;
        const allGroups = Object.keys(RESOURCE_GROUP_LABELS);

        allGroups.forEach((g) => {
            const hasManage = permissions.includes(`${g}.manage`);
            const hasView = permissions.includes(`${g}.view`);
            if (hasManage) manage++;
            else if (hasView) view++;
        });

        return { view, manage, none: allGroups.length - view - manage };
    };

    const columns: Column<Role>[] = [
        {
            header: "Nama Peran (Role)",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900">{item.display_name}</span>
                    <span className="text-xs text-zinc-500 font-mono">{item.name}</span>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Deskripsi",
            render: (item) => <span className="text-sm text-zinc-500">{item.description ?? "-"}</span>,
            width: "w-64",
        },
        {
            header: "Hak Akses",
            render: (item) => {
                const summary = getAccessSummary(item.permissions);
                return (
                    <div className="flex items-center gap-1.5">
                        {summary.manage > 0 && <span className="rounded-md px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">{summary.manage} Penuh</span>}
                        {summary.view > 0 && <span className="rounded-md px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{summary.view} Lihat</span>}
                        {summary.none > 0 && <span className="rounded-md px-2 py-0.5 text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100">{summary.none} Nonaktif</span>}
                    </div>
                );
            },
            width: "w-56",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2.5 py-1 bg-green-50 text-xs font-bold border border-green-200">Aktif</span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2.5 py-1 bg-zinc-50 text-xs font-bold border border-zinc-200">Nonaktif</span>
                ),
            width: "w-24",
        },
    ];

    const actions: ActionItem<Role>[] = [
        {
            label: "Kelola Hak Akses",
            icon: "masterData",
            className: "text-purple-600 hover:bg-purple-50",
            onClick: (row) => {
                if (row.name === "owner") {
                    toast.error("Peran Owner memiliki akses penuh mutlak dan tidak dapat diubah");
                    return;
                }
                onPermissions(row);
            },
        },
        {
            label: "Ubah",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => onEdit(row),
        },
        {
            label: "Hapus",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (row.name === "owner") {
                    toast.error("Peran Owner adalah bawaan sistem dan tidak dapat dihapus");
                    return;
                }
                if (confirm("Apakah Anda yakin ingin menghapus peran ini? Tindakan ini tidak dapat dibatalkan.")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Role berhasil dihapus"),
                        onError: () => toast.error("Gagal menghapus role, pastikan tidak ada staf yang menggunakan role ini"),
                    });
                }
            },
        },
    ];

    if (isError) return <div className="py-10 text-center text-red-500 font-medium">Gagal memuat data role, silakan muat ulang halaman.</div>;

    return (
        <FormProvider {...form}>
            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="w-72 text-zinc-800">
                        <SearchInput name="search" placeholder="Cari nama peran..." />
                    </div>
                    <div className="flex items-center gap-2">
                        <CustomButton iconName="plus" className="text-aksen-secondary bg-white px-4 py-2 hover:bg-aksen-secondary/20 border-aksen-secondary" onClick={onCreatePermission}>
                            Modul / Hak Baru
                        </CustomButton>
                        <CustomButton iconName="plus" className="text-white px-4 py-2 bg-aksen-secondary border-none" onClick={onCreate}>
                            Role Baru
                        </CustomButton>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
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

                <div className="text-xs font-semibold text-zinc-400 mt-2 uppercase tracking-wider">
                    Menampilkan {entries.length > 0 ? 1 : 0} sampai {entries.length} dari {entries.length} data peran
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
            name: role?.name ?? "",
            display_name: role?.display_name ?? "",
            description: role?.description ?? "",
            is_active: role?.is_active ?? true,
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
                toast.success("Role berhasil dibuat");
            } else {
                await updateMutation.mutateAsync({ id: role!.id, payload });
                toast.success("Role berhasil diperbarui");
            }

            onBack();
        } catch {
            toast.error(mode === "create" ? "Gagal membuat role" : "Gagal memperbarui role");
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Sub-header */}
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onBack} className="text-zinc-400 hover:text-zinc-700 transition">
                        <Icon name="back" className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-800">{mode === "create" ? "Buat Peran Baru" : `Ubah Peran — ${role?.display_name}`}</h2>
                        <p className="text-sm text-zinc-500">{mode === "create" ? "Tentukan peran dan hak akses baru untuk staf Anda." : "Perbarui detail informasi peran."}</p>
                    </div>
                </div>

                <hr />

                {/* Basic info */}
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 md:col-span-6">
                        <TextInput name="display_name" label="Nama Tampilan Peran" placeholder="Contoh: Manajer Cabang" rules={{ required: "Nama tampilan wajib diisi" }} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <TextInput name="name" label="Kode Peran (Nama Sistem)" placeholder="Contoh: manajer_cabang" disabled={mode === "edit"} rules={{ required: "Kode peran wajib diisi" }} />
                    </div>
                    <div className="col-span-12">
                        <TextInput name="description" label="Deskripsi Peran" placeholder="Tulis ringkasan singkat fungsi peran staf ini..." />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" {...form.register("is_active")} />
                    <span className="text-sm font-semibold text-zinc-700">Aktifkan Peran Ini</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <button type="button" onClick={onBack} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 transition uppercase tracking-wider">
                        ← Kembali ke daftar
                    </button>
                    <CustomButton type="submit" disabled={isPending} className="bg-aksen-secondary border-none text-white px-5 py-2.5 disabled:opacity-50">
                        {isPending ? (mode === "create" ? "Membuat..." : "Menyimpan...") : mode === "create" ? "Buat Peran" : "Simpan Perubahan"}
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
        const freshRole = rolesData?.find((r) => r.id === role.id);
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
        return group.permissions.some((p) => p.action === "manage");
    };

    const handleAccessChange = (group: string, level: AccessLevel) => {
        updateAccessLevel.mutate(
            { roleId: currentRole.id, group, level },
            {
                onError: () => {
                    toast.error(`Gagal memperbarui hak akses ${group}`);
                },
            },
        );
    };

    // Count summary
    const summary = useMemo(() => {
        if (!permissionGroups) return { full: 0, view: 0, none: 0, total: 0 };
        let full = 0,
            view = 0,
            none = 0;
        permissionGroups.forEach((pg) => {
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
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onBack} className="text-zinc-400 hover:text-zinc-700 transition">
                        <Icon name="back" className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-800">Hak Akses — {currentRole.display_name}</h2>
                        <p className="text-sm text-zinc-500">Atur tingkat akses staf untuk setiap modul. Perubahan disimpan secara otomatis.</p>
                    </div>
                </div>
                {/* Summary badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {summary.full > 0 && <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{summary.full} Penuh</span>}
                    {summary.view > 0 && <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">{summary.view} Lihat</span>}
                    {summary.none > 0 && <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-zinc-50 text-zinc-400 border border-zinc-200">{summary.none} Mati</span>}
                </div>
            </div>

            <hr />

            {/* Permission Rows */}
            <div className="space-y-2.5">
                {permissionGroups?.map((pg) => {
                    const level = getAccessLevel(pg.group);
                    const icon = RESOURCE_GROUP_ICONS[pg.group] ?? "📦";
                    const canManage = hasManageOption(pg);

                    return (
                        <div
                            key={pg.group}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                level === "manage" ? "bg-emerald-50/30 border-emerald-200" : level === "view" ? "bg-blue-50/30 border-blue-200" : "bg-zinc-50/30 border-zinc-200"
                            }`}
                        >
                            {/* Left: Icon + Label */}
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl flex-shrink-0">{icon}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-zinc-800">{pg.label}</p>
                                    <p className="text-xs text-zinc-400 font-mono">{pg.group}</p>
                                </div>
                            </div>

                            {/* Right: Segmented Control */}
                            <div className="flex items-center bg-white rounded-lg border border-zinc-200 p-0.5 shadow-sm">
                                <AccessButton label="Tanpa Akses" isActive={level === "none"} variant="none" onClick={() => handleAccessChange(pg.group, "none")} />
                                <AccessButton label="Hanya Lihat" isActive={level === "view"} variant="view" onClick={() => handleAccessChange(pg.group, "view")} />
                                {canManage && <AccessButton label="Akses Penuh" isActive={level === "manage"} variant="manage" onClick={() => handleAccessChange(pg.group, "manage")} />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Back link */}
            <div className="pt-4 border-t border-zinc-100">
                <button type="button" onClick={onBack} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 transition uppercase tracking-wider">
                    ← Kembali ke daftar
                </button>
            </div>
        </div>
    );
}

/* ─── Access Button (Segmented Control) ──────────────────────────────────────── */

function AccessButton({ label, isActive, variant, onClick }: { label: string; isActive: boolean; variant: "none" | "view" | "manage"; onClick: () => void }) {
    const activeClasses: Record<string, string> = {
        none: "bg-zinc-100 text-zinc-700 shadow-sm",
        view: "bg-blue-500 text-white shadow-sm",
        manage: "bg-emerald-500 text-white shadow-sm",
    };

    const inactiveClass = "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50";

    return (
        <button type="button" onClick={onClick} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap cursor-pointer ${isActive ? activeClasses[variant] : inactiveClass}`}>
            {label}
        </button>
    );
}

/* ─── Permission Form (Create Modul Baru) ────────────────────────────────────── */

interface PermissionFormProps {
    onBack: () => void;
}

interface PermissionCreateFormInput {
    group: string;
    label: string;
    description?: string;
}

function PermissionForm({ onBack }: PermissionFormProps) {
    const createMutation = useCreatePermission();
    const isPending = createMutation.isPending;

    const form = useForm<PermissionCreateFormInput>({
        mode: "onChange",
        defaultValues: {
            group: "",
            label: "",
            description: "",
        },
    });

    const onSubmit = async (formData: PermissionCreateFormInput) => {
        try {
            // Clean dynamic group slug
            const cleanedGroup = formData.group.toLowerCase().replace(/[^a-z0-9_]/g, "");

            await createMutation.mutateAsync({
                group: cleanedGroup,
                label: formData.label.trim(),
                description: formData.description?.trim(),
            });

            toast.success("Hak akses baru berhasil dibuat");
            onBack();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || "Gagal membuat modul hak akses";
            toast.error(errorMsg);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Sub-header */}
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onBack} className="text-zinc-400 hover:text-zinc-700 transition">
                        <Icon name="back" className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-800">Buat Hak Akses Baru</h2>
                        <p className="text-sm text-zinc-500">Tambahkan grup modul baru ke sistem. Ini secara otomatis akan membuat hak akses "Lihat" dan "Kelola".</p>
                    </div>
                </div>

                <hr />

                {/* Form fields */}
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 md:col-span-6">
                        <TextInput
                            name="group"
                            label="Kode Modul (System Key / Slug)"
                            placeholder="Contoh: kantin_snack (hanya huruf kecil, angka, dan _)"
                            rules={{
                                required: "Kode modul wajib diisi",
                                pattern: {
                                    value: /^[a-z0-9_]+$/,
                                    message: "Kode harus berupa huruf kecil, angka, atau underscore saja",
                                },
                            }}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <TextInput name="label" label="Nama Tampilan Modul (Display Label)" placeholder="Contoh: Kantin & Snack" rules={{ required: "Nama tampilan modul wajib diisi" }} />
                    </div>
                    <div className="col-span-12">
                        <TextInput name="description" label="Deskripsi Modul (Opsional)" placeholder="Tulis penjelasan singkat modul atau fitur ini..." />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <button type="button" onClick={onBack} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 transition uppercase tracking-wider">
                        ← Kembali ke daftar
                    </button>
                    <CustomButton type="submit" disabled={isPending} className="bg-aksen-secondary border-none text-white px-5 py-2.5 disabled:opacity-50">
                        {isPending ? "Membuat..." : "Buat Modul Hak Akses"}
                    </CustomButton>
                </div>
            </form>
        </FormProvider>
    );
}
