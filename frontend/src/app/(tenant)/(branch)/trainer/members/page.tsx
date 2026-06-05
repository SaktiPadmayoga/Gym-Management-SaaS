"use client";

export const dynamic = 'force-dynamic';

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { usePtSessions } from "@/hooks/tenant/usePtSessions";
import { Users, CalendarDays, ChevronRight, CheckCircle2 } from "lucide-react";

export default function TrainerMembersPage() {
    const router = useRouter();
    const { staff, selectedBranch } = useStaffAuth();

    const isTrainer = staff?.role === 'trainer' || selectedBranch?.role === 'trainer';
    if (!isTrainer) {
        return <div className="p-8 text-center text-zinc-500">Anda tidak memiliki akses ke halaman ini.</div>;
    }

    // Ambil semua sesi milik trainer ini (max 500 untuk grouping)
    const { data, isLoading } = usePtSessions({ per_page: 500 });

    // Group by member, hitung stats
    const memberMap = useMemo(() => {
        const sessions: any[] = data?.data ?? [];
        const map = new Map<string, {
            member: any;
            total: number;
            completed: number;
            lastDate: string;
        }>();

        sessions.forEach((s: any) => {
            if (!s.member_id) return;
            const existing = map.get(s.member_id);
            const sessionDate = s.date ?? '';
            if (existing) {
                existing.total += 1;
                if (s.status === 'completed') existing.completed += 1;
                if (sessionDate > existing.lastDate) existing.lastDate = sessionDate;
            } else {
                map.set(s.member_id, {
                    member: s.member,
                    total: 1,
                    completed: s.status === 'completed' ? 1 : 0,
                    lastDate: sessionDate,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            b.lastDate.localeCompare(a.lastDate)
        );
    }, [data]);

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20 shadow-sm">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-aksen-secondary" />
                    Member Saya
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Daftar member yang pernah atau sedang Anda tangani.
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : memberMap.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-gray-500/20 rounded-xl bg-zinc-50/50">
                    <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Belum ada member yang ditangani.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {memberMap.map(({ member, total, completed, lastDate }) => {
                        const initials = (member?.name ?? "?")
                            .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

                        return (
                            <button
                                key={member?.id}
                                onClick={() => router.push(`/trainer/members/${member?.id}`)}
                                className="w-full bg-white border border-gray-500/20 rounded-xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all text-left"
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-aksen-secondary/10 flex items-center justify-center text-aksen-secondary font-bold text-lg shrink-0">
                                    {initials}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 truncate">{member?.name ?? "—"}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        Sesi terakhir:{" "}
                                        {lastDate
                                            ? new Date(lastDate).toLocaleDateString("id-ID", {
                                                  day: "numeric", month: "short", year: "numeric",
                                              })
                                            : "—"}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-center hidden md:block">
                                        <p className="text-lg font-bold text-zinc-900">{total}</p>
                                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" /> Total Sesi
                                        </p>
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <p className="text-lg font-bold text-teal-600">{completed}</p>
                                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-teal-500" /> Selesai
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
