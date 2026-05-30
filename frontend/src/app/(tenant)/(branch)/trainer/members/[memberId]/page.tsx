"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { usePtSessions, useUpdatePtSessionNotes } from "@/hooks/tenant/usePtSessions";
import { ArrowLeft, NotebookPen, CalendarDays, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast, Toaster } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/id";

export default function TrainerMemberProgressPage() {
    const router = useRouter();
    const params = useParams();
    const memberId = params?.memberId as string;

    const { staff, selectedBranch } = useStaffAuth();
    const isTrainer = staff?.role === 'trainer' || selectedBranch?.role === 'trainer';

    // Ambil semua sesi completed untuk member ini
    const { data, isLoading, refetch } = usePtSessions({
        member_id: memberId,
        status: "completed",
        per_page: 100,
    });

    const updateNotesMutation = useUpdatePtSessionNotes();

    // Track which session is being edited + local note value
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNote, setEditNote] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const sessions: any[] = data?.data ?? [];
    const memberName = sessions[0]?.member?.name ?? "Member";

    const handleSaveNote = (sessionId: string) => {
        if (!editNote.trim()) return toast.error("Catatan tidak boleh kosong");
        updateNotesMutation.mutate({ id: sessionId, notes: editNote }, {
            onSuccess: () => {
                toast.success("Catatan berhasil disimpan");
                setEditingId(null);
                refetch();
            },
            onError: () => toast.error("Gagal menyimpan catatan"),
        });
    };

    if (!isTrainer) {
        return <div className="p-8 text-center text-zinc-500">Anda tidak memiliki akses ke halaman ini.</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 font-figtree">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <div className="flex items-start gap-4">
                <button
                    onClick={() => router.push("/trainer/members")}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors mt-0.5 shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </button>
                <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                        Progress Member
                    </p>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{memberName}</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {sessions.length} sesi selesai
                    </p>
                </div>
            </div>

            {/* Summary stats */}
            {sessions.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-black text-zinc-900">{sessions.length}</p>
                        <p className="text-xs text-zinc-500 font-semibold mt-1 flex items-center justify-center gap-1">
                            <CalendarDays className="w-3 h-3" /> Sesi Selesai
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-black text-teal-600">
                            {sessions.filter((s: any) => s.notes).length}
                        </p>
                        <p className="text-xs text-zinc-500 font-semibold mt-1 flex items-center justify-center gap-1">
                            <NotebookPen className="w-3 h-3" /> Punya Catatan
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-2xl font-black text-zinc-900">
                            {sessions[0]?.package?.plan?.name
                                ? sessions[0].package.plan.name.split(" ").slice(0, 2).join(" ")
                                : "—"}
                        </p>
                        <p className="text-xs text-zinc-500 font-semibold mt-1">Paket Aktif</p>
                    </div>
                </div>
            )}

            {/* Timeline Sesi */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                    <CheckCircle2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Belum ada sesi selesai untuk member ini.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session: any) => {
                        const isExpanded = expandedId === session.id;
                        const isEditing = editingId === session.id;
                        const formattedDate = dayjs(session.date).locale("id").format("dddd, D MMMM YYYY");
                        const timeRange = `${session.start_at?.slice(0, 5)} – ${session.end_at?.slice(0, 5)}`;

                        return (
                            <div
                                key={session.id}
                                className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden"
                            >
                                {/* Row utama */}
                                <div
                                    className="p-5 flex items-center gap-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                                >
                                    {/* Status dot */}
                                    <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-teal-500 mt-0.5" />

                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-zinc-900 text-sm">{formattedDate}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {timeRange}
                                            {session.notes && (
                                                <>
                                                    <span className="text-zinc-300 mx-1">·</span>
                                                    <NotebookPen className="w-3 h-3 text-teal-500" />
                                                    <span className="text-teal-600 font-semibold">Ada catatan</span>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {isExpanded
                                        ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                                        : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                                    }
                                </div>

                                {/* Detail ekspansi */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-100 p-5 bg-zinc-50 space-y-4">
                                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Catatan Progress
                                        </p>

                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editNote}
                                                    onChange={(e) => setEditNote(e.target.value)}
                                                    rows={3}
                                                    autoFocus
                                                    placeholder="Tulis catatan progress untuk sesi ini..."
                                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 resize-none transition"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveNote(session.id)}
                                                        disabled={updateNotesMutation.isPending}
                                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                                                    >
                                                        {updateNotesMutation.isPending ? "Menyimpan..." : "Simpan"}
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingId(null); setEditNote(""); }}
                                                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-sm font-bold rounded-xl transition-colors"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {session.notes ? (
                                                    <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap bg-white border border-zinc-100 rounded-xl px-4 py-3">
                                                        {session.notes}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-zinc-400 italic">
                                                        Belum ada catatan untuk sesi ini.
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingId(session.id);
                                                        setEditNote(session.notes ?? "");
                                                    }}
                                                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-aksen-secondary hover:text-teal-700 transition-colors"
                                                >
                                                    <NotebookPen className="w-3.5 h-3.5" />
                                                    {session.notes ? "Edit Catatan" : "Tambah Catatan"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
