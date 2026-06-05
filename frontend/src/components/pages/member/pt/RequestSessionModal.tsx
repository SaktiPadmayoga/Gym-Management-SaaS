import React, { useState, useMemo } from 'react';
import { usePtTrainers, useTrainerBookedSlots, useRequestPtSession } from '@/hooks/tenant/usePt';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Props {
    packageId: string;
    onClose: () => void;
}

export default function RequestSessionModal({ packageId, onClose }: Props) {
    const { data: trainersData, isLoading: isLoadingTrainers } = usePtTrainers();
    const { mutateAsync: requestSession, isPending } = useRequestPtSession();

    const [selectedTrainer, setSelectedTrainer] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [notes, setNotes] = useState("");

    const trainers = trainersData?.data || [];

    // Fetch booked slots when trainer and date are selected
    const { data: bookedSlotsData, isLoading: isLoadingSlots } = useTrainerBookedSlots(selectedTrainer, selectedDate);
    const bookedSlots = bookedSlotsData?.data || [];

    // Simple time slots generator (every 30 mins from 06:00 to 22:00)
    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let h = 6; h <= 21; h++) {
            const hs = h.toString().padStart(2, '0');
            slots.push(`${hs}:00`);
            slots.push(`${hs}:30`);
        }
        return slots;
    }, []);

    // Check if a specific time is available (not overlapping with booked slots)
    const isTimeAvailable = (timeStr: string) => {
        if (!bookedSlots.length) return true;
        
        // For simplicity in UI, if it falls between start_at and end_at, disable it
        return !bookedSlots.some((slot: any) => {
            const slotStart = slot.start_at.substring(0, 5); // "HH:mm"
            const slotEnd = slot.end_at.substring(0, 5);
            return timeStr >= slotStart && timeStr < slotEnd; 
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedTrainer || !selectedDate || !startAt || !endAt) {
            toast.error("Mohon lengkapi semua field yang wajib");
            return;
        }

        if (startAt >= endAt) {
            toast.error("Jam selesai harus lebih besar dari jam mulai");
            return;
        }

        try {
            await requestSession({
                pt_package_id: packageId,
                trainer_id: selectedTrainer,
                date: selectedDate,
                start_at: startAt,
                end_at: endAt,
                notes,
            });
            toast.success("Request jadwal berhasil dikirim!");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengirim request");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl text-zinc-900">
                <div className="p-4 border-b flex items-center justify-between border-zinc-100 bg-white">
                    <h3 className="font-bold text-lg text-zinc-900">Request Jadwal PT</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Pilih Pelatih</label>
                        <select 
                            required
                            className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={selectedTrainer}
                            onChange={(e) => setSelectedTrainer(e.target.value)}
                        >
                            <option value="" className="text-zinc-500">-- Pilih Pelatih --</option>
                            {trainers.map((t: any) => (
                                <option key={t.id} value={t.id} className="text-zinc-800">{t.name}</option>
                            ))}
                        </select>
                        {isLoadingTrainers && <p className="text-xs text-zinc-500 mt-1">Memuat pelatih...</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tanggal Sesi</label>
                        <input 
                            required
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Jam Mulai</label>
                            <select 
                                required
                                className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 disabled:bg-zinc-50 disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                disabled={!selectedDate || !selectedTrainer}
                            >
                                <option value="" className="text-zinc-500">-- Jam --</option>
                                {timeSlots.map(time => (
                                    <option key={time} value={time} disabled={!isTimeAvailable(time)} className="text-zinc-800">
                                        {time} {!isTimeAvailable(time) ? '(Penuh)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Jam Selesai</label>
                            <select 
                                required
                                className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 disabled:bg-zinc-50 disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                                disabled={!startAt}
                            >
                                <option value="" className="text-zinc-500">-- Jam --</option>
                                {timeSlots.map(time => {
                                    if (time <= startAt) return null;
                                    return (
                                        <option key={time} value={time} disabled={!isTimeAvailable(time)} className="text-zinc-800">
                                            {time}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {isLoadingSlots && <p className="text-xs text-amber-600 font-medium">Memeriksa jadwal pelatih...</p>}

                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Catatan (Opsional)</label>
                        <textarea 
                            className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm h-20 resize-none bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Contoh: Fokus latihan otot punggung"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-sm transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isPending || isLoadingSlots}
                            className="flex-1 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
                        >
                            {isPending ? "Mengirim..." : "Kirim Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
