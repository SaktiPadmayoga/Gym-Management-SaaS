"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useState } from "react";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import { useCreateMember } from "@/hooks/tenant/useMembers";

/* =========================
 * OPTIONS
 * ========================= */

const genderOptions: DropdownOption<string>[] = [
    { key: "male", label: "Male", value: "male" },
    { key: "female", label: "Female", value: "female" },
    { key: "other", label: "Other", value: "other" },
];

/* =========================
 * FORM TYPE
 * ========================= */

interface CreateMemberFormData {
    name: string;
    email: string;
    phone: string;
    emergency_contact: string;
    gender: "male" | "female" | "other" | "";
    date_of_birth: string;
    address: string;
    id_card_number: string;
}

export default function CreateMember() {
    const router = useRouter();
    const createMutation = useCreateMember();
    const { currentBranch, branchId } = useBranch();

    // State untuk menampung file avatar dan preview URL
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<CreateMemberFormData>({
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            emergency_contact: "",
            gender: "",
            date_of_birth: "",
            address: "",
            id_card_number: "",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (formData: CreateMemberFormData) => {
        try {
            // Karena kita punya file upload (Avatar), kita WAJIB menggunakan FormData asli JS,
            // bukan JSON object biasa agar terbaca oleh backend Laravel.
            const payload = new FormData();

            payload.append("name", formData.name);

            if (formData.email) payload.append("email", formData.email);
            if (formData.phone) payload.append("phone", formData.phone);
            if (formData.emergency_contact) payload.append("emergency_contact", formData.emergency_contact);
            if (formData.gender) payload.append("gender", formData.gender);
            if (formData.date_of_birth) payload.append("date_of_birth", formData.date_of_birth);
            if (formData.address) payload.append("address", formData.address);
            if (formData.id_card_number) payload.append("id_card_number", formData.id_card_number);

            // Assign home_branch_id dari context aktif staff
            if (branchId) {
                payload.append("home_branch_id", branchId);
            }

            // Append file avatar jika ada
            if (avatarFile) {
                payload.append("avatar", avatarFile);
            }

            // Kirim FormData ke React Query mutation
            const newMember = await createMutation.mutateAsync(payload);

            toast.success("Member profile created successfully");

            // Redirect ke halaman detail agar staff bisa melanjutkan proses Assign Membership (Langkah 2)
            router.push(`/members/${newMember.id}?success=true`);
        } catch (err) {
            toast.error("Failed to create member");
            console.error(err);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li>
                                <Link href="/members">Members</Link>
                            </li>
                            <li className="text-aksen-secondary">Create new</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <button type="button" onClick={() => router.push("/members")}>
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-semibold">Create Member</h1>
                                {currentBranch && (
                                    <p className="text-sm text-zinc-500">
                                        Home Branch: <span className="font-medium text-zinc-700">{currentBranch.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary text-white px-5 py-2.5 disabled:opacity-50">
                            {createMutation.isPending ? "Saving..." : "Save Profile"}
                        </CustomButton>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="flex flex-col md:flex-row gap-8 mt-6">
                        {/* LEFT COLUMN: AVATAR UPLOAD */}
                        <div className="flex flex-col items-center gap-3 w-full md:w-1/4">
                            <div className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden bg-zinc-50 relative group">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-zinc-400 flex flex-col items-center">
                                        <Icon name="archive" className="h-8 w-8 mb-1 opacity-50" />
                                        <span className="text-xs">No Photo</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                                    <span className="text-white text-xs font-medium">Upload</span>
                                    <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-zinc-400 text-center">
                                Allowed formats: JPG, PNG. <br /> Max size: 2MB.
                            </p>
                        </div>

                        {/* RIGHT COLUMN: IDENTITY FORM */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-6">
                                    <TextInput name="name" label="Full Name *" placeholder="e.g John Doe" />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <TextInput name="email" label="Email (optional)" placeholder="e.g member@email.com" />
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-4">
                                    <TextInput name="phone" label="Phone" placeholder="e.g 0812345678" />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <TextInput name="emergency_contact" label="Emergency Contact" placeholder="e.g 0812345678" />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <SearchableDropdown name="gender" label="Gender" options={genderOptions} />
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-4">
                                    <TextInput name="date_of_birth" label="Date of Birth" type="date" />
                                </div>
                                <div className="col-span-12 md:col-span-8">
                                    <TextInput name="id_card_number" label="ID Card Number (KTP)" placeholder="e.g 3201..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12">
                                    <TextInput name="address" label="Address (optional)" placeholder="Full address" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
