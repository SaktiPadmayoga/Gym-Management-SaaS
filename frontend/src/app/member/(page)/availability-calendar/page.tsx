"use client";

import { useState, useMemo, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Dumbbell,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    MapPin,
    ArrowRight,
    PlusCircle,
    Info,
} from "lucide-react";
import {
    useMemberClassSchedules,
    useMemberBookClass,
} from "@/hooks/tenant/useClassSchedules";
import {
    usePtTrainers,
    useTrainerBookedSlots,
    useRequestPtSession,
    useMyPtPackages,
} from "@/hooks/tenant/usePt";
import { useQueryClient } from "@tanstack/react-query";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { ClassScheduleData } from "@/types/tenant/class-schedules";

type TabKey = "class" | "trainer";

// ==========================================
// REQUEST SESSION MODAL FROM CALENDAR
// ==========================================
interface RequestSessionModalProps {
    trainerId: string;
    trainerName: string;
    date: string;
    startTime: string;
    onClose: () => void;
}

function RequestSessionModal({ trainerId, trainerName, date, startTime, onClose }: RequestSessionModalProps) {
    const queryClient = useQueryClient();
    const { data: packagesData, isLoading: isLoadingPackages } = useMyPtPackages();
    const { mutateAsync: requestSession, isPending } = useRequestPtSession();

    const [selectedPackage, setSelectedPackage] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [notes, setNotes] = useState("");

    const packages = useMemo(() => {
        return (packagesData as any)?.data?.filter((p: any) => p.status === "active" && (p.remaining_sessions ?? 0) > 0) || [];
    }, [packagesData]);

    // Set default package if available
    useEffect(() => {
        if (packages.length > 0 && !selectedPackage) {
            setSelectedPackage(packages[0].id);
        }
    }, [packages, selectedPackage]);

    const endAt = useMemo(() => {
        if (!startTime) return "";
        const [h, m] = startTime.split(":").map(Number);
        const totalMinutes = h * 60 + m + durationMinutes;
        const eh = Math.floor(totalMinutes / 60) % 24;
        const em = totalMinutes % 60;
        return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    }, [startTime, durationMinutes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPackage) {
            toast.error("Anda harus memilih Paket PT aktif");
            return;
        }

        try {
            await requestSession({
                pt_package_id: selectedPackage,
                trainer_id: trainerId,
                date,
                start_at: startTime,
                end_at: endAt,
                notes,
            });
            toast.success("Request jadwal PT berhasil dikirim!");
            queryClient.invalidateQueries({ queryKey: ["pt"] });
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengirim request jadwal.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200"
            >
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-zinc-900">Request Sesi Latihan</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition p-1 hover:bg-zinc-100 rounded-lg">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {isLoadingPackages ? (
                    <div className="p-8 text-center text-zinc-500 animate-pulse">Memuat paket Anda...</div>
                ) : packages.length === 0 ? (
                    <div className="p-6 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                        <p className="text-sm font-semibold text-zinc-800">Tidak Ada Paket PT Aktif</p>
                        <p className="text-xs text-zinc-500">Anda harus membeli paket Personal Training terlebih dahulu untuk menjadwalkan sesi.</p>
                        <button onClick={onClose} className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition">
                            Tutup
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                        <div className="bg-teal-50 border border-teal-200/50 p-4 rounded-xl space-y-1">
                            <div className="text-xs text-teal-700 font-bold uppercase tracking-wider">Detail Sesi</div>
                            <div className="text-sm font-bold text-zinc-800">{trainerName}</div>
                            <div className="text-xs text-zinc-500 flex gap-2 items-center">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            <div className="text-xs text-zinc-500 flex gap-2 items-center">
                                <Clock className="w-3.5 h-3.5" />
                                {startTime} - {endAt} ({durationMinutes} menit)
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Pilih Paket PT Anda</label>
                            <select
                                required
                                className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={selectedPackage}
                                onChange={(e) => setSelectedPackage(e.target.value)}
                            >
                                {packages.map((p: any) => (
                                    <option key={p.id} value={p.id}>
                                        {p.plan?.name} (Sisa: {p.remaining_sessions ?? 0} Sesi)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Durasi Latihan</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[60, 90].map((mins) => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setDurationMinutes(mins)}
                                        className={`py-2 rounded-xl text-xs font-bold uppercase border transition ${
                                            durationMinutes === mins
                                                ? "border-teal-500 bg-teal-50 text-teal-700 font-black"
                                                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        }`}
                                    >
                                        {mins} Menit
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Catatan Latihan (Opsional)</label>
                            <textarea
                                className="w-full p-3 border border-zinc-200 rounded-xl text-sm h-20 resize-none bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Contoh: Fokus ke otot dada dan kardio..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="pt-3 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs uppercase tracking-wider transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-500/10"
                            >
                                {isPending ? "Mengirim..." : "Kirim Request"}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT: INTERACTIVE CALENDAR
// ==========================================
export default function InteractiveCalendarPage() {
    const queryClient = useQueryClient();
    const { pay } = useMidtransSnap();

    // Tab state: class vs trainer
    const [activeTab, setActiveTab] = useState<TabKey>("class");

    // Calendar month view
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

    // Mode Trainer specific states
    const [selectedTrainer, setSelectedTrainer] = useState("");
    const [bookingStartTime, setBookingStartTime] = useState<string | null>(null);

    // 1. Fetch Class Schedules
    const { data: classSchedulesData, isLoading: isLoadingClasses } = useMemberClassSchedules({
        per_page: 100, // Ambil banyak agar dot terisi di kalender
    });

    const bookClassMutation = useMemberBookClass();
    const [pendingClassBookId, setPendingClassBookId] = useState<string | null>(null);
    const [confirmingClassSchedule, setConfirmingClassSchedule] = useState<ClassScheduleData | null>(null);

    // 2. Fetch Trainers & Selected Trainer Booked Slots
    const { data: trainersData, isLoading: isLoadingTrainers } = usePtTrainers();
    const trainers = trainersData?.data || [];

    const { data: bookedSlotsData, isLoading: isLoadingSlots } = useTrainerBookedSlots(selectedTrainer, selectedDate);
    const bookedSlots = bookedSlotsData?.data || [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today.toISOString().split("T")[0]);
    };

    const formatDateStr = (day: number): string => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    // Mapping Class dot indicators
    const classesByDateMap = useMemo(() => {
        const map: Record<string, ClassScheduleData[]> = {};
        const schedules = classSchedulesData?.data || [];
        schedules.forEach((s) => {
            const dateStr = s.date; // YYYY-MM-DD
            if (!map[dateStr]) {
                map[dateStr] = [];
            }
            map[dateStr].push(s);
        });
        return map;
    }, [classSchedulesData]);

    const activeTrainerName = useMemo(() => {
        const tr = trainers.find((t: any) => String(t.id) === selectedTrainer);
        return tr ? tr.name : "";
    }, [trainers, selectedTrainer]);

    // Handle class booking
    const handleBookClass = (schedule: ClassScheduleData) => {
        setPendingClassBookId(schedule.id);

        bookClassMutation.mutate(schedule.id, {
            onSuccess: (result) => {
                if (result.snap_token) {
                    pay(result.snap_token, {
                        onSuccess: () => {
                            toast.success("Pembayaran berhasil!", {
                                description: "Kelas berhasil dibooking.",
                            });
                            queryClient.invalidateQueries({ queryKey: ["member-class-schedules"] });
                            queryClient.invalidateQueries({ queryKey: ["member-my-classes"] });
                        },
                        onPending: () => toast.info("Menunggu pembayaran..."),
                        onError: () => toast.error("Pembayaran gagal."),
                        onClose: () => toast.warning("Pembayaran dibatalkan."),
                    });
                } else {
                    toast.success("Berhasil booking kelas!");
                    queryClient.invalidateQueries({ queryKey: ["member-class-schedules"] });
                    queryClient.invalidateQueries({ queryKey: ["member-my-classes"] });
                }
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Gagal melakukan booking.");
            },
            onSettled: () => setPendingClassBookId(null),
        });
    };

    // Trainer Time slots logic (30-minute intervals from 06:00 to 22:00)
    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let h = 6; h <= 21; h++) {
            const hs = h.toString().padStart(2, "0");
            slots.push(`${hs}:00`);
            slots.push(`${hs}:30`);
        }
        return slots;
    }, []);

    const isTimeAvailable = (timeStr: string) => {
        if (!bookedSlots.length) return true;
        return !bookedSlots.some((slot: any) => {
            const slotStart = slot.start_at.substring(0, 5); // "HH:mm"
            const slotEnd = slot.end_at.substring(0, 5);
            return timeStr >= slotStart && timeStr < slotEnd;
        });
    };

    // Day classes for selected date
    const selectedDateClasses = useMemo(() => {
        return classesByDateMap[selectedDate] || [];
    }, [classesByDateMap, selectedDate]);

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon size={24} className="text-teal-600" />
                        <h1 className="text-2xl font-bold text-zinc-900">Jadwal & Kalender</h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Cek ketersediaan kelas gym dan slot kosong pelatih favorit Anda.
                    </p>
                </div>
            </div>

            {/* Toggles */}
            <div className="flex bg-zinc-100/80 p-1 rounded-xl w-fit border border-zinc-200/50 shadow-inner">
                <button
                    onClick={() => {
                        setActiveTab("class");
                        setBookingStartTime(null);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        activeTab === "class"
                            ? "bg-white text-zinc-900 shadow-sm font-black"
                            : "text-zinc-500 hover:text-zinc-900"
                    }`}
                >
                    <Dumbbell className="w-3.5 h-3.5 text-teal-600" />
                    Ketersediaan Kelas
                </button>
                <button
                    onClick={() => {
                        setActiveTab("trainer");
                        setBookingStartTime(null);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        activeTab === "trainer"
                            ? "bg-white text-zinc-900 shadow-sm font-black"
                            : "text-zinc-500 hover:text-zinc-900"
                    }`}
                >
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    Jadwal Trainer
                </button>
            </div>

            {/* Trainer Selection Form (Hanya muncul jika tab trainer dipilih) */}
            {activeTab === "trainer" && (
                <div className="bg-zinc-50 border border-zinc-200/80 p-5 rounded-2xl shadow-sm space-y-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Pilih Personal Trainer
                    </label>
                    <select
                        className="w-full max-w-md p-3 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
                        value={selectedTrainer}
                        onChange={(e) => {
                            setSelectedTrainer(e.target.value);
                            setBookingStartTime(null);
                        }}
                    >
                        <option value="">-- Pilih Trainer Terdaftar --</option>
                        {trainers.map((t: any) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    {isLoadingTrainers && <p className="text-xs text-zinc-400 animate-pulse">Memuat data pelatih...</p>}
                </div>
            )}

            {/* TAB CONTENT: CALENDAR WRAPPER */}
            {(activeTab === "class" || (activeTab === "trainer" && selectedTrainer)) ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* COLUMN 1 & 2: CALENDAR GRID */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Month navigation */}
                        <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-200/50 shadow-sm">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-black text-zinc-800 capitalize">
                                    {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                                </h2>
                                <div className="flex gap-1">
                                    <button onClick={prevMonth} className="p-2 hover:bg-zinc-200/70 active:scale-95 rounded-lg transition border border-zinc-200 bg-white">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={nextMonth} className="p-2 hover:bg-zinc-200/70 active:scale-95 rounded-lg transition border border-zinc-200 bg-white">
                                        <ChevronRight size={16} />
                                    </button>
                                    <button onClick={goToToday} className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200/70 active:scale-95 rounded-lg transition border border-zinc-200 bg-white text-zinc-700">
                                        Hari Ini
                                    </button>
                                </div>
                            </div>
                            <div className="hidden sm:block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                                {activeTab === "class" ? "📅 Kelas Aktif" : `💪 Sesi ${activeTrainerName}`}
                            </div>
                        </div>

                        {/* Calendar Board */}
                        <div className="bg-zinc-100/50 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                            <div className="grid grid-cols-7 gap-px bg-zinc-200">
                                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, idx) => (
                                    <div key={idx} className="bg-white py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                                        {day}
                                    </div>
                                ))}

                                {Array.from({ length: firstDay }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="bg-white min-h-[90px] opacity-40 bg-zinc-50/50" />
                                ))}

                                {days.map((day) => {
                                    const dateStr = formatDateStr(day);
                                    const isSelected = selectedDate === dateStr;
                                    const isToday = dateStr === new Date().toISOString().split("T")[0];

                                    // Class list for this day
                                    const dayClasses = classesByDateMap[dateStr] || [];

                                    return (
                                        <div
                                            key={day}
                                            onClick={() => {
                                                setSelectedDate(dateStr);
                                                setBookingStartTime(null);
                                            }}
                                            className={`bg-white min-h-[95px] p-2 cursor-pointer hover:bg-zinc-50/80 transition-all flex flex-col justify-between relative select-none
                                                ${isSelected ? "ring-2 ring-inset ring-teal-500 bg-teal-50/30" : ""}
                                                ${isToday ? "bg-amber-50/30" : ""}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                {/* Today dot indicator */}
                                                {isToday && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                )}
                                                <span className={`text-xs font-bold ml-auto px-1.5 py-0.5 rounded-md ${
                                                    isToday 
                                                        ? "bg-amber-500 text-white font-black" 
                                                        : isSelected 
                                                        ? "text-teal-700 font-black" 
                                                        : "text-zinc-600"
                                                }`}>
                                                    {day}
                                                </span>
                                            </div>

                                            {/* Indicators */}
                                            <div className="mt-2 space-y-1">
                                                {activeTab === "class" && dayClasses.length > 0 && (
                                                    <div className="space-y-1">
                                                        {dayClasses.slice(0, 2).map((s, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="text-[9px] px-1.5 py-0.5 rounded truncate font-medium border"
                                                                style={{
                                                                    backgroundColor: `${s.class_plan?.color || "#0f766e"}15`,
                                                                    color: s.class_plan?.color || "#0f766e",
                                                                    borderColor: `${s.class_plan?.color || "#0f766e"}30`
                                                                }}
                                                            >
                                                                {s.class_plan?.name}
                                                            </div>
                                                        ))}
                                                        {dayClasses.length > 2 && (
                                                            <div className="text-[8px] font-bold text-zinc-400 text-center uppercase tracking-wider">
                                                                +{dayClasses.length - 2} kelas
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Show trainer occupancy in dots if selected */}
                                                {activeTab === "trainer" && (
                                                    <div className="flex justify-center gap-1">
                                                        {/* We don't fetch month-wide slots, but display simple info */}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 3: DAILY DETAIL PANEL */}
                    <div className="space-y-4">
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-md font-bold text-zinc-800 flex items-center gap-2 mb-4 border-b border-zinc-200/60 pb-3">
                                <CalendarIcon className="w-4 h-4 text-teal-600" />
                                {new Date(selectedDate).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </h3>

                            {/* CLASS DETAILS */}
                            {activeTab === "class" && (
                                <div className="space-y-3">
                                    {isLoadingClasses ? (
                                        <div className="space-y-3">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="h-28 bg-zinc-200/50 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : selectedDateClasses.length > 0 ? (
                                        selectedDateClasses.map((schedule) => {
                                            const classPlan = schedule.class_plan;
                                            const isBooked = schedule.is_booked_by_me;
                                            const price = classPlan?.price ?? 0;
                                            const needsPayment = price > 0;
                                            const isFull = schedule.total_booked >= (schedule.max_capacity ?? Infinity);
                                            const isPending = pendingClassBookId === schedule.id;

                                            return (
                                                <div
                                                    key={schedule.id}
                                                    className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:border-teal-300 transition space-y-3"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                                                {classPlan?.category}
                                                            </span>
                                                            <h4 className="font-bold text-zinc-800 leading-tight">
                                                                {classPlan?.name}
                                                            </h4>
                                                        </div>
                                                        <span
                                                            className="w-3 h-3 rounded-full shrink-0 shadow-inner"
                                                            style={{ backgroundColor: classPlan?.color || "#0f766e" }}
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5 text-xs text-zinc-500 font-semibold">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                            <span>{schedule.start_at}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3.5 h-3.5 text-zinc-400" />
                                                            <span>{schedule.instructor?.name || "TBD"}</span>
                                                        </div>
                                                        {needsPayment && (
                                                            <div className="text-amber-600 font-bold">
                                                                Biaya: Rp {price.toLocaleString("id-ID")}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100">
                                                        <div className="text-[10px] text-zinc-400 font-bold uppercase">
                                                            Kapasitas:
                                                            <span className={`block font-black text-xs ${isFull ? "text-red-500" : "text-zinc-800"}`}>
                                                                {schedule.total_booked} / {schedule.max_capacity ?? "∞"}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => !isBooked && setConfirmingClassSchedule(schedule)}
                                                            disabled={isFull || isPending || isBooked}
                                                            className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                                                                isBooked
                                                                    ? "bg-teal-50 text-teal-600 border border-teal-200 cursor-default"
                                                                    : isFull
                                                                    ? "bg-zinc-100 text-zinc-400"
                                                                    : needsPayment
                                                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                                                    : "bg-teal-600 hover:bg-teal-700 text-white"
                                                            }`}
                                                        >
                                                            {isBooked ? "✓ Booked" : isPending ? "..." : isFull ? "Penuh" : "Book"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl bg-white space-y-2">
                                            <Dumbbell className="w-8 h-8 text-zinc-300 mx-auto" />
                                            <p className="text-xs text-zinc-500 font-semibold">Tidak Ada Kelas</p>
                                            <p className="text-[10px] text-zinc-400">Jadwal kelas tidak tersedia untuk tanggal ini.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TRAINER TIME SLOTS */}
                            {activeTab === "trainer" && (
                                <div className="space-y-4">
                                    <div className="text-xs text-zinc-500 font-semibold mb-2">
                                        Pilih jam latihan untuk mengajukan jadwal PT:
                                    </div>

                                    {isLoadingSlots ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-10 bg-zinc-200/50 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1">
                                            {timeSlots.map((time) => {
                                                const isAvailable = isTimeAvailable(time);

                                                return (
                                                    <button
                                                        key={time}
                                                        disabled={!isAvailable}
                                                        onClick={() => setBookingStartTime(time)}
                                                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                                                            isAvailable
                                                                ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100/50 cursor-pointer"
                                                                : "border-red-100 bg-red-50 text-red-400 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        <span>{time}</span>
                                                        <span className="text-[9px] font-black uppercase">
                                                            {isAvailable ? "Kosong" : "Sibuk"}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // State jika tab pelatih aktif tapi belum memilih pelatih
                <div className="py-20 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl space-y-3">
                    <User className="w-12 h-12 text-zinc-300 mx-auto" />
                    <p className="text-zinc-500 font-medium">Silakan pilih Personal Trainer terlebih dahulu</p>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        Jadwal bulanan dan slot jam latihan kosong pelatih akan ditampilkan setelah Anda memilih dari dropdown di atas.
                    </p>
                </div>
            )}

            {/* REQUEST PT MODAL */}
            <AnimatePresence>
                {bookingStartTime && (
                    <RequestSessionModal
                        trainerId={selectedTrainer}
                        trainerName={activeTrainerName}
                        date={selectedDate}
                        startTime={bookingStartTime}
                        onClose={() => setBookingStartTime(null)}
                    />
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Booking Kelas */}
            <AnimatePresence>
                {confirmingClassSchedule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200"
                        >
                            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-zinc-900">Konfirmasi Booking Kelas</h3>
                                <button 
                                    onClick={() => setConfirmingClassSchedule(null)} 
                                    className="text-zinc-400 hover:text-zinc-600 transition p-1 hover:bg-zinc-100 rounded-lg"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {(() => {
                                    const price = confirmingClassSchedule.class_plan?.price ?? 0;
                                    const needsPayment = price > 0;
                                    return (
                                        <>
                                            <div className="bg-teal-50 border border-teal-200/50 p-4 rounded-xl space-y-2">
                                                <div className="text-xs text-teal-700 font-bold uppercase tracking-wider">Detail Kelas</div>
                                                <div className="text-base font-black text-zinc-900">{confirmingClassSchedule.class_plan?.name}</div>
                                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                                    {confirmingClassSchedule.class_plan?.category}
                                                </p>
                                                
                                                <div className="space-y-1.5 pt-2 border-t border-teal-100/50 text-xs text-zinc-600 font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                        <span>
                                                            {new Date(confirmingClassSchedule.date).toLocaleDateString("id-ID", {
                                                                weekday: "long",
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                        <span>{confirmingClassSchedule.start_at} - {confirmingClassSchedule.end_at}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                        <span>{confirmingClassSchedule.instructor?.name || "TBD"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Biaya</span>
                                                <span className="text-lg font-black text-zinc-900">
                                                    {needsPayment
                                                        ? `Rp ${price.toLocaleString("id-ID")}`
                                                        : "Gratis"}
                                                </span>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingClassSchedule(null)}
                                                    className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs uppercase tracking-wider transition"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const target = confirmingClassSchedule;
                                                        setConfirmingClassSchedule(null);
                                                        handleBookClass(target);
                                                    }}
                                                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-500/10"
                                                >
                                                    {needsPayment
                                                        ? "Lanjut Pembayaran"
                                                        : "Konfirmasi Booking"}
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
