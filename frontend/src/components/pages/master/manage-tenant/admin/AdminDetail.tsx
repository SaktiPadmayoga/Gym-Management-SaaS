"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { AdminData, AdminUpdateRequest } from "@/types/central/admins";
import { useAdmin, useUpdateAdmin } from "@/hooks/useAdmins";

/* =========================
 * ROLE OPTIONS
 * ========================= */
const roleOptions: DropdownOption<string>[] = [
    { key: "super_admin", label: "Super Admin", value: "super_admin" },
    { key: "admin", label: "Admin", value: "admin" },
];

/* =========================
 * FORM SHAPE
 * ========================= */
interface AdminFormData {
    name: string;
    email: string;
    password?: string;
    role: "super_admin" | "finance" | "support";
    is_active: boolean;
}

console.log("FILE LOADED");

export default function AdminDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: admin, isLoading, isError } = useAdmin(id);
    console.log("isLoading:", isLoading);
    console.log("isError:", isError);
    console.log("admin:", admin);
    const updateMutation = useUpdateAdmin();

    const form = useForm<AdminFormData>({
        mode: "onChange",
    });

    /* =========================
     * SET DEFAULT VALUE
     * ========================= */
    useEffect(() => {
        if (!admin) return;

        form.reset({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            is_active: admin.is_active,
            password: "",
        });
    }, [admin, form]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError) return notFound();

    /* =========================
     * SAVE UPDATE
     * ========================= */
    const handleSave = async () => {
        try {
            const formData = form.getValues();

            const payload: AdminUpdateRequest = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                is_active: formData.is_active,
                ...(formData.password ? { password: formData.password } : {}),
            };

            await updateMutation.mutateAsync({
                id,
                payload,
            });

            toast.success("Admin updated successfully");
            setIsEditMode(false);
            router.push("/admin/admins");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update admin");
        }
    };

    const handleCancel = () => {
        if (!admin) return;

        form.reset({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            is_active: admin.is_active,
            password: "",
        });

        setIsEditMode(false);
    };

    return (
        <FormProvider {...form}>
            
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>System Management</li>
                            <li>
                                <Link href="/admin/admins">Admins</Link>
                            </li>
                            <li className="text-aksen-secondary">{id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/admin/admins">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <h1 className="text-2xl font-semibold">Admin Detail</h1>
                        </div>

                        {!isEditMode ? (
                            <CustomButton
                                type="button"
                                iconName="edit"
                                className="bg-aksen-secondary text-white px-4 py-2.5"
                                onClick={() => setIsEditMode(true)}
                            >
                                Edit
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton
                                    type="button"
                                    className="border px-4 py-2.5"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </CustomButton>
                                <CustomButton
                                    type="button"
                                    className="bg-aksen-secondary text-white px-4 py-2.5"
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? "Saving..." : "Save"}
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email" disabled={!isEditMode} />
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput
                                    name="password"
                                    label="New Password (optional)"
                                    type="password"
                                    placeholder="Leave empty to keep current password"
                                    disabled={!isEditMode}
                                />
                            </div>
                            <div className="col-span-6">
                                <SearchableDropdown
                                    name="role"
                                    label="Role"
                                    options={roleOptions}
                                    disabled={!isEditMode}
                                />
                            </div>
                        </div>

                        <hr />

                        {/* ACTIVE FLAG */}
                        <h2 className="text-lg font-semibold text-gray-800">Status</h2>
                        <div className="flex gap-10 text-gray-800">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...form.register("is_active")}
                                    disabled={!isEditMode}
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}