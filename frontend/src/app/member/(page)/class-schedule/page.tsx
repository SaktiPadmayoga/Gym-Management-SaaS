"use client";

import { useState } from "react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    Dumbbell, 
    CheckCircle2, 
    XCircle,
    MapPin,
    AlertCircle,
    Search,
    Filter
} from "lucide-react";
import { 
    useMemberClassSchedules, 
    useMyClasses, 
    useMemberBookClass, 
    useMemberCancelBook 
} from "@/hooks/tenant/useClassSchedules";
import { useDebounce } from "@/hooks/useDebounce";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { useQueryClient } from "@tanstack/react-query";

type TabKey = "browse" | "my_classes";
type TimeFilter = "all" | "today" | "custom";

const TABS = [
    { key: "browse" as TabKey, label: "Cari Kelas" },
    { key: "my_classes" as TabKey, label: "Kelas Saya" },
] as const;

// =============================================
// TAB 1: BROWSE CLASSES (DENGAN PEMBAYARAN)
// =============================================
function BrowseClassesTab() {
    const queryClient = useQueryClient();
    const { pay } = useMidtransSnap();

    // Filter States
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
    const [customDate, setCustomDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [searchQuery, setSearchQuery] = useState("");
    
    const debouncedSearch = useDebounce(searchQuery, 500);

    let queryDate = "";
    if (timeFilter === "today") {
        queryDate = new Date().toISOString().split("T")[0];
    } else if (timeFilter === "custom") {
        queryDate = customDate;
    }

    const { data, isLoading, isError } = useMemberClassSchedules({ 
        date: queryDate,
    });
    
    const bookMutation = useMemberBookClass();

    // ✅ PERBAIKAN: Andalkan snap_token dari response saja, bukan needsPayment
    const handleBook = (schedule: any) => {
        bookMutation.mutate(schedule.id, {
            onSuccess: (response) => {
                // Normalisasi response — cek di kedua level
                console.log("RAW RESPONSE:", JSON.stringify(response, null, 2));

                const resData = response?.data?.data ?? response?.data ?? {};

                const snapToken = resData.snap_token ?? null;

                // Kelas BERBAYAR — snap_token ada di response
                if (snapToken) {
                    pay(snapToken, {
                        onSuccess: () => {
                            toast.success("Pembayaran berhasil!", {
                                description: "Kelas telah dibooking. Cek di 'Kelas Saya'.",
                            });
                            queryClient.invalidateQueries({ queryKey: ["member-my-classes"] });
                            queryClient.invalidateQueries({ queryKey: ["member-class-schedules"] });
                        },
                        onPending: () => toast.info("Menunggu pembayaran Anda..."),
                        onError: () => toast.error("Pembayaran gagal."),
                        onClose: () => toast.warning("Popup pembayaran ditutup. Anda bisa melanjutkan nanti."),
                    });
                    return; // ← PENTING: stop di sini
                }

                // Kelas GRATIS — tidak ada snap_token
                toast.success("Berhasil booking kelas!");
                queryClient.invalidateQueries({ queryKey: ["member-my-classes"] });
                queryClient.invalidateQueries({ queryKey: ["member-class-schedules"] });
            },

            onError: (error: any) => {
                const message = error?.response?.data?.message
                    || "Gagal melakukan booking.";
                toast.error(message);
            },
        });
    };

    // Filter lokal berdasarkan search
    let schedules = data?.data ?? [];
    if (debouncedSearch) {
        schedules = schedules.filter((s: any) => 
            s.class_plan?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="py-4"
        >
            {/* FILTER SECTION */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200 shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Cari nama kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-sm"
                    />
                </div>

                {/* Time Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
                    <div className="flex bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setTimeFilter("all")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                timeFilter === "all" ? "bg-teal-500 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-50"
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setTimeFilter("today")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                timeFilter === "today" ? "bg-teal-500 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-50"
                            }`}
                        >
                            Hari Ini
                        </button>
                        <button
                            onClick={() => setTimeFilter("custom")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                                timeFilter === "custom" ? "bg-teal-500 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-50"
                            }`}
                        >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Pilih Tanggal
                        </button>
                    </div>

                    <AnimatePresence>
                        {timeFilter === "custom" && (
                            <motion.div
                                initial={{ opacity: 0, width: 0, x: -10 }}
                                animate={{ opacity: 1, width: "auto", x: 0 }}
                                exit={{ opacity: 0, width: 0, x: -10 }}
                                className="relative overflow-hidden"
                            >
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 focus:outline-none focus:border-teal-500 shadow-sm"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* LIST KELAS */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200" />
                    ))}
                </div>
            ) : isError ? (
                <div className="py-12 text-center bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 font-medium">Gagal memuat jadwal kelas.</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="py-16 text-center bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Filter className="w-6 h-6 text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 font-medium">Tidak ada kelas yang ditemukan.</p>
                    <p className="text-xs text-zinc-400 mt-1">Coba ubah kata kunci atau filter tanggal.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedules.map((schedule: any) => {
                        const classPlan = schedule.class_plan;
                        const price = parseFloat(classPlan?.price || "0");
                        const needsPayment = price > 0;
                        const isFull = schedule.is_full || (schedule.total_booked >= (schedule.max_capacity ?? Infinity));
                        const isPending = bookMutation.isPending && bookMutation.variables === schedule.id;

                        const displayDate = new Date(schedule.date).toLocaleDateString('id-ID', { 
                            weekday: 'short', day: 'numeric', month: 'short' 
                        });

                        return (
                            <div key={schedule.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner" 
                                                style={{ 
                                                    backgroundColor: `${classPlan?.color || '#0f766e'}15`, 
                                                    color: classPlan?.color || '#0f766e' 
                                                }}
                                            >
                                                <Dumbbell className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-zinc-900 leading-tight group-hover:text-teal-700 transition-colors">
                                                    {classPlan?.name}
                                                </h3>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">
                                                    {classPlan?.category}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                            <CalendarIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                                            <span className="font-semibold text-zinc-800">{displayDate}</span>
                                            <span className="text-zinc-300">|</span>
                                            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                                            <span className="font-semibold text-zinc-800">{schedule.start_at}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 px-1">
                                            <User className="w-4 h-4 text-zinc-400 shrink-0" />
                                            <span>{schedule.instructor?.name || "Instruktur TBD"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 px-1">
                                            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                                            <span>{schedule.room?.name || "Main Studio"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kapasitas</span>
                                        <span className={`text-sm font-black ${isFull ? 'text-red-500' : 'text-zinc-800'}`}>
                                            {schedule.total_booked} / {schedule.max_capacity ?? "∞"}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleBook(schedule)}
                                        disabled={isFull || isPending}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                            isFull 
                                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                                                : needsPayment 
                                                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20" 
                                                    : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                                        }`}
                                    >
                                        {isPending 
                                            ? "Memproses..." 
                                            : isFull 
                                                ? "Penuh" 
                                                : needsPayment 
                                                    ? `Bayar Rp ${price.toLocaleString('id-ID')}` 
                                                    : "Booking Gratis"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// =============================================
// TAB 2: MY CLASSES (KELAS SAYA)
// =============================================
function MyClassesTab() {
    const [statusFilter, setStatusFilter] = useState("scheduled");
    const { data, isLoading, isError } = useMyClasses({ status: statusFilter });
    const cancelMutation = useMemberCancelBook();

    const handleCancel = (scheduleId: string) => {
        if (confirm("Apakah Anda yakin ingin membatalkan kehadiran di kelas ini?")) {
            cancelMutation.mutate(scheduleId, {
                onSuccess: () => toast.success("Booking berhasil dibatalkan."),
                onError: () => toast.error("Gagal membatalkan booking.")
            });
        }
    };

    const myClasses = data?.data ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="py-4"
        >
            {/* Filter Pil */}
            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar bg-white p-1 rounded-xl border border-zinc-200 w-max shadow-sm">
                {[
                    { val: "scheduled", label: "Akan Datang" },
                    { val: "completed", label: "Selesai" },
                    { val: "cancelled", label: "Dibatalkan" },
                ].map((f) => (
                    <button
                        key={f.val}
                        onClick={() => setStatusFilter(f.val)}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                            statusFilter === f.val 
                                ? "bg-teal-500 text-white shadow-sm" 
                                : "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse border border-zinc-200" />
                    ))}
                </div>
            ) : isError ? (
                <div className="py-12 text-center text-red-500">Gagal memuat daftar kelas Anda.</div>
            ) : myClasses.length === 0 ? (
                <div className="py-16 text-center bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
                    <p className="text-zinc-500 font-medium">Anda belum memiliki kelas dengan status ini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {myClasses.map((booking: any) => {
                        const schedule = booking.class_schedule;
                        if (!schedule) return null;

                        const isPendingCancel = cancelMutation.isPending && cancelMutation.variables === schedule.id;

                        return (
                            <div key={booking.id} className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-teal-200 transition-colors">
                                <div className="flex items-start gap-5">
                                    <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 shrink-0 text-white shadow-inner">
                                        <span className="text-[10px] text-teal-400 uppercase font-black tracking-widest mb-0.5">
                                            {new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' })}
                                        </span>
                                        <span className="text-xl font-black leading-none">
                                            {new Date(schedule.date).getDate()}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-black text-zinc-900 text-lg uppercase tracking-tight">
                                                {schedule.class_plan?.name}
                                            </h3>
                                            {statusFilter === "completed" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            {statusFilter === "cancelled" && <XCircle className="w-5 h-5 text-red-400" />}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-zinc-500 mb-2">
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded-md text-zinc-800">
                                                <Clock className="w-3.5 h-3.5 text-zinc-400" /> {schedule.start_at}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-zinc-400" /> {schedule.instructor?.name || "TBD"}
                                            </span>
                                            <span className="flex items-center gap-1.5 md:hidden">
                                                <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" /> {schedule.date}
                                            </span>
                                        </div>
                                        
                                        {booking.status === "attended" && (
                                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-md uppercase tracking-widest mt-1">
                                                Hadir
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {statusFilter === "scheduled" && (
                                    <div className="flex justify-end border-t border-zinc-100 pt-4 md:border-0 md:pt-0 shrink-0">
                                        <button
                                            onClick={() => handleCancel(schedule.id)}
                                            disabled={isPendingCancel}
                                            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                        >
                                            {isPendingCancel ? "Memproses..." : "Batalkan Kelas"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function MemberClassBooking() {
    const [activeTab, setActiveTab] = useState<TabKey>("browse");

    return (
        <div className="font-sans min-h-screen bg-[#FAFAFA] pb-12">
            <Toaster position="top-center" richColors />

            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    
                    {/* Header */}
                    <div className="p-6 md:p-10 border-b border-zinc-100 bg-white shrink-0">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-inner">
                                <CalendarIcon className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter uppercase">
                                    Booking <span className="text-teal-500">Kelas.</span>
                                </h1>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
                                    Atur jadwal latihan Anda dengan mudah.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 md:px-10 bg-zinc-50 border-b border-zinc-200 flex gap-8 shrink-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative py-5 text-xs font-black uppercase tracking-widest transition-colors ${
                                    activeTab === tab.key ? "text-teal-600" : "text-zinc-400 hover:text-zinc-700"
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <motion.div 
                                        layoutId="activeMemberTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-10 flex-1 bg-white">
                        <AnimatePresence mode="wait">
                            {activeTab === "browse" && <BrowseClassesTab key="browse" />}
                            {activeTab === "my_classes" && <MyClassesTab key="my_classes" />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}