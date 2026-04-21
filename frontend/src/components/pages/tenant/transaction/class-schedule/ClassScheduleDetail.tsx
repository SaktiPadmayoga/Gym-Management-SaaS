"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, Toaster as SonnerToaster } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";
import CustomTable, { ActionItem, Column } from "@/components/ui/table/CustomTable";
import {
    useClassSchedule,
    useClassScheduleAttendances,
    useMarkAttended,
    useCancelAttendance,
    useAddAttendance,
    useCancelClassSchedule,
    useStaffBookClass, // <--- HOOK BARU YANG AKAN KITA BUAT
} from "@/hooks/tenant/useClassSchedules";
import { useMembers } from "@/hooks/tenant/useMembers";
import { ClassAttendanceData } from "@/types/tenant/class-schedules";

const attendanceStatusColor: Record<string, string> = {
    booked:    "bg-blue-100 text-blue-700",
    attended:  "bg-green-100 text-green-700",
    cancelled: "bg-zinc-100 text-zinc-500",
    no_show:   "bg-red-100 text-red-700",
};

const attendanceStatusLabel: Record<string, string> = {
    booked:    "Terdaftar",
    attended:  "Hadir",
    cancelled: "Dibatalkan",
    no_show:   "Tidak Hadir",
};

export default function ClassScheduleDetail() {
    const { id } = useParams<{ id: string }>();
    const router  = useRouter();

    const [showAddMember, setShowAddMember] = useState(false);
    const [searchMember, setSearchMember]   = useState("");
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "midtrans">("cash");

    const { data: schedule, isLoading } = useClassSchedule(id);
    const { data: attendances = [], isLoading: isLoadingAttendances, refetch: refetchAttendances } =
        useClassScheduleAttendances(id);

    const { data: membersData } = useMembers({ search: searchMember, per_page: 20 });
    const members = membersData ?? [];

    const markAttendedMutation   = useMarkAttended();
    const cancelAttendanceMutation = useCancelAttendance();
    const addAttendanceMutation  = useAddAttendance(); // Untuk kelas gratis
    const cancelScheduleMutation = useCancelClassSchedule();
    const staffBookClassMutation = useStaffBookClass(); // Untuk kelas berbayar

    // Load Midtrans Snap Script
    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"; // Ganti ke production jika live
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
        
        if (!document.querySelector(`script[src="${snapScript}"]`)) {
            const script = document.createElement("script");
            script.src = snapScript;
            script.setAttribute("data-client-key", clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    if (isLoading || !schedule) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600" />
            </div>
        );
    }

    const isCancelled = schedule.status === "cancelled";
    
    // Deteksi apakah kelas ini berbayar
    const classPrice = Number(schedule.price ?? schedule.class_plan?.price ?? 0);
    const isPaidClass = classPrice > 0;

    const handleRegisterMember = () => {
        if (!selectedMember) return;

        // ALUR KELAS BERBAYAR
        if (isPaidClass) {
            staffBookClassMutation.mutate(
                { scheduleId: id, memberId: selectedMember, paymentMethod },
                {
                    onSuccess: (res: any) => {
                        if (paymentMethod === "midtrans" && res.snap_token) {
                            // Buka Popup Midtrans
                            (window as any).snap.pay(res.snap_token, {
                                onSuccess: function (result: any) {
                                    toast.success("Pembayaran berhasil!");
                                    resetModal();
                                },
                                onPending: function (result: any) {
                                    toast.info("Menunggu pembayaran diselesaikan oleh member.");
                                    resetModal();
                                },
                                onError: function (result: any) {
                                    toast.error("Pembayaran gagal diproses.");
                                },
                                onClose: function () {
                                    toast.warning("Popup ditutup tanpa menyelesaikan pembayaran.");
                                    resetModal();
                                },
                            });
                        } else {
                            // Alur Cash
                            toast.success("Member berhasil didaftarkan (Pembayaran Tunai)");
                            resetModal();
                        }
                    },
                    onError: (err: any) => {
                        toast.error(err?.response?.data?.message ?? "Gagal memproses pendaftaran/pembayaran");
                    },
                }
            );
        } 
        // ALUR KELAS GRATIS
        else {
            addAttendanceMutation.mutate(
                { scheduleId: id, memberId: selectedMember },
                {
                    onSuccess: () => {
                        toast.success("Member berhasil didaftarkan");
                        resetModal();
                    },
                    onError: (err: any) => {
                        toast.error(err?.response?.data?.message ?? "Gagal mendaftarkan member");
                    },
                }
            );
        }
    };

    const resetModal = () => {
        setShowAddMember(false);
        setSelectedMember(null);
        setSearchMember("");
        setPaymentMethod("cash");
        refetchAttendances();
    };

    const columns: Column<ClassAttendanceData>[] = [
        {
            header: "Member",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm shrink-0">
                        {item.member?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className="font-medium text-zinc-800">{item.member?.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{item.member?.phone ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Waktu Booking",
            render: (item) => (
                <span className="text-sm text-zinc-600">
                    {item.booked_at
                        ? new Date(item.booked_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                </span>
            ),
            width: "w-32",
        },
        {
            header: "Hadir Pada",
            render: (item) => (
                <span className="text-sm text-zinc-600">
                    {item.attended_at
                        ? new Date(item.attended_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                </span>
            ),
            width: "w-32",
        },
        {
            header: "Di-check oleh",
            render: (item) => (
                <span className="text-sm text-zinc-500">
                    {item.checked_in_by?.name ?? "Self"}
                </span>
            ),
            width: "w-36",
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${attendanceStatusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {attendanceStatusLabel[item.status] ?? item.status}
                </span>
            ),
            width: "w-28",
        },
    ];

    const actions: ActionItem<ClassAttendanceData>[] = [
        {
            label: "Mark Hadir",
            icon: "eye",
            className: "text-green-600 hover:bg-green-50",
            onClick: (row) => {
                if (row.status === "attended") { toast.error("Sudah hadir"); return; }
                if (row.status === "cancelled") { toast.error("Attendance sudah dibatalkan"); return; }
                markAttendedMutation.mutate(
                    { scheduleId: id, attendanceId: row.id },
                    {
                        onSuccess: () => toast.success(`${row.member?.name} hadir`),
                        onError:   () => toast.error("Gagal update kehadiran"),
                    }
                );
            },
        },
        {
            label: "Batalkan",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (row.status === "cancelled") { toast.error("Sudah dibatalkan"); return; }
                if (confirm(`Batalkan kehadiran ${row.member?.name}?`)) {
                    cancelAttendanceMutation.mutate(
                        { scheduleId: id, attendanceId: row.id },
                        {
                            onSuccess: () => toast.success("Attendance dibatalkan"),
                            onError:   () => toast.error("Gagal membatalkan"),
                        }
                    );
                }
            },
        },
    ];

    return (
        <div className="font-figtree">
            <SonnerToaster position="top-center" />

            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li
                            className="cursor-pointer hover:text-zinc-600"
                            onClick={() => router.push("/class-schedules")}
                        >
                            Jadwal Kelas
                        </li>
                        <li className="text-aksen-secondary">Detail</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {schedule.class_plan?.color && (
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: schedule.class_plan.color }}
                                />
                            )}
                            <h1 className="text-2xl font-semibold text-zinc-800">
                                {schedule.class_plan?.name ?? "—"}
                            </h1>
                            <span className={`rounded-lg px-2 py-1 text-xs font-medium ${
                                { scheduled: "bg-blue-100 text-blue-700", ongoing: "bg-yellow-100 text-yellow-700", completed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" }[schedule.status] ?? "bg-zinc-100 text-zinc-500"
                            }`}>
                                {{ scheduled: "Terjadwal", ongoing: "Berlangsung", completed: "Selesai", cancelled: "Dibatalkan" }[schedule.status] ?? schedule.status}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm">
                            {schedule.date
                                ? new Date(schedule.date).toLocaleDateString("id-ID", {
                                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                                  })
                                : "—"}{" "}
                            · {schedule.start_at} – {schedule.end_at}
                            {isPaidClass && ` · Rp ${Number(classPrice).toLocaleString('id-ID')}`}
                        </p>
                    </div>

                    {!isCancelled && (
                        <div className="flex gap-2">
                            <CustomButton
                                className="border border-zinc-200 text-zinc-700 px-4"
                                onClick={() => router.push(`/class-schedules/${id}/edit`)}
                            >
                                Edit
                            </CustomButton>
                            <CustomButton
                                className="border border-red-200 text-red-600 px-4"
                                onClick={() => {
                                    const reason = prompt("Alasan pembatalan:");
                                    if (reason === null) return;
                                    cancelScheduleMutation.mutate(
                                        { id, reason },
                                        {
                                            onSuccess: () => toast.success("Jadwal dibatalkan"),
                                            onError:   () => toast.error("Gagal membatalkan"),
                                        }
                                    );
                                }}
                            >
                                Batalkan Jadwal
                            </CustomButton>
                        </div>
                    )}
                </div>

                <hr />

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                    <div className="bg-zinc-50 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Instruktur</p>
                        <p className="text-sm font-semibold text-zinc-800">{schedule.instructor?.name ?? "—"}</p>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Kapasitas</p>
                        <p className="text-sm font-semibold text-zinc-800">
                            {schedule.total_booked} / {schedule.max_capacity ?? "∞"}
                        </p>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Hadir</p>
                        <p className="text-sm font-semibold text-green-700">{schedule.total_attended} orang</p>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Cabang</p>
                        <p className="text-sm font-semibold text-zinc-800">{schedule.branch?.name ?? "—"}</p>
                    </div>
                </div>

                {schedule.cancelled_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
                        <span className="font-semibold">Alasan pembatalan:</span> {schedule.cancelled_reason}
                    </div>
                )}

                {/* Attendance Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-zinc-800">
                        Daftar Peserta ({attendances.length})
                    </h2>
                    {!isCancelled && (
                        <CustomButton
                            iconName="plus"
                            className="text-white px-3 text-sm"
                            onClick={() => setShowAddMember(true)}
                        >
                            Tambah Member
                        </CustomButton>
                    )}
                </div>

                {/* Add Member Modal */}
                {showAddMember && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-4 max-w-2xl">
                        <p className="text-sm font-bold text-zinc-800 mb-3">1. Cari & Pilih Member</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={searchMember}
                                onChange={(e) => setSearchMember(e.target.value)}
                                placeholder="Ketik nama member..."
                                className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-zinc-400"
                            />
                        </div>
                        
                        <div className="space-y-1 max-h-40 overflow-y-auto mb-4 border border-zinc-100 rounded-lg bg-white p-1">
                            {members.map((m: any) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setSelectedMember(m.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                                        selectedMember === m.id
                                            ? "bg-aksen-secondary/10 border border-aksen-secondary/30"
                                            : "hover:bg-zinc-50"
                                    }`}
                                >
                                    <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-800">{m.name}</p>
                                        <p className="text-xs text-zinc-400">{m.phone ?? m.email ?? ""}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Tampilkan Pilihan Pembayaran JIKA Kelas Berbayar & Member Sudah Dipilih */}
                        {isPaidClass && selectedMember && (
                            <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                                <p className="text-sm font-bold text-amber-900 mb-1">2. Pilih Metode Pembayaran</p>
                                <p className="text-xs text-amber-700 mb-3">
                                    Biaya kelas: <strong className="text-lg">Rp {Number(classPrice).toLocaleString('id-ID')}</strong>
                                </p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="cash"
                                            checked={paymentMethod === "cash"}
                                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                                            className="w-4 h-4 text-aksen-secondary"
                                        />
                                        Tunai (Cash di Kasir)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="midtrans"
                                            checked={paymentMethod === "midtrans"}
                                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                                            className="w-4 h-4 text-aksen-secondary"
                                        />
                                        Midtrans (Online / QRIS)
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <CustomButton
                                className="bg-aksen-secondary text-white px-4 disabled:opacity-50"
                                disabled={!selectedMember || staffBookClassMutation.isPending || addAttendanceMutation.isPending}
                                onClick={handleRegisterMember}
                            >
                                {staffBookClassMutation.isPending || addAttendanceMutation.isPending
                                    ? "Memproses..." 
                                    : isPaidClass ? "Proses Pembayaran & Daftarkan" : "Daftarkan"}
                            </CustomButton>
                            <CustomButton
                                className="border border-zinc-200 text-zinc-600 px-4"
                                onClick={resetModal}
                            >
                                Batal
                            </CustomButton>
                        </div>
                    </div>
                )}

                {isLoadingAttendances ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                ) : attendances.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-sm">
                        Belum ada peserta terdaftar
                    </div>
                ) : (
                    <CustomTable
                        columns={columns}
                        data={attendances}
                        actions={isCancelled ? [] : actions}
                    />
                )}
            </div>
        </div>
    );
}