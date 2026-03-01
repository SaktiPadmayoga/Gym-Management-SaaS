"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { AccountCreateRequest } from "@/types/central/accounts";
import { useCreateAccount } from "@/hooks/useAccounts";

/* =========================
 * STATUS OPTIONS
 * ========================= */
const statusOptions: DropdownOption<string>[] = [
    { key: "trial", label: "Trial", value: "trial" },
    { key: "active", label: "Active", value: "active" },
    { key: "suspended", label: "Suspended", value: "suspended" },
    { key: "cancelled", label: "Cancelled", value: "cancelled" },
];

/* =========================
 * FORM TYPE
 * ========================= */
interface CreateAccountFormData {
    name: string;
    email: string;
    password: string;
    phone: string | null;
    company_name: string | null;
    status: "trial" | "active" | "suspended" | "cancelled";
}

export default function CreateAccount() {
    const router = useRouter();
    const createMutation = useCreateAccount();

    const form = useForm<CreateAccountFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            company_name: "",
            status: "trial",
        },
    });

    const onSubmit = async (formData: CreateAccountFormData) => {
        try {
            const payload: AccountCreateRequest = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || null,
                company_name: formData.company_name || null,
                status: formData.status,
            };

            await createMutation.mutateAsync(payload);

            toast.success("Account created successfully");
            router.push("/admin/accounts?success=true");
        } catch (err) {
            toast.error("Failed to create account");
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
                            <li>Master Data</li>
                            <li>
                                <Link href="/admin/accounts">Accounts</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/admin/accounts")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <h1 className="text-2xl font-semibold">Create Account</h1>
                        </div>

                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-4 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Creating..." : "Create and save"}
                        </CustomButton>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" placeholder="e.g John Doe" />
                            </div>

                            <div className="col-span-6">
                                <TextInput name="email" label="Email" placeholder="e.g admin@gym.com" />
                            </div>
                        </div>

                        {/* SECURITY */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="password" label="Password" type="password" placeholder="Minimum 6 characters" />
                            </div>

                            <div className="col-span-6">
                                <SearchableDropdown name="status" label="Status" options={statusOptions} />
                            </div>
                        </div>

                        <hr />

                        {/* COMPANY */}
                        <h2 className="text-lg font-semibold text-gray-800">Company Info</h2>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="company_name" label="Company Name" placeholder="e.g PT Gym Sejahtera" />
                            </div>

                            <div className="col-span-6">
                                <TextInput name="phone" label="Phone" placeholder="e.g 08123456789" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
