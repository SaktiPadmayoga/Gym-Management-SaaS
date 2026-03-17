"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import { useCreateMember } from "@/hooks/tenant/useMembers";
import { MemberCreateRequest } from "@/types/tenant/members";

/* =========================
 * OPTIONS
 * ========================= */

const genderOptions: DropdownOption<string>[] = [
    { key: "male",   label: "Male",   value: "male"   },
    { key: "female", label: "Female", value: "female" },
];

/* =========================
 * FORM TYPE
 * ========================= */

interface CreateMemberFormData {
    name:               string;
    email:              string;
    phone:              string;
    emergency_contact:  string;
    gender:             "male" | "female" | "";
    date_of_birth:      string;
    address:            string;
    id_card_number:     string;
    // membership
    started_at:         string;
    expires_at:         string;
    member_code:        string;
}

export default function CreateMember() {
    const router         = useRouter();
    const createMutation = useCreateMember();
    const { currentBranch, branchId } = useBranch();

    const form = useForm<CreateMemberFormData>({
        mode: "onChange",
        defaultValues: {
            name:              "",
            email:             "",
            phone:             "",
            emergency_contact: "",
            gender:            "",
            date_of_birth:     "",
            address:           "",
            id_card_number:    "",
            started_at:        "",
            expires_at:        "",
            member_code:       "",
        },
    });

    const onSubmit = async (formData: CreateMemberFormData) => {
        try {
            const payload: MemberCreateRequest = {
                name:               formData.name,
                email:              formData.email   || undefined,
                phone:              formData.phone   || undefined,
                emergency_contact:  formData.emergency_contact || undefined,
                gender:             (formData.gender as any) || undefined,
                date_of_birth:      formData.date_of_birth   || undefined,
                address:            formData.address          || undefined,
                id_card_number:     formData.id_card_number   || undefined,
                // membership — branch otomatis dari context
                ...(branchId ? {
                    branch_id:   branchId,
                    started_at:  formData.started_at  || undefined,
                    expires_at:  formData.expires_at  || undefined,
                    member_code: formData.member_code || undefined,
                    is_primary:  true,
                } : {}),
            };

            await createMutation.mutateAsync(payload);
            toast.success("Member created successfully");
            router.push("/members?success=true");
        } catch (err) {
            toast.error("Failed to create member");
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
                            <li>Management</li>
                            <li><Link href="/members">Members</Link></li>
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
                                        Branch: <span className="font-medium text-zinc-700">{currentBranch.name}</span>
                                    </p>
                                )}
                            </div>
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

                        {/* IDENTITY */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name" label="Full Name" placeholder="e.g John Doe" />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email (optional)" placeholder="e.g member@email.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="phone" label="Phone" placeholder="e.g +62812345678" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="emergency_contact" label="Emergency Contact" placeholder="e.g +62812345678" />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="gender" label="Gender" options={genderOptions} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="date_of_birth" label="Date of Birth" type="date" />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="id_card_number" label="ID Card Number (KTP)" placeholder="e.g 3201..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12">
                                <TextInput name="address" label="Address (optional)" placeholder="Full address" />
                            </div>
                        </div>

                        {/* MEMBERSHIP */}
                        {branchId && (
                            <>
                                <hr />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-1">Membership</h2>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Membership will be assigned to{" "}
                                        <span className="font-medium text-zinc-700">{currentBranch?.name}</span> automatically.
                                    </p>
                                </div>

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-4">
                                        <TextInput name="started_at" label="Start Date" type="date" />
                                    </div>
                                    <div className="col-span-4">
                                        <TextInput name="expires_at" label="Expiry Date" type="date" />
                                    </div>
                                    <div className="col-span-4">
                                        <TextInput
                                            name="member_code"
                                            label="Member Code (optional)"
                                            placeholder="Auto-generated if empty"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}