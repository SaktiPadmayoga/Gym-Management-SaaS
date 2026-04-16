"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import CustomTable, { ActionItem, Column } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import {
    useClassSchedules,
    useDeleteClassSchedule,
    useCancelClassSchedule,
} from "@/hooks/tenant/useClassSchedules";
import { useDebounce } from "@/hooks/useDebounce";
import { ClassScheduleData } from "@/types/tenant/class-schedules";

type TabKey = "list" | "calendar";

const TABS = [
    { key: "list" as TabKey, label: "Daftar Jadwal" },
    { key: "calendar" as TabKey, label: "Kalender" },
] as const;

const statusColor: Record<string, string> = {
    scheduled:  "bg-blue-100 text-blue-700",
    ongoing:    "bg-yellow-100 text-yellow-700",
    completed:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
    scheduled:  "Terjadwal",
    ongoing:    "Berlangsung",
    completed:  "Selesai",
    cancelled:  "Dibatalkan",
};

const classTypeLabel: Record<string, string> = {
    membership_only: "Member Only",
    public:          "Publik",
    private:         "Private",
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

    const { data, isLoading, isError } = useClassSchedules({
        page,
        per_page: perPage,
        status,
        date,
    });

    const deleteMutation = useCancelClassSchedule();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status) params.set("status", status);
        if (date) params.set("date", date);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/class-schedules?tab=list&${params.toString()}`);
    }, [debouncedSearch, page, perPage, status, date, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        if (success === "true" && !hasShownToast.current) {
            toast.success("Jadwal berhasil dibuat");
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/class-schedules");
        }
    }, [searchParams]);

    const entries: ClassScheduleData[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Gagal memuat jadwal kelas");
        return <div className="py-10 text-center text-red-500">Error loading schedules</div>;
    }

    const columns: Column<ClassScheduleData>[] = [
        {
            header: "Kelas",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.class_plan?.color && (
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.class_plan.color }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-zinc-800">{item.class_plan?.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{item.class_plan?.category ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Tanggal & Waktu",
            render: (item) => (
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
                        {item.start_at} – {item.end_at}
                        {item.class_plan?.duration_label && ` · ${item.class_plan.duration_label}`}
                    </p>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Instruktur",
            render: (item) => (
                <span className="text-sm text-zinc-700">{item.instructor?.name ?? "—"}</span>
            ),
            width: "w-36",
        },
        {
            header: "Peserta",
            render: (item) => (
                <div>
                    <p className="text-sm font-medium text-zinc-700">
                        {item.total_booked} / {item.max_capacity ?? "∞"}
                    </p>
                    {item.is_full && (
                        <p className="text-xs font-bold text-red-500">Penuh</p>
                    )}
                    {!item.is_full && item.available_slots !== null && (
                        <p className="text-xs text-zinc-400">{item.available_slots} slot tersisa</p>
                    )}
                </div>
            ),
            width: "w-28",
        },
        {
            header: "Tipe",
            render: (item) => (
                <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg">
                    {classTypeLabel[item.class_type] ?? item.class_type}
                </span>
            ),
            width: "w-28",
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {statusLabel[item.status] ?? item.status}
                </span>
            ),
            width: "w-28",
        },
    ];

    const actions: ActionItem<ClassScheduleData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row) => router.push(`/class-schedules/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/class-schedules/${row.id}/edit`),
        },
        {
            label: "Batalkan Jadwal",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
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
                        className="text-white px-3"
                        onClick={() => router.push("/class-schedules/create")}
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
                            onRowClick={(row) => router.push(`/class-schedules/${row.id}`)}
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
// CALENDAR TAB
// =============================================
function CalendarTab() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { data, isLoading } = useClassSchedules({
        date: selectedDate || undefined,
    });

    const deleteMutation = useCancelClassSchedule();

    const schedules = data?.data ?? [];

    // Generate calendar days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Fungsi navigasi bulan
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Format tanggal untuk selected date (YYYY-MM-DD)
    const formatDate = (day: number): string => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Filter jadwal berdasarkan tanggal yang dipilih
    const selectedDateSchedules = selectedDate 
        ? schedules.filter(s => s.date === selectedDate)
        : [];

    return (
        <div className="py-4">
            {/* Header Calendar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-zinc-800">
                        {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-2">
                        <CustomButton 
                            
                            size="sm"
                            onClick={prevMonth}
                        >
                            ←
                        </CustomButton>
                        <CustomButton 
                            
                            size="sm"
                            onClick={nextMonth}
                        >
                            →
                        </CustomButton>
                        <CustomButton 
                            
                            size="sm"
                            onClick={goToToday}
                        >
                            Hari Ini
                        </CustomButton>
                    </div>
                </div>

                <div className="text-sm text-zinc-500">
                    {selectedDate 
                        ? new Date(selectedDate).toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })
                        : "Pilih tanggal di kalender"}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200">
                {/* Hari Header */}
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => (
                    <div 
                        key={idx}
                        className="bg-white py-3 text-center text-sm font-medium text-zinc-500 border-b"
                    >
                        {day}
                    </div>
                ))}

                {/* Empty slots sebelum tanggal 1 */}
                {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-white min-h-[120px]" />
                ))}

                {/* Tanggal */}
                {days.map((day) => {
                    const dateStr = formatDate(day);
                    const daySchedules = schedules.filter(s => s.date === dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                        <div
                            key={day}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`bg-white min-h-[120px] p-2 border-b border-r cursor-pointer hover:bg-zinc-50 transition-all
                                ${isSelected ? 'ring-2 ring-aksen-secondary bg-blue-50' : ''}
                                ${isToday ? 'bg-amber-50' : ''}`}
                        >
                            <div className={`text-right text-sm font-medium mb-2 ${isToday ? 'text-amber-600' : 'text-zinc-700'}`}>
                                {day}
                            </div>

                            {/* Mini preview jadwal */}
                            <div className="space-y-1">
                                {daySchedules.slice(0, 3).map((schedule, idx) => (
                                    <div 
                                        key={idx}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 truncate"
                                        title={`${schedule.start_at} - ${schedule.end_at} • ${schedule.class_plan?.name}`}
                                    >
                                        {schedule.start_at} • {schedule.class_plan?.name}
                                    </div>
                                ))}
                                {daySchedules.length > 3 && (
                                    <div className="text-[10px] text-zinc-400 text-center">
                                        +{daySchedules.length - 3} lagi
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Jadwal pada Tanggal yang Dipilih */}
            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4">
                        Jadwal {new Date(selectedDate).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h3>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : selectedDateSchedules.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateSchedules.map((schedule) => (
                                <div 
                                    key={schedule.id}
                                    className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-5"
                                >
                                    <div className="w-20 flex-shrink-0">
                                        <div className="text-4xl font-bold text-zinc-300">
                                            {schedule.start_at?.slice(0, 5)}
                                        </div>
                                        <div className="text-xs text-zinc-400 mt-1">WIB</div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {schedule.class_plan?.color && (
                                                        <div 
                                                            className="w-4 h-4 rounded-full" 
                                                            style={{ backgroundColor: schedule.class_plan.color }}
                                                        />
                                                    )}
                                                    <h4 className="font-semibold text-lg text-zinc-800">
                                                        {schedule.class_plan?.name}
                                                    </h4>
                                                </div>
                                                <p className="text-zinc-500 mt-1">
                                                    {schedule.instructor?.name || "Instruktur belum ditentukan"}
                                                </p>
                                            </div>

                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor[schedule.status]}`}>
                                                {statusLabel[schedule.status]}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center gap-6 text-sm">
                                            <div>
                                                <span className="text-zinc-400">Peserta:</span>{" "}
                                                <span className="font-medium">{schedule.total_booked} / {schedule.max_capacity ?? '∞'}</span>
                                            </div>
                                            <div>
                                                <span className="text-zinc-400">Tipe:</span>{" "}
                                                <span>{classTypeLabel[schedule.class_type] ?? schedule.class_type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 w-28">
                                        <CustomButton 
                                            size="sm"
                                            onClick={() => router.push(`/class-schedules/${schedule.id}`)}
                                        >
                                            Detail
                                        </CustomButton>
                                        <CustomButton 
                                            
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                const reason = prompt("Alasan pembatalan:");
                                                if (reason !== null) {
                                                    deleteMutation.mutate({ id: schedule.id, reason });
                                                }
                                            }}
                                        >
                                            Batalkan
                                        </CustomButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200">
                            <p className="text-zinc-400">Tidak ada jadwal kelas pada tanggal ini</p>
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
export default function ClassSchedules() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabKey>(
        () => (searchParams.get("tab") as TabKey) || "list"
    );

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />
            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Jadwal Kelas</li>
                    </ul>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Jadwal Kelas</h1>
                        <p className="text-zinc-500">Kelola jadwal dan kehadiran kelas</p>
                    </div>
                </div>

                <hr />

                <div className="flex gap-1 mt-4 mb-6 border-b border-zinc-100">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px ${
                                activeTab === tab.key
                                    ? "border-aksen-secondary text-aksen-secondary"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "list" && <ListTab />}
                {activeTab === "calendar" && (
                    <CalendarTab />
                )}
            </div>
        </div>
    );
}