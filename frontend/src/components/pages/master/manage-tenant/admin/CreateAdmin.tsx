"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { AdminCreateRequest } from "@/types/central/admins";
import { useCreateAdmin } from "@/hooks/useAdmins";

/* =========================
 * ROLE OPTIONS
 * ========================= */
const roleOptions: DropdownOption<string>[] = [
    { key: "super_admin", label: "Super Admin", value: "super_admin" },
    { key: "admin", label: "Admin", value: "admin" },
];

/* =========================
 * STATUS OPTIONS
 * ========================= */
const statusOptions: DropdownOption<string>[] = [
    { key: "active", label: "Active", value: "active" },
    { key: "inactive", label: "Inactive", value: "inactive" },
];

/* =========================
 * FORM TYPE
 * ========================= */
interface CreateAdminFormData {
    name: string;
    email: string;
    password: string;
    role: "super_admin" | "finance";
    
}

export default function CreateAdmin() {
    const router = useRouter();
    const createMutation = useCreateAdmin();

    const form = useForm<CreateAdminFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "super_admin",
            
        },
    });

    const onSubmit = async (formData: CreateAdminFormData) => {
        try {
            const payload: AdminCreateRequest = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                
            };

            await createMutation.mutateAsync(payload);

            toast.success("Admin created successfully");
            router.push("/admin/admins?success=true");
        } catch (err) {
            toast.error("Failed to create admin");
            console.error(err);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>System Management</li>
                            <li>
                                <Link href="/admin/admins">Admins</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button
                                type="button"
                                onClick={() => router.push("/admin/admins")}
                            >
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Admin</h1>
                        </div>

                        <CustomButton
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput
                                    name="name"
                                    label="Full Name"
                                    placeholder="e.g John Doe"
                                />
                            </div>

                            <div className="col-span-6">
                                <TextInput
                                    name="email"
                                    label="Email"
                                    placeholder="e.g admin@saas.com"
                                />
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="col-span-6">
                                <SearchableDropdown
                                    name="role"
                                    label="Role"
                                    options={roleOptions}
                                />
                            </div>
                        </div>

                        
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}