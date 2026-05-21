"use client";

import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { useMember, useUpdateMember, useUpdateMembership, useCancelMembership, useFreezeMembership, useUnfreezeMembership } from "@/hooks/tenant/useMembers";
import { UpdateMembershipRequest, MembershipData } from "@/types/tenant/members";
import AssignMembershipModal from "@/components/pages/tenant/master-data/member/AssignMembershipModal";

/* =========================
 * OPTIONS
 * ========================= */

const genderOptions: DropdownOption<string>[] = [
    { key: "male", label: "Male", value: "male" },
    { key: "female", label: "Female", value: "female" },
    { key: "other", label: "Other", value: "other" },
];

const memberStatusOptions: DropdownOption<string>[] = [
    { key: "active", label: "Active", value: "active" },
    { key: "inactive", label: "Inactive", value: "inactive" },
    { key: "frozen", label: "Frozen", value: "frozen" },
    { key: "banned", label: "Banned", value: "banned" },
];

const membershipStatusOptions: DropdownOption<string>[] = [
    { key: "active", label: "Active", value: "active" },
    { key: "expired", label: "Expired", value: "expired" },
    { key: "frozen", label: "Frozen", value: "frozen" },
    { key: "cancelled", label: "Cancelled", value: "cancelled" },
];

const memberStatusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-zinc-100 text-zinc-500",
    expired: "bg-orange-100 text-orange-700",
    frozen: "bg-blue-100 text-blue-700",
    banned: "bg-red-100 text-red-700",
};

/* =========================
 * FORM SHAPE
 * ========================= */

interface MemberFormData {
    name: string;
    email: string;
    phone: string;
    emergency_contact: string;
    gender: string;
    date_of_birth: string;
    address: string;
    id_card_number: string;
    status: string;
    is_active: boolean;
}

interface MembershipFormData {
    status: string;
    end_date: string;
    frozen_until: string;
    notes: string;
}

