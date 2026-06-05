"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomTable, { ActionItem, Column } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useDebounce } from "@/hooks/useDebounce";

// Sesuaikan path import ini dengan lokasi file types dan hooks kamu
import { PtSessionData } from "@/types/tenant/pt";
import { 
    usePtSessions, 
    useCancelPtSession, 
    useApprovePtRequest, 
    useRejectPtRequest 
} from "@/hooks/tenant/usePtSessions"; 
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { Calendar, Clock, User, Phone, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

type TabKey = "list" | "calendar";

const TABS = [
    { key: "list" as TabKey, label: "Daftar Sesi" },
    { key: "calendar" as TabKey, label: "Agenda Kalender" },
] as const;

const statusColor: Record<string, string> = {
    scheduled:  "bg-blue-100 text-blue-700",
    ongoing:    "bg-yellow-100 text-yellow-700",
    completed:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
    requested:  "bg-purple-100 text-purple-700 border-purple-200",
};

const statusLabel: Record<string, string> = {
    scheduled:  "Terjadwal",
    ongoing:    "Berlangsung",
    completed:  "Selesai",
    cancelled:  "Dibatalkan",
    requested:  "Menunggu Konfirmasi",
};

const statusDotColor: Record<string, string> = {
    scheduled:  "#3b82f6",
    ongoing:    "#eab308",
    completed:  "#10b981",
    cancelled:  "#ef4444",
    requested:  "#a855f7",
};

// =============================================
// LIST TAB
// =============================================
function ListTab() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage]       = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);
    const [status, setStatus]   = useState(() => searchParams.get("status") || "");
    const [date, setDate]       = useState(() => searchParams.get("date") || "");

    const form = useForm({ defaultValues: { search: searchParams.get("search") || "" } });
    const debouncedSearch = useDebounce(form.watch("search"), 500);

    const { data, isLoading, isError } = usePtSessions({
        page,
        per_page: perPage,
        status,
        date,
        search: debouncedSearch,
    });

    const deleteMutation = useCancelPtSession();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status) params.set("status", status);
        if (date) params.set("date", date);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/pt-sessions?tab=list&${params.toString()}`);
    }, [debouncedSearch, page, perPage, status, date, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        if (success === "true" && !hasShownToast.current) {
            toast.success("Jadwal PT berhasil dibuat");
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/pt-sessions");
        }
    }, [searchParams]);

    const entries: PtSessionData[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Gagal memuat jadwal PT");
        return <div className="py-10 text-center text-red-500">Error loading PT sessions</div>;
    }

    const columns: Column<PtSessionData>[] = [
        {
            header: "Member",
            render: (item: PtSessionData) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm shrink-0">
                        {item.member?.name?.charAt(0).toUpperCase() || "M"}
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
            header: "Pelatih (Trainer)",
            render: (item: PtSessionData) => (
                <span className="text-sm font-medium text-zinc-700">{item.trainer?.name ?? "—"}</span>
            ),
            width: "w-40",
        },
        {
            header: "Paket PT",
            render: (item: PtSessionData) => (
                <div className="flex items-center gap-2">
                    {item.package?.plan?.color && (
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.package.plan.color }}
                        />
                    )}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">{item.package?.plan?.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{item.package?.plan?.category ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Tanggal & Waktu",
            render: (item: PtSessionData) => (
                <div>
                    <p className="text-sm font-medium text-zinc-700">
                        {item.date
                            ? new Date(item.date).toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                              })
                            : "—"}
                    </p>
                    <p className="text-xs text-zinc-400">
                        {item.start_at?.slice(0, 5)} – {item.end_at?.slice(0, 5)}
                    </p>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Status",
            render: (item: PtSessionData) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {statusLabel[item.status] ?? item.status}
                </span>
            ),
            width: "w-28",
        },
    ];

    const actions: ActionItem<PtSessionData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row: PtSessionData) => router.push(`/pt-sessions/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row: PtSessionData) => router.push(`/pt-sessions/${row.id}/edit`),
        },
        {
            label: "Batalkan Jadwal",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row: PtSessionData) => {
                if (row.status === "cancelled") {
                    toast.error("Jadwal sudah dibatalkan");
                    return;
                }
                const reason = prompt("Alasan pembatalan (opsional):");
                if (reason === null) return;
                deleteMutation.mutate(
                    { id: row.id, reason },
                    {
                        onSuccess: () => toast.success("Jadwal dibatalkan"),
                        onError: () => toast.error("Gagal membatalkan jadwal"),
                    }
                );
            },
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="py-4">
                <div className="flex gap-3 items-center mb-6 flex-wrap justify-between">
                    <div className="flex gap-3 items-center flex-wrap">
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => { setDate(e.target.value); setPage(1); }}
                            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        />
                        <div className="w-64 text-zinc-800">
                            <SearchInput name="search" />
                        </div>
                    </div>
                    <CustomButton
                        iconName="plus"
                        className="text-white px-3 py-2"
                        onClick={() => router.push("/pt-sessions/create")}
                    >
                        Buat Jadwal
                    </CustomButton>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <CustomTable
                            columns={columns}
                            data={entries}
                            actions={actions}
                            onRowClick={(row: PtSessionData) => router.push(`/pt-sessions/${row.id}`)}
                        />
                    )}
                </div>

                <div className="mt-4 text-sm text-zinc-500">
                    Showing {entries.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
                    {(page - 1) * perPage + entries.length} of {meta?.total ?? entries.length} data
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={!!meta?.next_page_url}
                        hasPrevPage={!!meta?.prev_page_url}
                        totalItems={meta?.total ?? entries.length}
                        rowOptions={[15, 30, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>
        </FormProvider>
    );
}

// =============================================
// CALENDAR TAB (AGENDA PRIVAT TRAINER)
// =============================================
function CalendarTab() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

    // Fetch sessions of this trainer/branch
    const { data: monthData, isLoading: isLoadingMonth } = usePtSessions({
        per_page: 100 // fetch all for display inside cells
    });

    const { data: selectedDateData, isLoading: isLoadingDay } = usePtSessions({
        date: selectedDate,
        per_page: 50
    });

    const approveMutation = useApprovePtRequest();
    const rejectMutation = useRejectPtRequest();
    const cancelMutation  = useCancelPtSession();

    const allSessions = monthData?.data ?? [];
    const daySessions = selectedDateData?.data ?? [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        setCurrentDate(new Date());
        setSelectedDate(todayStr);
    };

    const formatDateStr = (day: number): string => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleApprove = (id: string) => {
        approveMutation.mutate(id, {
            onSuccess: () => toast.success("Sesi PT berhasil disetujui"),
            onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal menyetujui sesi"),
        });
    };

    const handleReject = (id: string) => {
        const reason = prompt("Masukkan alasan penolakan (opsional):");
        if (reason === null) return;
        rejectMutation.mutate({ id, reason }, {
            onSuccess: () => toast.success("Request sesi PT ditolak"),
            onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal menolak request"),
        });
    };

    const handleCancel = (id: string) => {
        const reason = prompt("Masukkan alasan pembatalan (opsional):");
        if (reason === null) return;
        cancelMutation.mutate({ id, reason }, {
            onSuccess: () => toast.success("Sesi PT berhasil dibatalkan"),
            onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal membatalkan sesi"),
        });
    };

    return (
        <div className="py-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-zinc-800 capitalize">
                        {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-1.5">
                        <CustomButton size="sm" onClick={prevMonth} className="px-2.5 py-1 text-xs">←</CustomButton>
                        <CustomButton size="sm" onClick={nextMonth} className="px-2.5 py-1 text-xs">→</CustomButton>
                        <CustomButton size="sm" onClick={goToToday} className="px-3.5 py-1 text-xs">Hari Ini</CustomButton>
                    </div>
                </div>

                <div className="text-sm font-semibold text-zinc-500">
                    {selectedDate 
                        ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                        : "Pilih tanggal di kalender"}
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => (
                    <div key={idx} className="bg-white py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider border-b">{day}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-white min-h-[110px]" />
                ))}

                {days.map((day) => {
                    const dateStr = formatDateStr(day);
                    const daySessionsList = allSessions.filter((s: any) => s.date === dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                        <div
                            key={day}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`bg-white min-h-[110px] p-2 border-b border-r cursor-pointer hover:bg-zinc-50/80 transition-all flex flex-col justify-between
                                ${isSelected ? 'ring-2 ring-inset ring-aksen-secondary bg-blue-50/30' : ''}
                                ${isToday ? 'bg-amber-50/20' : ''}`}
                        >
                            <div className={`text-right text-xs font-bold ${isToday ? 'text-amber-600' : 'text-zinc-600'}`}>
                                {day}
                            </div>

                            <div className="mt-2 space-y-1">
                                {daySessionsList.slice(0, 3).map((session: any, idx: number) => (
                                    <div 
                                        key={idx}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-700 truncate border border-zinc-100 flex items-center gap-1 font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: statusDotColor[session.status] || '#a1a1aa' }} />
                                        {session.start_at?.slice(0, 5)} • {session.member?.name}
                                    </div>
                                ))}
                                {daySessionsList.length > 3 && (
                                    <div className="text-[9px] text-zinc-400 text-center font-bold uppercase tracking-wider">
                                        +{daySessionsList.length - 3} lagi
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DETAIL SESI DI TANGGAL TERPILIH */}
            {selectedDate && (
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60 shadow-inner">
                    <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" />
                        Detail Agenda: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>

                    {isLoadingDay ? (
                        <div className="space-y-3">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-20 bg-zinc-200 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : daySessions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {daySessions.map((session: any) => {
                                const isRequested = session.status === 'requested';
                                const isScheduled = session.status === 'scheduled';
                                const isOngoing = session.status === 'ongoing';

                                return (
                                    <div key={session.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-4">
                                        <div className="w-20 shrink-0 flex flex-col justify-center border-r border-zinc-100 pr-3">
                                            <div className="text-xl font-black text-zinc-800 leading-none">{session.start_at?.slice(0, 5)}</div>
                                            <div className="text-[10px] font-bold text-zinc-400 mt-1">s/d {session.end_at?.slice(0, 5)}</div>
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${statusColor[session.status]}`}>
                                                        {statusLabel[session.status] ?? session.status}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                        {session.package?.plan?.category}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-md text-zinc-800 truncate leading-snug">
                                                    {session.member?.name}
                                                </h4>
                                                <p className="text-xs text-zinc-500 font-medium truncate flex items-center gap-1">
                                                    <Phone size={12} className="text-zinc-400" />
                                                    {session.member?.phone || "-"}
                                                </p>
                                                <p className="text-xs text-zinc-500 font-medium truncate">
                                                    Paket: {session.package?.plan?.name || "PT Package"}
                                                </p>
                                                {session.notes && (
                                                    <p className="text-xs text-zinc-400 bg-zinc-50 p-2 rounded-lg border border-zinc-100 italic mt-2.5">
                                                        " {session.notes} "
                                                    </p>
                                                )}
                                            </div>

                                            {/* ACTION FOOTER */}
                                            <div className="flex gap-2 pt-4 border-t border-zinc-50 mt-4">
                                                <Link 
                                                    href={`/pt-sessions/${session.id}`}
                                                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                                                >
                                                    Detail Sesi
                                                </Link>
                                                {isRequested && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleApprove(session.id)}
                                                            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(session.id)}
                                                            className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold transition"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                                {(isScheduled || isOngoing) && (
                                                    <button 
                                                        onClick={() => handleCancel(session.id)}
                                                        className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition ml-auto"
                                                    >
                                                        Batalkan
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200">
                            <p className="text-zinc-400 font-medium text-sm">Tidak ada sesi latihan pada tanggal ini</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// =============================================
// MAIN PAGE
// =============================================
export default function PtSchedules() {
    const searchParams = useSearchParams();
    const { selectedBranch } = useStaffAuth();
    const isTrainer = selectedBranch?.role === "trainer";
    const [activeTab, setActiveTab] = useState<TabKey>(
        () => (searchParams.get("tab") as TabKey) || (isTrainer ? "calendar" : "list")
    );

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />
            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Jadwal PT</li>
                    </ul>
                </div>

                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-5">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Jadwal Personal Training</h1>
                        <p className="text-zinc-500">Kelola dan pantau jadwal sesi latihan private</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-6 border-b border-zinc-100">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px ${
                                activeTab === tab.key
                                    ? "border-aksen-secondary text-aksen-secondary font-bold"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "list" && <ListTab />}
                {activeTab === "calendar" && <CalendarTab />}

            </div>
        </div>
    );
}