"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { Icon } from "@/components/icon";
import { useDebounce } from "@/hooks/useDebounce";
import { useRoles, useDeleteRole, useCreateRole, useUpdateRole } from "@/hooks/tenant/useRoles";
import { Role, RoleCreateRequest, AVAILABLE_PERMISSIONS } from "@/types/tenant/roles";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type View = "list" | "create" | "edit";

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function RolesTab() {
  const [view, setView] = useState<View>("list");
  const [editTarget, setEditTarget] = useState<Role | null>(null);

  const handleEdit = (role: Role) => {
    setEditTarget(role);
    setView("edit");
  };

  const handleBack = () => {
    setEditTarget(null);
    setView("list");
  };

  if (view === "create") return <RoleForm mode="create" onBack={handleBack} />;
  if (view === "edit" && editTarget) return <RoleForm mode="edit" role={editTarget} onBack={handleBack} />;

  return <RoleList onEdit={handleEdit} onCreate={() => setView("create")} />;
}

/* ─── Role List ──────────────────────────────────────────────────────────────── */

function RoleList({ onEdit, onCreate }: { onEdit: (r: Role) => void; onCreate: () => void }) {
  const form = useForm<{ search: string }>({ defaultValues: { search: "" } });
  const searchValue = form.watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  const { data, isLoading, isError } = useRoles({ search: debouncedSearch });
  const deleteMutation = useDeleteRole();

  const entries: Role[] = data ?? [];

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
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.permissions.slice(0, 3).map((perm) => (
            <span
              key={perm}
              className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100"
            >
              {perm}
            </span>
          ))}
          {item.permissions.length > 3 && (
            <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
              +{item.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
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
            onRowClick={(row) => onEdit(row)}
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
      permissions:  role?.permissions  ?? [],
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
                ? "Define a new role and assign permissions."
                : "Update role details and permissions."}
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
              disabled={mode === "edit"} // slug tidak boleh diubah setelah dibuat
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

        <hr />

        {/* Permissions */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 mb-1">Access Permissions</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Select the modules this role can access.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <label
                key={perm.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={perm.id}
                  className="checkbox checkbox-sm checkbox-primary mt-0.5"
                  {...form.register("permissions")}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-800">{perm.label}</span>
                  <span className="text-xs text-zinc-400 font-mono mt-0.5">{perm.id}</span>
                </div>
              </label>
            ))}
          </div>
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