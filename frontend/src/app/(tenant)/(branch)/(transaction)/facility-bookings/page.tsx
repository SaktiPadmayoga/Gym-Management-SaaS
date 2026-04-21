"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import CustomTable, { ActionItem, Column } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useDebounce } from "@/hooks/useDebounce";

import { useFacilityBookings, useDeleteFacilityBooking } from "@/hooks/tenant/useFacilityBookings";

type TabKey = "list" | "calendar";

const TABS = [
    { key: "list" as TabKey, label: "Daftar Booking" },
    { key: "calendar" as TabKey, label: "Kalender" },
] as const;

const statusColor: Record<string, string> = {
    booked:    "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    no_show:   "bg-zinc-100 text-zinc-500",
};

const paymentStatusColor: Record<string, string> = {
    free:    "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    paid:    "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
    failed:  "bg-red-100 text-red-700",
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

    const { data, isLoading, isError } = useFacilityBookings({
        page,
        per_page: perPage,
        status,
        date,
        search: debouncedSearch,
    });

    const deleteMutation = useDeleteFacilityBooking();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status) params.set("status", status);
        if (date) params.set("date", date);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/facility-bookings?tab=list&${params.toString()}`);
    }, [debouncedSearch, page, perPage, status, date, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        if (success === "true" && !hasShownToast.current) {
            toast.success("Booking fasilitas berhasil dibuat");
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/facility-bookings");
        }
    }, [searchParams]);

    const entries: any[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Gagal memuat data booking fasilitas");
        return <div className="py-10 text-center text-red-500">Error loading data</div>;
    }

    const columns: Column<any>[] = [
        {
            header: "Fasilitas",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.facility?.color && (
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.facility.color }}
                        />
                    )}
                    <div>
                        <p className="font-medium text-zinc-800">{item.facility?.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{item.facility?.category ?? "Fasilitas"}</p>
                    </div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Member",
            render: (item) => (
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
            header: "Tanggal & Waktu",
            render: (item) => (
                <div>
                    <p className="text-sm font-medium text-zinc-700">
                        {item.date
                            ? new Date(item.date).toLocaleDateString("id-ID", {
                                  weekday: "short", day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                    </p>
                    <p className="text-xs text-zinc-400">
                        {item.start_time?.slice(0, 5)} – {item.end_time?.slice(0, 5)}
                    </p>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Pembayaran",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium uppercase ${paymentStatusColor[item.payment_status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {item.payment_status}
                </span>
            ),
            width: "w-28",
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {item.status.replace('_', ' ')}
                </span>
            ),
            width: "w-28",
        },
    ];

    const actions: ActionItem<any>[] = [
        {
            label: "Lihat / Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/facility-bookings/${row.id}`),
        },
        {
            label: "Batalkan Booking",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (row.status === "cancelled") {
                    toast.error("Booking sudah dibatalkan");
                    return;
                }
                const reason = prompt("Alasan pembatalan (opsional):");
                if (reason === null) return;
                deleteMutation.mutate(
                    { id: row.id, reason },
                    {
                        onSuccess: () => toast.success("Booking dibatalkan"),
                        onError: () => toast.error("Gagal membatalkan booking"),
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
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                        </select>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => { setDate(e.target.value); setPage(1); }}
                            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        />
                    </div>
                    <CustomButton
                        iconName="plus"
                        className="text-white px-3"
                        onClick={() => router.push("/facility-bookings/create")}
                    >
                        Booking / POS
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
                            onRowClick={(row) => router.push(`/facility-bookings/${row.id}`)}
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

    const { data, isLoading } = useFacilityBookings({
        date: selectedDate || undefined, 
        per_page: 100 
    });

    const deleteMutation = useDeleteFacilityBooking();

    const bookings = data?.data ?? [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const formatDate = (day: number): string => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const selectedDateBookings = selectedDate 
        ? bookings.filter((b: any) => b.date === selectedDate)
        : [];

    return (
        <div className="py-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-zinc-800">
                        {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-2">
                        <CustomButton size="sm" onClick={prevMonth}>←</CustomButton>
                        <CustomButton size="sm" onClick={nextMonth}>→</CustomButton>
                        <CustomButton size="sm" onClick={goToToday}>Hari Ini</CustomButton>
                    </div>
                </div>

                <div className="text-sm text-zinc-500">
                    {selectedDate 
                        ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                        : "Pilih tanggal di kalender"}
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => (
                    <div key={idx} className="bg-white py-3 text-center text-sm font-medium text-zinc-500 border-b">{day}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-white min-h-[120px]" />
                ))}

                {days.map((day) => {
                    const dateStr = formatDate(day);
                    const dayBookings = bookings.filter((b: any) => b.date === dateStr);
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

                            <div className="space-y-1">
                                {dayBookings.slice(0, 3).map((booking: any, idx: number) => (
                                    <div 
                                        key={idx}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 truncate flex items-center gap-1"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: booking.facility?.color || '#a1a1aa' }} />
                                        {booking.start_time?.slice(0, 5)} • {booking.member?.name}
                                    </div>
                                ))}
                                {dayBookings.length > 3 && (
                                    <div className="text-[10px] text-zinc-400 text-center font-medium">
                                        +{dayBookings.length - 3} lagi
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-4">
                        Booking {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : selectedDateBookings.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateBookings.map((booking: any) => (
                                <div key={booking.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-5">
                                    <div className="w-20 flex-shrink-0">
                                        <div className="text-3xl font-bold text-zinc-300">{booking.start_time?.slice(0, 5)}</div>
                                        <div className="text-xs font-medium text-zinc-400 mt-1">s/d {booking.end_time?.slice(0, 5)}</div>
                                    </div>

                                    <div className="flex-1 border-l border-zinc-100 pl-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg text-zinc-800 leading-none mb-1">
                                                    {booking.facility?.name}
                                                </h4>
                                                <p className="text-sm text-zinc-500">
                                                    Member: <span className="font-medium text-zinc-700">{booking.member?.name}</span>
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusColor[booking.status]}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 w-28 shrink-0">
                                        <CustomButton size="sm" onClick={() => router.push(`/facility-bookings/${booking.id}`)}>
                                            Detail
                                        </CustomButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200">
                            <p className="text-zinc-400">Tidak ada booking fasilitas pada tanggal ini</p>
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
export default function FacilityBookingsPage() {
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
                        <li className="text-aksen-secondary">Booking Fasilitas</li>
                    </ul>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Booking Fasilitas</h1>
                        <p className="text-zinc-500">Kelola pemesanan dan jadwal fasilitas gym</p>
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
                {activeTab === "calendar" && <CalendarTab />}
            </div>
        </div>
    );
}