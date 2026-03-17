"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useBranch } from "@/providers/BranchProvider";
import {
    useMember,
    useUpdateMember,
    useUpdateMembership,
    useRevokeMemberBranch,
} from "@/hooks/tenant/useMembers";
import { MemberUpdateRequest, UpdateMembershipRequest, MemberBranchData } from "@/types/tenant/members";

/* =========================
 * OPTIONS
 * ========================= */

const genderOptions: DropdownOption<string>[] = [
    { key: "male",   label: "Male",   value: "male"   },
    { key: "female", label: "Female", value: "female" },
];

const memberStatusOptions: DropdownOption<string>[] = [
    { key: "active",   label: "Active",   value: "active"   },
    { key: "inactive", label: "Inactive", value: "inactive" },
    { key: "frozen",   label: "Frozen",   value: "frozen"   },
    { key: "banned",   label: "Banned",   value: "banned"   },
];

const membershipStatusOptions: DropdownOption<string>[] = [
    { key: "active",    label: "Active",    value: "active"    },
    { key: "inactive",  label: "Inactive",  value: "inactive"  },
    { key: "frozen",    label: "Frozen",    value: "frozen"    },
    { key: "cancelled", label: "Cancelled", value: "cancelled" },
];

const memberStatusColor: Record<string, string> = {
    active:   "bg-green-100 text-green-700",
    inactive: "bg-zinc-100 text-zinc-500",
    expired:  "bg-orange-100 text-orange-700",
    frozen:   "bg-blue-100 text-blue-700",
    banned:   "bg-red-100 text-red-700",
};

/* =========================
 * FORM SHAPE
 * ========================= */

interface MemberFormData {
    name:               string;
    email:              string;
    phone:              string;
    emergency_contact:  string;
    gender:             string;
    date_of_birth:      string;
    address:            string;
    id_card_number:     string;
    status:             string;
    is_active:          boolean;
}

interface MembershipFormData {
    status:       string;
    expires_at:   string;
    frozen_until: string;
    notes:        string;
}