export default function MemberDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditMode, setIsEditMode] = useState(false);
    const [isMembershipEdit, setIsMembershipEdit] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

    // State untuk Avatar
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: member, isLoading, isError } = useMember(id);
    const updateMutation = useUpdateMember();
    const membershipMutation = useUpdateMembership();
    const cancelMutation = useCancelMembership();
    const freezeMutation = useFreezeMembership();
    const unfreezeMutation = useUnfreezeMembership();

    const form = useForm<MemberFormData>({ mode: "onChange" });
    const membershipForm = useForm<MembershipFormData>({ mode: "onChange" });

    /* =========================
     * POPULATE FORM
     * ========================= */
    useEffect(() => {
        if (!member) return;

        form.reset({
            name: member.name,
            email: member.email ?? "",
            phone: member.phone ?? "",
            emergency_contact: member.emergency_contact ?? "",
            gender: member.gender ?? "",
            date_of_birth: member.date_of_birth ?? "",
            address: member.address ?? "",
            id_card_number: member.id_card_number ?? "",
            status: member.status,
            is_active: member.is_active,
        });

        // Set preview avatar jika ada
        if (member.avatar_url && !avatarFile) {
            setPreviewUrl(member.avatar_url);
        }

        // Cari membership aktif/frozen atau ambil yang terakhir
        const mb = member.memberships?.find((m) => m.status === "active") ?? member.memberships?.find((m) => m.status === "frozen") ?? member.memberships?.[0];

        if (mb) {
            membershipForm.reset({
                status: mb.status,
                end_date: mb.end_date ?? "",
                frozen_until: mb.frozen_until ?? "",
                notes: mb.notes ?? "",
            });
        }
    }, [member]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError) return notFound();

    const currentMembership: MembershipData | null =
        member?.memberships?.find((m) => m.status === "active") ??
        member?.memberships?.find((m) => m.status === "frozen") ??
        member?.memberships?.[0] ?? null;

    /* =========================
     * AVATAR HANDLER
     * ========================= */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    /* =========================
     * SAVE PROFILE
     * ========================= */
    const handleSave = async () => {
        try {
            const formData = form.getValues();
            const payload = new FormData();
            payload.append("name", formData.name);
            if (formData.email) payload.append("email", formData.email);
            if (formData.phone) payload.append("phone", formData.phone);
            if (formData.emergency_contact) payload.append("emergency_contact", formData.emergency_contact);
            if (formData.gender) payload.append("gender", formData.gender);
            if (formData.date_of_birth) payload.append("date_of_birth", formData.date_of_birth);
            if (formData.address) payload.append("address", formData.address);
            if (formData.id_card_number) payload.append("id_card_number", formData.id_card_number);
            payload.append("status", formData.status);
            payload.append("is_active", formData.is_active ? "1" : "0");
            if (avatarFile) payload.append("avatar", avatarFile);

            await updateMutation.mutateAsync({ id, payload });
            toast.success("Member profile updated successfully");
            setIsEditMode(false);
            setAvatarFile(null);
        } catch {
            toast.error("Failed to update member profile");
        }
    };

    /* =========================
     * SAVE MEMBERSHIP
     * ========================= */
    const handleSaveMembership = async () => {
        if (!currentMembership) return;
        try {
            const formData = membershipForm.getValues();
            const payload: UpdateMembershipRequest = {
                status: formData.status as "active" | "expired" | "frozen" | "cancelled",
                end_date: formData.end_date || undefined,
                frozen_until: formData.frozen_until || undefined,
                notes: formData.notes || undefined,
            };

            await membershipMutation.mutateAsync({
                memberId: id,
                membershipId: currentMembership.id,
                payload,
            });
            toast.success("Membership updated");
            setIsMembershipEdit(false);
        } catch {
            toast.error("Failed to update membership");
        }
    };

    /* =========================
     * CANCEL MEMBERSHIP
     * ========================= */
    const handleCancelMembership = () => {
        if (!currentMembership) return;
        if (!confirm("Are you sure you want to cancel and delete this membership record?")) return;

        cancelMutation.mutate(
            { memberId: id, membershipId: currentMembership.id },
            {
                onSuccess: () => toast.success("Membership cancelled successfully"),
                onError: () => toast.error("Failed to cancel membership"),
            },
        );
    };

    /* =========================
     * UNFREEZE
     * ========================= */
    const handleUnfreeze = () => {
        if (!currentMembership) return;
        if (!confirm("Unfreeze membership ini? Tanggal berakhir akan otomatis diperpanjang sesuai hari freeze.")) return;

        unfreezeMutation.mutate(
            { memberId: id, membershipId: currentMembership.id },
            {
                onSuccess: () => toast.success("Membership berhasil di-unfreeze. End date diperpanjang."),
                onError: (err: any) => toast.error(err?.response?.data?.message ?? "Gagal unfreeze membership"),
            },
        );
    };

    return (
        <>
        <FormProvider {...form}>
            <Toaster position="top-center" />
            <form>
                <div className="font-figtree rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li>
                                <Link href="/members">Members</Link>
                            </li>
                            <li className="text-aksen-secondary">{member?.name ?? id}</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-gray-800">
                            <Link href="/members">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>

                            {/* Avatar Section */}
                            <div className="relative group cursor-pointer" onClick={() => isEditMode && fileInputRef.current?.click()}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt={member?.name} className="w-14 h-14 rounded-full object-cover border border-zinc-200" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xl border border-zinc-200">{member?.name.charAt(0).toUpperCase()}</div>
                                )}
                                {isEditMode && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icon name="archive" className="text-white w-5 h-5" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold">{member?.name}</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${memberStatusColor[member?.status ?? "inactive"]}`}>{member?.status}</span>
                                    {member?.home_branch && <span className="text-xs text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded-full">Home: {member.home_branch.name}</span>}
                                </div>
                            </div>
                        </div>

                        {!isEditMode ? (
                            <CustomButton type="button" iconName="edit" className="bg-aksen-secondary text-white px-5 py-2.5" onClick={() => setIsEditMode(true)}>
                                Edit Profile
                            </CustomButton>
                        ) : (
                            <div className="flex gap-2">
                                <CustomButton type="button" className="border px-4 py-2.5" onClick={() => { setIsEditMode(false); setAvatarFile(null); setPreviewUrl(member?.avatar_url ?? null); }}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="button" className="bg-aksen-secondary text-white px-5 py-2.5" onClick={handleSave} disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    <div className="flex flex-col gap-6 mt-6">
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-6"><TextInput name="name" label="Full Name" disabled={!isEditMode} /></div>
                            <div className="col-span-12 md:col-span-6"><TextInput name="email" label="Email" disabled={!isEditMode} /></div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4"><TextInput name="phone" label="Phone" disabled={!isEditMode} /></div>
                            <div className="col-span-12 md:col-span-4"><TextInput name="emergency_contact" label="Emergency Contact" disabled={!isEditMode} /></div>
                            <div className="col-span-12 md:col-span-4"><SearchableDropdown name="gender" label="Gender" options={genderOptions} disabled={!isEditMode} /></div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4"><TextInput name="date_of_birth" label="Date of Birth" type="date" disabled={!isEditMode} /></div>
                            <div className="col-span-12 md:col-span-4"><TextInput name="id_card_number" label="ID Card (KTP)" disabled={!isEditMode} /></div>
                            <div className="col-span-12 md:col-span-4"><SearchableDropdown name="status" label="Member Status" options={memberStatusOptions} disabled={!isEditMode} /></div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12"><TextInput name="address" label="Address" disabled={!isEditMode} /></div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* ACCOUNT SETTINGS */}
                        <h2 className="text-lg font-semibold text-gray-800">Account Access</h2>
                        <div className="flex gap-10 text-gray-800">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" {...form.register("is_active")} disabled={!isEditMode} className="w-4 h-4 rounded text-aksen-secondary" />
                                <span className={!form.watch("is_active") ? "text-red-500 font-medium" : ""}>{form.watch("is_active") ? "Account is Active (Can Login)" : "Account Banned/Suspended"}</span>
                            </label>
                        </div>

                        <hr className="border-gray-100" />

                        {/* MEMBERSHIP SECTION */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Active Membership</h2>
                                <p className="text-sm text-zinc-500">Manage plan subscription and validity</p>
                            </div>
                            {!currentMembership && (
                                <CustomButton type="button" iconName="plus" className="bg-zinc-800 text-white px-4 py-2 text-sm" onClick={() => setIsAssignModalOpen(true)}>
                                    Assign Plan
                                </CustomButton>
                            )}
                        </div>

                        {currentMembership ? (
                            <FormProvider {...membershipForm}>
                                <div className="rounded-lg border border-zinc-200 p-5 space-y-5 bg-zinc-50/50">
                                    {/* Frozen Banner */}
                                    {currentMembership.status === "frozen" && (
                                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                                            <span className="text-2xl">❄️</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-blue-800 text-sm">Membership Sedang Di-Freeze</p>
                                                <p className="text-xs text-blue-600 mt-0.5">
                                                    Frozen sejak: {currentMembership.frozen_at ? new Date(currentMembership.frozen_at).toLocaleDateString("id-ID") : "-"}
                                                    {currentMembership.frozen_until && ` • Sampai: ${new Date(currentMembership.frozen_until).toLocaleDateString("id-ID")}`}
                                                </p>
                                                <p className="text-xs text-blue-500 mt-0.5">Total freeze digunakan: {currentMembership.freeze_days_used ?? 0} hari</p>
                                            </div>
                                            <button type="button" onClick={handleUnfreeze} disabled={unfreezeMutation.isPending} className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
                                                {unfreezeMutation.isPending ? "Processing..." : "Unfreeze Now"}
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-zinc-800 text-lg">{currentMembership.plan?.name ?? "Unknown Plan"}</h3>
                                            <p className="text-sm text-zinc-500">Valid from: {new Date(currentMembership.start_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {currentMembership.status === "active" && (
                                                <button type="button" onClick={() => setIsFreezeModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 transition shadow-sm">
                                                    ❄️ Freeze
                                                </button>
                                            )}
                                            {!isMembershipEdit ? (
                                                <CustomButton type="button" className="border bg-white text-zinc-700 px-3 py-2 text-sm shadow-sm" onClick={() => setIsMembershipEdit(true)}>Edit Plan Detail</CustomButton>
                                            ) : (
                                                <>
                                                    <CustomButton type="button" className="border bg-white px-3 py-2 text-sm" onClick={() => setIsMembershipEdit(false)}>Cancel</CustomButton>
                                                    <CustomButton type="button" className="bg-zinc-800 text-white px-4 py-2 text-sm" onClick={handleSaveMembership} disabled={membershipMutation.isPending}>
                                                        {membershipMutation.isPending ? "Saving..." : "Save Plan"}
                                                    </CustomButton>
                                                </>
                                            )}
                                            <button type="button" onClick={handleCancelMembership} className="text-sm text-red-500 font-medium hover:text-red-700 hover:underline px-2 ml-2">Cancel Plan</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-4 pt-2">
                                        <div className="col-span-12 md:col-span-4"><SearchableDropdown name="status" label="Plan Status" options={membershipStatusOptions} disabled={!isMembershipEdit} /></div>
                                        <div className="col-span-12 md:col-span-4"><TextInput name="end_date" label="End Date" type="date" disabled={!isMembershipEdit} /></div>
                                        <div className="col-span-12 md:col-span-4"><TextInput name="frozen_until" label="Frozen Until" type="date" disabled={!isMembershipEdit} /></div>
                                    </div>
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12"><TextInput name="notes" label="Notes (optional)" disabled={!isMembershipEdit} /></div>
                                    </div>

                                    {/* Read-only Statistics */}
                                    <div className="flex gap-8 pt-4 text-sm border-t border-zinc-200">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-500 mb-0.5">Total Check-ins</span>
                                            <span className="font-semibold text-zinc-800">{currentMembership.total_checkins} times</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-zinc-500 mb-0.5">Remaining Quota</span>
                                            <span className="font-semibold text-zinc-800">{currentMembership.unlimited_checkin ? "Unlimited" : `${currentMembership.remaining_checkin_quota ?? 0} visits`}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-zinc-500 mb-0.5">Freeze Days Used</span>
                                            <span className="font-semibold text-zinc-800">{currentMembership.freeze_days_used ?? 0} days</span>
                                        </div>
                                    </div>
                                </div>
                            </FormProvider>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                                <p className="text-zinc-500 mb-1">No active membership found.</p>
                                <p className="text-sm text-zinc-400">Click the Assign Plan button to add a new subscription for this member.</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
        <AssignMembershipModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} memberId={id} />
        {isFreezeModalOpen && currentMembership && (
            <FreezeModal memberId={id} membershipId={currentMembership.id} freezeDaysUsed={currentMembership.freeze_days_used ?? 0} onClose={() => setIsFreezeModalOpen(false)} />
        )}
        </>
    );
}

/* =========================
 * FREEZE MODAL
 * ========================= */
function FreezeModal({ memberId, membershipId, freezeDaysUsed, onClose }: { memberId: string; membershipId: string; freezeDaysUsed: number; onClose: () => void }) {
    const [days, setDays] = useState(7);
    const [reason, setReason] = useState("");
    const freezeMutation = useFreezeMembership();

    const handleFreeze = () => {
        freezeMutation.mutate(
            { memberId, membershipId, payload: { days, reason: reason || undefined } },
            {
                onSuccess: () => { toast.success(`Membership berhasil di-freeze selama ${days} hari`); onClose(); },
                onError: (err: any) => { toast.error(err?.response?.data?.message ?? "Gagal freeze membership"); },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">❄️</span>
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-800">Freeze Membership</h3>
                        <p className="text-sm text-zinc-500">Membership akan dibekukan sementara</p>
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    <p>• Check-in akan diblokir selama masa freeze</p>
                    <p>• End date akan otomatis diperpanjang saat unfreeze</p>
                    <p>• Freeze sudah digunakan: <strong>{freezeDaysUsed} hari</strong></p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Durasi Freeze (hari)</label>
                        <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Alasan (opsional)</label>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Contoh: Sakit, perjalanan dinas, dll" rows={2} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition">Batal</button>
                    <button type="button" onClick={handleFreeze} disabled={freezeMutation.isPending || days < 1} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                        {freezeMutation.isPending ? "Processing..." : `Freeze ${days} Hari`}
                    </button>
                </div>
            </div>
        </div>
    );
}
