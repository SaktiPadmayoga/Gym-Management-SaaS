"use client";

import React, { useMemo } from "react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { usePtSessions, usePtSessionRequests } from "@/hooks/tenant/usePtSessions";
import { Clock, CheckCircle2, User, Target, ChevronRight, CalendarDays, ArrowRight, PlayCircle, ClipboardList } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrainerDashboardPage() {
    const { staff, selectedBranch } = useStaffAuth();
    const router = useRouter();

    const role = staff?.role;
    const branchRole = selectedBranch?.role;

    if (role !== 'owner' && role !== 'admin' && role !== 'trainer' && branchRole !== 'trainer' && branchRole !== 'branch_manager') {
        return (
            <div className="p-8 text-center text-zinc-500">
                Anda tidak memiliki akses ke halaman ini.
            </div>
        );
    }

    const today = dayjs().format('YYYY-MM-DD');

    const { data: todaySessionsData, isLoading: isLoadingSessions } = usePtSessions({
        date: today,
        per_page: 50 // get all for today
    });

    const { data: requestsData, isLoading: isLoadingRequests } = usePtSessionRequests();

    const todaySessions = useMemo(() => {
        let sessions = todaySessionsData?.data || [];
        sessions = sessions.sort((a: any, b: any) => a.start_at.localeCompare(b.start_at));
        return sessions;
    }, [todaySessionsData]);

    const pendingRequests = requestsData?.data || [];

    // Hitung Sesi Berikutnya (Next Up)
    const nowTime = dayjs().format('HH:mm:ss');
    const nextSession = useMemo(() => {
        return todaySessions.find((s: any) => s.end_at > nowTime && s.status === 'scheduled');
    }, [todaySessions, nowTime]);

    const completedToday = todaySessions.filter((s: any) => s.status === 'completed').length;

    const stats = [
        {
            title: "Sesi Selesai (Hari Ini)",
            value: completedToday,
            icon: <CheckCircle2 className="w-5 h-5 text-teal-500" />,
            bgColor: "bg-teal-50",
        },
        {
            title: "Sisa Sesi (Hari Ini)",
            value: todaySessions.length - completedToday,
            icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
            bgColor: "bg-blue-50",
        },
        {
            title: "Request Pending",
            value: pendingRequests.length,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            bgColor: "bg-amber-50",
            onClick: () => router.push("/pt-sessions/requests"),
        }
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-figtree">
            {/* Header Greeting */}
            <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Halo, {staff?.name} 👋</h1>
                <p className="text-sm text-zinc-500 mt-1">Berikut adalah ringkasan jadwal dan aktivitas Anda hari ini.</p>
            </div>

            {/* Next Session Highlight */}
            {nextSession && (
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <PlayCircle className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm mb-4 inline-block">
                                Sesi Berikutnya
                            </span>
                            <h2 className="text-3xl font-black mb-2">{nextSession.member?.name}</h2>
                            <div className="flex items-center gap-4 text-zinc-300 font-medium">
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {nextSession.start_at.substring(0,5)} - {nextSession.end_at.substring(0,5)}</span>
                                <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {nextSession.package?.plan?.name || "PT Package"}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.push(`/pt-sessions/${nextSession.id}`)}
                            className="px-8 py-3 bg-white text-zinc-900 rounded-xl font-bold hover:bg-zinc-100 transition-colors shrink-0 flex items-center gap-2"
                        >
                            Mulai Sesi <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div 
                        key={i} 
                        onClick={stat.onClick}
                        className={`p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm flex flex-col justify-between ${stat.onClick ? 'cursor-pointer hover:border-zinc-300 hover:shadow-md transition-all' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                {stat.icon}
                            </div>
                            {stat.onClick && <ChevronRight className="w-5 h-5 text-zinc-400" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-500 mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-black text-zinc-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Agenda Hari Ini */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            Agenda Hari Ini <span className="text-sm font-medium text-zinc-400">({dayjs().locale('id').format('D MMMM YYYY')})</span>
                        </h2>
                        <Link href="/pt-sessions" className="text-sm font-semibold text-aksen-secondary hover:underline flex items-center gap-1">
                            Semua Jadwal <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {isLoadingSessions ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : todaySessions.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                            <CalendarDays className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500 font-medium">Anda tidak memiliki sesi hari ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todaySessions.map((session: any) => {
                                const isCompleted = session.status === 'completed';
                                const isOngoing = session.status === 'ongoing';
                                const isScheduled = session.status === 'scheduled';
                                
                                return (
                                    <div key={session.id} className={`bg-white border border-zinc-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${isCompleted ? 'opacity-70' : ''}`}>
                                        <div className="flex flex-col items-center justify-center shrink-0 w-20 border-r border-zinc-100 pr-4">
                                            <span className="text-lg font-black text-zinc-900">{session.start_at.substring(0,5)}</span>
                                            <span className="text-xs font-semibold text-zinc-400">{session.end_at.substring(0,5)}</span>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold ${isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-900'}`}>{session.member?.name}</h3>
                                                {isCompleted && <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-md">Selesai</span>}
                                                {isOngoing && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-md">Berlangsung</span>}
                                                {isScheduled && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md">Terjadwal</span>}
                                            </div>
                                            <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                                                <Target className="w-4 h-4" /> {session.package?.plan?.name || "PT Package"}
                                            </p>
                                        </div>

                                        <div className="shrink-0 hidden md:block">
                                            <Link 
                                                href={`/pt-sessions/${session.id}`}
                                                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors"
                                            >
                                                Detail
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Widgets */}
                <div className="space-y-8">
                    
                    {/* Widget: Pending Requests */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900">Request Sesi</h2>
                        </div>

                        {isLoadingRequests ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                                <ClipboardList className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                <p className="text-zinc-400 text-sm font-medium">Tidak ada request baru.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                                <div className="divide-y divide-zinc-100">
                                    {pendingRequests.slice(0, 3).map((req: any) => (
                                        <div key={req.id} className="p-4 hover:bg-zinc-50 transition-colors flex justify-between items-center gap-4">
                                            <div>
                                                <span className="font-bold text-sm text-zinc-900 block mb-1">{req.member?.name}</span>
                                                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                                    <CalendarDays className="w-3 h-3" />
                                                    {dayjs(req.date).locale("id").format("D MMM YYYY")}, {req.start_at.substring(0, 5)}
                                                </p>
                                            </div>
                                            <Link 
                                                href="/pt-sessions/requests"
                                                className="px-3 py-1.5 bg-aksen-secondary hover:bg-aksen-secondary/90 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                                            >
                                                Proses
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                                {pendingRequests.length > 3 && (
                                    <div className="p-3 bg-zinc-50 text-center border-t border-zinc-100">
                                        <Link href="/pt-sessions/requests" className="text-xs font-bold text-zinc-500 hover:text-zinc-700">
                                            Lihat {pendingRequests.length - 3} lainnya...
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Placeholder Widget: Aktivitas / Notes */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900">Aktivitas Terakhir</h2>
                        </div>
                        <div className="py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <span className="px-3 py-1 bg-zinc-800 text-white text-xs font-bold rounded-full">Coming Soon</span>
                            </div>
                            <User className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-zinc-400 text-sm font-medium px-4">Fitur pencatatan progress member akan segera hadir.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