export default function MemberDetail() {
    const router = useRouter();
    const params = useParams();
    const id     = params.id as string;

    const [isEditMode,        setIsEditMode]        = useState(false);
    const [isMembershipEdit,  setIsMembershipEdit]  = useState(false);

    const { branchId } = useBranch();
    const { data: member, isLoading, isError } = useMember(id);
    const updateMutation      = useUpdateMember();
    const membershipMutation  = useUpdateMembership();
    const revokeMutation      = useRevokeMemberBranch();

    const form = useForm<MemberFormData>({ mode: "onChange" });
    const membershipForm = useForm<MembershipFormData>({ mode: "onChange" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!member) return;
        form.reset({
            name:               member.name,
            email:              member.email              ?? "",
            phone:              member.phone              ?? "",
            emergency_contact:  member.emergency_contact  ?? "",
            gender:             member.gender             ?? "",
            date_of_birth:      member.date_of_birth      ?? "",
            address:            member.address            ?? "",
            id_card_number:     member.id_card_number     ?? "",
            status:             member.status,
            is_active:          member.is_active,
        });

        const mb = member.current_membership ?? member.branches?.[0];
        if (mb) {
            membershipForm.reset({
                status:       mb.status,
                expires_at:   mb.expires_at   ?? "",
                frozen_until: mb.frozen_until ?? "",
                notes:        mb.notes        ?? "",
            });
        }
    }, [member]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError)   return notFound();

    const currentMembership: MemberBranchData | null =
        member?.current_membership ?? member?.branches?.[0] ?? null;

    /* =========================
     * SAVE PROFILE
     * ========================= */
    const handleSave = async () => {
        try {
            const formData = form.getValues();
            const payload: MemberUpdateRequest = {
                name:               formData.name,
                email:              formData.email             || undefined,
                phone:              formData.phone             || undefined,
                emergency_contact:  formData.emergency_contact || undefined,
                gender:             (formData.gender as any)  || undefined,
                date_of_birth:      formData.date_of_birth     || undefined,
                address:            formData.address           || undefined,
                id_card_number:     formData.id_card_number    || undefined,
                status:             formData.status as any,
                is_active:          formData.is_active,
            };

            await updateMutation.mutateAsync({ id, payload });
            toast.success("Member updated successfully");
            setIsEditMode(false);
        } catch {
            toast.error("Failed to update member");
        }
    };

    /* =========================
     * SAVE MEMBERSHIP
     * ========================= */
    const handleSaveMembership = async () => {
        if (!branchId || !currentMembership) return;
        try {
            const formData = membershipForm.getValues();
            const payload: UpdateMembershipRequest = {
                status:       formData.status as any,
                expires_at:   formData.expires_at   || undefined,
                frozen_until: formData.frozen_until || undefined,
                notes:        formData.notes        || undefined,
            };

            await membershipMutation.mutateAsync({ memberId: id, branchId, payload });
            toast.success("Membership updated");
            setIsMembershipEdit(false);
        } catch {
            toast.error("Failed to update membership");
        }
    };

    const handleRevoke = () => {
        if (!branchId || !currentMembership) return;
        if (!confirm("Revoke this member's access from this branch?")) return;
        revokeMutation.mutate(
            { memberId: id, branchId },
            {
                onSuccess: () => toast.success("Membership revoked"),
                onError:   () => toast.error("Failed to revoke membership"),
            }
        );
    };

    return (
        <FormProvider {...form}>
            <Toaster position="top-center" />
            <form>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4">

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li><Link href="/members">Members</Link></li>
                            <li className="text-aksen-secondary">{member?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-800">
                            <Link href="/members">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                            <div className="flex items-center gap-3">
                                {member?.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-base">
                                        {member?.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-semibold">{member?.name}</h1>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${memberStatusColor[member?.status ?? "inactive"]}`}>
                                            {member?.status}
                                        </span>
                                        {currentMembership?.member_code && (
                                            <span className="text-xs text-zinc-400">{currentMembership.member_code}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                                <CustomButton type="button" className="border px-4 py-2.5" onClick={() => setIsEditMode(false)}>
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

                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <TextInput name="name"  label="Full Name"  disabled={!isEditMode} />
                            </div>
                            <div className="col-span-6">
                                <TextInput name="email" label="Email"       disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="phone" label="Phone" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="emergency_contact" label="Emergency Contact" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="gender" label="Gender" options={genderOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                                <TextInput name="date_of_birth"  label="Date of Birth"    type="date" disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <TextInput name="id_card_number" label="ID Card (KTP)"    disabled={!isEditMode} />
                            </div>
                            <div className="col-span-4">
                                <SearchableDropdown name="status" label="Status" options={memberStatusOptions} disabled={!isEditMode} />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12">
                                <TextInput name="address" label="Address" disabled={!isEditMode} />
                            </div>
                        </div>

                        <hr />

                        {/* STATUS */}
                        <h2 className="text-lg font-semibold text-gray-800">Account</h2>
                        <div className="flex gap-10 text-gray-800">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" {...form.register("is_active")} disabled={!isEditMode} />
                                <span>Active Account</span>
                            </label>
                        </div>

                        <hr />

                        {/* MEMBERSHIP */}
                        {currentMembership && (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Membership</h2>
                                        <p className="text-sm text-zinc-500">Current branch membership details</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isMembershipEdit ? (
                                            <CustomButton
                                                type="button"
                                                className="border text-zinc-700 px-3 py-2 text-sm"
                                                onClick={() => setIsMembershipEdit(true)}
                                            >
                                                Edit Membership
                                            </CustomButton>
                                        ) : (
                                            <>
                                                <CustomButton type="button" className="border px-3 py-2 text-sm" onClick={() => setIsMembershipEdit(false)}>
                                                    Cancel
                                                </CustomButton>
                                                <CustomButton
                                                    type="button"
                                                    className="bg-aksen-secondary text-white px-3 py-2 text-sm"
                                                    onClick={handleSaveMembership}
                                                    disabled={membershipMutation.isPending}
                                                >
                                                    {membershipMutation.isPending ? "Saving..." : "Save"}
                                                </CustomButton>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRevoke}
                                            className="text-xs text-red-500 hover:text-red-700 hover:underline px-2"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>

                                <FormProvider {...membershipForm}>
                                    <div className="rounded-lg border border-zinc-200 p-4 space-y-4">
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-4">
                                                <SearchableDropdown
                                                    name="status"
                                                    label="Membership Status"
                                                    options={membershipStatusOptions}
                                                    disabled={!isMembershipEdit}
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <TextInput name="expires_at"   label="Expiry Date"   type="date" disabled={!isMembershipEdit} />
                                            </div>
                                            <div className="col-span-4">
                                                <TextInput name="frozen_until" label="Frozen Until"  type="date" disabled={!isMembershipEdit} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12">
                                                <TextInput name="notes" label="Notes (optional)" disabled={!isMembershipEdit} />
                                            </div>
                                        </div>

                                        {/* Read-only info */}
                                        <div className="flex gap-6 pt-2 text-sm text-zinc-500 border-t border-zinc-100">
                                            <span>Member Code: <span className="font-medium text-zinc-700">{currentMembership.member_code ?? "-"}</span></span>
                                            <span>Joined: <span className="font-medium text-zinc-700">{currentMembership.joined_at ? new Date(currentMembership.joined_at).toLocaleDateString() : "-"}</span></span>
                                            <span>Freeze Days Used: <span className="font-medium text-zinc-700">{currentMembership.freeze_days_used}</span></span>
                                        </div>
                                    </div>
                                </FormProvider>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}