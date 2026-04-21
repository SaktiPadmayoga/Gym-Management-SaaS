"use client";

import { useState, useMemo, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster as SonnerToaster } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";

import { useCreateFacilityBooking } from "@/hooks/tenant/useFacilityBookings";
import { useMembers } from "@/hooks/tenant/useMembers";
import { useFacilities } from "@/hooks/tenant/useFacilities";

export default function CreateFacilityBooking() {
    const router = useRouter();
    const createMutation = useCreateFacilityBooking();
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "midtrans">("cash");

    const { data: membersResponse, isLoading: loadingMembers } = useMembers({ per_page: 100, is_active: true });
    const { data: facilitiesResponse, isLoading: loadingFacilities } = useFacilities({ per_page: 100, is_active: true });

    const memberOptions: DropdownOption<string>[] = useMemo(() => {
        const raw = membersResponse ?? [];
        const members = Array.isArray(raw) ? raw : [];
        return members.map((m: any) => ({
            key: m.id,
            label: `${m.name} (${m.phone || m.email || "No Data"})`,
            value: m.id,
        }));
    }, [membersResponse]);

    const facilityOptions: DropdownOption<string>[] = useMemo(() => {
        const raw = facilitiesResponse ?? [];
        const facilities = Array.isArray(raw) ? raw : [];
        return facilities.map((f: any) => ({
            key: f.id,
            label: `${f.name} - Rp ${Number(f.price || 0).toLocaleString('id-ID')}`,
            value: f.id,
        }));
    }, [facilitiesResponse]);

    const form = useForm({
        defaultValues: { facility_id: "", member_id: "", date: "", start_time: "", notes: "" },
    });

    const selectedFacilityId = form.watch("facility_id");
    const selectedFacility = useMemo(() => {
        const raw = facilitiesResponse ?? [];
        const facilities = Array.isArray(raw) ? raw : [];
        return facilities.find((f: any) => f.id === selectedFacilityId);
    }, [selectedFacilityId, facilitiesResponse]);

    const isFree = selectedFacility ? Number(selectedFacility.price) === 0 : true;

    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
        if (!document.querySelector(`script[src="${snapScript}"]`)) {
            const script = document.createElement("script");
            script.src = snapScript;
            script.setAttribute("data-client-key", clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const onSubmit = (data: any) => {
        if (!data.facility_id) return toast.error("Pilih Fasilitas");
        if (!data.member_id) return toast.error("Pilih Member");
        if (!data.date || !data.start_time) return toast.error("Isi Tanggal & Jam Mulai");

        createMutation.mutate(
            { ...data, payment_method: paymentMethod },
            {
                onSuccess: (res: any) => {
                    if (paymentMethod === "midtrans" && res.snap_token) {
                        (window as any).snap.pay(res.snap_token, {
                            onSuccess: () => {
                                toast.success("Pembayaran Berhasil!");
                                router.push("/facility-bookings?success=true");
                            },
                            onPending: () => {
                                toast.info("Menunggu pembayaran member.");
                                router.push("/facility-bookings?success=true");
                            },
                            onError: () => toast.error("Pembayaran Gagal."),
                            onClose: () => {
                                toast.warning("Popup ditutup. Pembayaran berstatus Pending.");
                                router.push("/facility-bookings?success=true");
                            }
                        });
                    } else {
                        toast.success("Fasilitas berhasil di-booking.");
                        router.push("/facility-bookings?success=true");
                    }
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Gagal melakukan booking.");
                }
            }
        );
    };

    return (
        <FormProvider {...form}>
            <SonnerToaster position="top-center" />
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4 border-zinc-200 shadow-sm min-h-[500px]">
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li><Link href="/facility-bookings" className="hover:text-zinc-600">Booking Fasilitas</Link></li>
                            <li className="text-aksen-secondary font-medium">Point of Sales (POS)</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-zinc-800">
                            <button type="button" onClick={() => router.push("/facility-bookings")} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <Icon name="back" className="h-6 w-6 text-zinc-600" />
                            </button>
                            <h1 className="text-2xl font-bold tracking-tight">Booking Baru (POS)</h1>
                        </div>

                        <CustomButton type="submit" disabled={createMutation.isPending} className="bg-aksen-secondary hover:bg-teal-700 text-white px-5 py-2.5 font-semibold transition-colors disabled:opacity-50">
                            {createMutation.isPending ? "Memproses..." : (isFree ? "Konfirmasi Booking" : "Proses & Bayar")}
                        </CustomButton>
                    </div>

                    <hr className="border-zinc-100 mb-8" />

                    <div className="flex flex-col gap-6 max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <SearchableDropdown name="member_id" label="1. Pilih Member *" options={memberOptions} placeholder={loadingMembers ? "Memuat..." : "Ketik nama member..."} />
                            <SearchableDropdown name="facility_id" label="2. Pilih Fasilitas *" options={facilityOptions} placeholder={loadingFacilities ? "Memuat..." : "Pilih fasilitas gym..."} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                            <TextInput type="date" name="date" label="Tanggal Sewa *" />
                            <TextInput type="time" name="start_time" label="Jam Mulai *" />
                        </div>

                        <TextInput name="notes" label="Catatan Tambahan (Opsional)" />

                        {selectedFacility && !isFree && (
                            <div className="p-5 border border-amber-200 bg-amber-50 rounded-xl mt-2">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-bold text-amber-900">3. Metode Pembayaran</p>
                                    <p className="text-amber-700 text-sm font-medium">Total: <span className="text-lg font-bold">Rp {Number(selectedFacility.price).toLocaleString('id-ID')}</span></p>
                                </div>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-800">
                                        <input type="radio" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} className="w-4 h-4 text-aksen-secondary accent-aksen-secondary" />
                                        Tunai (Kasir)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-800">
                                        <input type="radio" value="midtrans" checked={paymentMethod === "midtrans"} onChange={() => setPaymentMethod("midtrans")} className="w-4 h-4 text-aksen-secondary accent-aksen-secondary" />
                                        Midtrans (Online/QRIS)
                                    </label>
                                </div>
                            </div>
                        )}
                        {selectedFacility && isFree && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium mt-2">
                                ✅ Fasilitas ini Gratis. Tidak perlu pembayaran.
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}