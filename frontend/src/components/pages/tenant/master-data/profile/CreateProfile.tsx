"use client";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { TextInput } from "@/components/ui/input/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateUser } from "@/hooks/tenant/useUsers";
import { toast } from "sonner";

// Type for API error responses
interface ApiError {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
}

// Sesuai dengan payload yang diterima StoreUserRequest di Backend
type UserRole = "admin" | "trainer" | "receptionist" | "owner" | "member";

interface CreateUserFormValues {
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean; // Backend: $request->boolean('isActive')
}

export default function CreateUser() {
    const router = useRouter();
    const { mutate: createUser, isPending } = useCreateUser();

    const form = useForm<CreateUserFormValues>({
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            role: "member",
            isActive: true,
        },
    });

    const onSubmit = (data: CreateUserFormValues) => {
        // Payload murni sesuai struktur tabel 'users'
        createUser(data, {
            onSuccess: () => {
                router.push("/users?success=true");
            },
        });
    };

    // Opsi Role sesuai Enum di database migration users
    const roleOptions: DropdownOption[] = [
        { label: "Member", value: "member", key: "member" },
        { label: "Trainer", value: "trainer", key: "trainer" },
        { label: "Receptionist", value: "receptionist", key: "receptionist" },
        { label: "Admin", value: "admin", key: "admin" },
        { label: "Owner", value: "owner", key: "owner" },
    ];

    // Opsi Status Active
    const statusOptions: DropdownOption[] = [
        { label: "Active", value: true, key: "active" },
        { label: "Inactive", value: false, key: "inactive" },
    ];

    const { isValid } = form.formState;

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree text-zinc-900 rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    {/* Breadcrumb & Navigation */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li>
                                <Link href="/users">Users</Link>
                            </li>
                            <li className="text-aksen-secondary font-medium">Create New</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex flex-row items-center gap-2 text-aksen-dark">
                            <button onClick={() => router.back()} type="button" className="hover:bg-zinc-100 p-1.5 rounded-full transition-colors">
                                <Icon name="back" className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create New User</h1>
                        </div>
                        <div className="flex gap-3">
                            <CustomButton
                                className={`px-5 py-2.5 text-white font-medium transition-all ${isValid && !isPending ? "bg-aksen-secondary hover:bg-aksen-secondary/90 shadow-sm" : "bg-gray-300 cursor-not-allowed"}`}
                                type="submit"
                                disabled={!isValid || isPending}
                            >
                                {isPending ? "Creating..." : "Create User"}
                            </CustomButton>
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    <div className="flex flex-col gap-6 max-w-4xl">
                        {/* ALERT INFO */}
                        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <Icon name="plus" className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold">Note:</span> This form creates a base User account for authentication. Profile details (Name, Phone, etc.) should be updated by the user after login or via the Profile
                                Management page.
                            </div>
                        </div>

                        {/* FORM FIELDS */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Email - Required, Valid Email */}
                            <div className="col-span-12 md:col-span-6">
                                <TextInput name="email" label="Email Address" placeholder="e.g. user@gym-system.com" type="email" />
                            </div>

                            {/* Role - Required */}
                            <div className="col-span-12 md:col-span-6">
                                <SearchableDropdown name="role" label="Access Role" placeholder="Select role..." options={roleOptions} isSearchable={false} />
                            </div>

                            {/* Password - Min 8 Chars */}
                            <div className="col-span-12 md:col-span-6">
                                <TextInput name="password" label="Password" placeholder="Set initial password" type="password" />
                            </div>

                            {/* Status - Boolean */}
                            <div className="col-span-12 md:col-span-6">
                                <SearchableDropdown name="isActive" label="Account Status" placeholder="Select status..." options={statusOptions} isSearchable={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
