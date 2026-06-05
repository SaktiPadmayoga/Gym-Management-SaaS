"use client";

import { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        q: "Berapa lama waktu yang dibutuhkan untuk mulai menggunakan GYMFIT?",
        a:
            "GYMFIT dirancang agar proses pendaftaran dan aktivasi gym dapat dilakukan secara mandiri melalui platform kurang dari 30 menit. Setelah memilih paket dan menyelesaikan pembayaran, akun gym dapat digunakan untuk mulai mengatur data cabang, staf, paket membership, jadwal kelas, dan layanan gym lainnya.",
    },
    {
        q: "Apakah GYMFIT dapat digunakan oleh gym yang memiliki lebih dari satu cabang?",
        a: "Ya. GYMFIT mendukung pengelolaan multi-cabang sehingga owner dapat memantau data cabang, member, staf, transaksi, dan laporan operasional dari satu sistem yang terpusat.",
    },
    {
        q: "Apakah ada ikatan kontrak atau komitmen jangka panjang?",
        a: "GYMFIT menggunakan sistem berlangganan sehingga tenant dapat memilih paket layanan sesuai kebutuhan gym. Pengelolaan langganan, status aktif, invoice, dan pembayaran dapat dipantau melalui sistem.",
    },
    {
        q: "Apakah GYMFIT mendukung pembagian hak akses pengguna?",
        a: "Ya. GYMFIT mendukung pembagian hak akses berdasarkan peran pengguna, seperti owner, staff cabang, trainer, dan member. Setiap pengguna hanya dapat mengakses fitur yang sesuai dengan tanggung jawabnya.",
    },
    {
        q: "Metode pembayaran apa saja yang didukung?",
        a:
            "GYMFIT menggunakan integrasi Midtrans sebagai payment gateway untuk mendukung proses pembayaran secara online. Melalui Midtrans, pembayaran dapat dilakukan dengan metode yang tersedia pada layanan tersebut, seperti transfer bank, e-wallet, QRIS, dan metode pembayaran lain yang didukung.",
    },
];

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Buka FAQ pertama secara default

    return (
        <section id="faq" className="py-24 lg:py-20 px-6 bg-slate-50 font-sans relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-60" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-start">
                {/* --- LEFT: TITLE --- */}
                <div className="lg:col-span-5 lg:sticky lg:top-20">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <HelpCircle className="w-3 h-3 text-teal-400" />
                            Pusat Bantuan
                        </div>
                        <h2 className="text-5xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900 mb-6">
                            Pertanyaan <br />
                            <span className="text-slate-300">F.A.Q.</span>
                        </h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight leading-relaxed max-w-sm mb-8">Tidak menemukan jawaban yang Anda cari? Tim support kami standby 24/7 untuk membantu Anda.</p>
                        <a
                            href="mailto:support@gymfit.id"
                            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                        >
                            Hubungi CS Support
                        </a>
                    </motion.div>
                </div>

                {/* --- RIGHT: ACCORDION --- */}
                <div className="lg:col-span-7">
                    <div className="space-y-4">
                        {faqs.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className={`bg-white rounded-3xl lg:rounded-2xl border transition-all duration-300 overflow-hidden ${
                                        isOpen ? "border-teal-500 shadow-lg shadow-teal-500/10" : "border-slate-200 hover:border-slate-300 shadow-sm"
                                    }`}
                                >
                                    <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full flex items-center justify-between p-6 md:p-6 text-left focus:outline-none">
                                        <div className="flex items-center gap-4 md:gap-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? "text-teal-500" : "text-slate-400"}`}>[{String(i + 1).padStart(2, "0")}]</span>
                                            <span className={`text-lg md:text-lg font-bold tracking-tight pr-4 ${isOpen ? "text-slate-900" : "text-slate-700"}`}>{faq.q}</span>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                                            {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                                                <div className="px-6 md:px-6 pb-8 pt-0 md:pl-16">
                                                    <p className="text-sm font-medium leading-relaxed text-slate-500">{faq.a}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
