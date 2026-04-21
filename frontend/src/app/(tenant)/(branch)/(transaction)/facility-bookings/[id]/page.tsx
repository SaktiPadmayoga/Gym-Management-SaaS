"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import { TextInput } from "@/components/ui/input/Input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster as SonnerToaster } from "sonner";

import { useFacilityBooking, useUpdateFacilityBooking } from "@/hooks/tenant/useFacilityBookings";

const statusOptions: DropdownOption<string>[] = [
    { key: "booked", label: "Booked", value: "booked" },
    { key: "completed", label: "Completed (Selesai)", value: "completed" },
    { key: "cancelled", label: "Cancelled (Batal)", value: "cancelled" },
    { key: "no_show", label: "No Show (Tidak Hadir)", value: "no_show" },
];

export default function DetailEditFacilityBooking() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const { data: bookingData, isLoading, isError } = useFacilityBooking(id);
    const updateMutation = useUpdateFacilityBooking();

    const form = useForm({
        mode: "onChange",
        defaultValues: { facility_id: "", member_id: "", date: "", start_time: "", status: "booked", notes: "" },
    });

    useEffect(() => {
        if (bookingData) {
            form.reset({
                facility_id: bookingData.facility?.name || "", 
                member_id: bookingData.member?.name || "",    
                date: bookingData.date || "",
                start_time: bookingData.start_time?.slice(0, 5) || "",
                status: bookingData.status || "booked",
                notes: bookingData.notes || "",
            });
        }
    }, [bookingData, form]);

    const onSubmit = (data: any) => {
        if (!data.date || !data.start_time) return toast.error("Tanggal dan Jam wajib diisi");

        // Hanya payload ini yang diizinkan update oleh backend
        const payload = {
            date: data.date,
            start_time: data.start_time,
            status: data.status,
            notes: data.notes,
        };

        updateMutation.mutate({ id, payload }, {
            onSuccess: () => {
                toast.success("Data booking berhasil diperbarui");
                router.push("/facility-bookings");
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Gagal memperbarui booking");
            }
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><p className="text-zinc-500 animate-pulse">Memuat data...</p></div>;
    }

    if (isError || !bookingData) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <p className="text-red-500 font-medium">Data booking tidak ditemukan.</p>
                <CustomButton onClick={() => router.push("/facility-bookings")}>Kembali</CustomButton>
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <SonnerToaster position="top-center" />
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="font-figtree rounded-xl bg-white border px-6 py-4 border-zinc-200 shadow-sm min-h-[500px]">
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li><Link href="/facility-bookings" className="hover:text-zinc-600">Booking Fasilitas</Link></li>
                            <li className="text-aksen-secondary font-medium">Detail & Edit</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-zinc-800">
                            <button type="button" onClick={() => router.push("/facility-bookings")} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <Icon name="back" className="h-6 w-6 text-zinc-600" />
                            </button>
                            <h1 className="text-2xl font-bold tracking-tight">Detail Booking</h1>
                        </div>

                        <CustomButton type="submit" disabled={updateMutation.isPending} className="bg-aksen-secondary hover:bg-teal-700 text-white px-5 py-2.5 font-semibold transition-colors disabled:opacity-50">
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </CustomButton>
                    </div>

                    <hr className="border-zinc-100 mb-8" />

                    {/* Banner Pembayaran (Read Only Info) */}
                    <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6 max-w-4xl">
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase mb-1">Status Pembayaran</p>
                            <p className={`text-sm font-bold uppercase ${bookingData.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {bookingData.payment_status}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 font-medium uppercase mb-1">Invoice ID</p>
                            <p className="text-sm font-semibold text-zinc-700">{bookingData.invoice?.invoice_number || "Tidak ada (Gratis)"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 max-w-4xl">
                        {/* Member & Fasilitas READ ONLY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-70 pointer-events-none">
                            <TextInput name="facility_id" label="Fasilitas (Tidak dapat diubah)" />
                            <TextInput name="member_id" label="Member (Tidak dapat diubah)" />
                        </div>

                        {/* Waktu & Status EDITABLE */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                            <TextInput type="date" name="date" label="Tanggal *" />
                            <TextInput type="time" name="start_time" label="Jam Mulai *" />
                            <SearchableDropdown name="status" label="Status Kehadiran *" options={statusOptions} />
                        </div>

                        <TextInput name="notes" label="Catatan Tambahan" />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}