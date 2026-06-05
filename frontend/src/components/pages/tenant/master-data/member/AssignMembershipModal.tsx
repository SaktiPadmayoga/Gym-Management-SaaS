"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

import { useAssignMembership } from "@/hooks/tenant/useMembers";
import { membershipPlansAPI } from "@/lib/api/tenant/membershipPlans";
import { AssignMembershipRequest } from "@/types/tenant/members";

interface AssignMembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: string;
}

export default function AssignMembershipModal({ isOpen, onClose, memberId }: AssignMembershipModalProps) {
    const [planOptions, setPlanOptions] = useState<DropdownOption<string>[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);

    const assignMutation = useAssignMembership();

    const form = useForm<AssignMembershipRequest>({
        defaultValues: {
            plan_id: "",
            start_date: new Date().toISOString().split("T")[0], // Default hari ini
            end_date: "",
            notes: "",
        },
    });

    // Ambil master data Membership Plans saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            form.reset({
                plan_id: "",
                start_date: new Date().toISOString().split("T")[0],
                end_date: "",
                notes: "",
            });
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        setIsLoadingPlans(true);
        try {
            // Ambil hanya paket yang aktif
            const plans = await membershipPlansAPI.getAll({ is_active: true });
            const options = plans.map((plan) => ({
                key: plan.id,
                label: `${plan.name} - Rp ${Number(plan.price).toLocaleString("id-ID")}`,
                value: plan.id,
            }));
            setPlanOptions(options);
        } catch (error) {
            toast.error("Gagal memuat paket keanggotaan");
        } finally {
            setIsLoadingPlans(false);
        }
    };

    const onSubmit = async (data: AssignMembershipRequest) => {
        try {
            // End_date bersifat opsional karena backend bisa menghitung otomatis berdasarkan durasi plan
            const payload: AssignMembershipRequest = {
                plan_id: data.plan_id,
                start_date: data.start_date,
                end_date: data.end_date || undefined,
                notes: data.notes || undefined,
            };

            await assignMutation.mutateAsync({ memberId, payload });
            toast.success("Paket keanggotaan berhasil ditugaskan!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Gagal menugaskan keanggotaan");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Tugaskan Paket Baru</h2>
                        <p className="text-sm text-gray-500">Pilih paket keanggotaan untuk anggota ini</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                </div>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                        <div className="space-y-4">
                            <SearchableDropdown name="plan_id" label={isLoadingPlans ? "Memuat paket..." : "Pilih Paket Keanggotaan *"} options={planOptions} disabled={isLoadingPlans} />

                            <div className="grid grid-cols-2 gap-4">
                                <TextInput name="start_date" label="Tanggal Mulai *" type="date" />
                                <TextInput name="end_date" label="Tanggal Berakhir (Opsional)" type="date" placeholder="Dihitung otomatis jika kosong" />
                            </div>

                            <TextInput name="notes" label="Catatan Tambahan" placeholder="misal: Promo diskon pendaftaran" />
                        </div>

                        <div className="pt-4 mt-6 flex justify-end gap-2 border-t border-gray-100">
                            <CustomButton type="button" className="border bg-white text-gray-700 px-4 py-2" onClick={onClose}>
                                Batal
                            </CustomButton>
                            <CustomButton type="submit" className="bg-aksen-secondary text-white px-5 py-2" disabled={assignMutation.isPending || isLoadingPlans}>
                                {assignMutation.isPending ? "Menugaskan..." : "Tugaskan Paket"}
                            </CustomButton>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
