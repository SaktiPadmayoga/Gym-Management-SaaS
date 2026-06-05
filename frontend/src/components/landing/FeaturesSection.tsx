"use client";

import { Users, BarChart3, Calendar, CreditCard, Shield, Zap, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const FeaturesSection = () => {
    const features = [
        { span: "lg:col-span-8", icon: <Users />, title: "Member Management", desc: "Siklus hidup member yang terotomatisasi. Dari onboarding, billing, hingga tracking retensi dalam satu protokol tunggal." },
        { span: "lg:col-span-4", icon: <CreditCard />, title: "Payment Gateway Option", desc: "Integrasi dengan berbagai metode pembayaran, termasuk kartu kredit dan e-wallet." },
        { span: "lg:col-span-4", icon: <BarChart3 />, title: "Live Analytics", desc: "Pantau transaksi, tren pendapatan, dan engagement member secara real-time." },
        { span: "lg:col-span-4", icon: <Calendar />, title: "Trainer & Member Scheduling", desc: "Manajemen jadwal trainer dan member yang terintegrasi." },
        { span: "lg:col-span-4", icon: <Shield />, title: "Access Control", desc: "Integrasi akses berdasarkan role, QR check-in, dan manajemen akses multi-cabang." },
    ];

    return (
        <section id="features" className="py-24 lg:py-20 px-10 lg:px-8 max-w-7xl mx-auto bg-white relative font-sans">
            <div className="">
                <div className="mb-16 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <Zap className="w-3 h-3 text-teal-400" />
                            Core Ecosystem
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900">
                            Everything <br />
                            <span className="text-teal-500">You Need.</span>
                        </h2>
                    </div>
                    <div className="max-w-xs">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Toolkit tingkat enterprise yang dibangun khusus untuk bisnis kebugaran skala besar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`${f.span} bg-slate-50 rounded-[2.5rem] lg:rounded-[2rem] p-8 md:p-8 border border-slate-200 group hover:bg-slate-900 hover:border-slate-800 transition-colors duration-500 flex flex-col`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-500 transition-all duration-500 shadow-sm">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-3 group-hover:text-white transition-colors duration-500">{f.title}</h3>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors duration-500 mt-auto">{f.desc}</p>
                        </motion.div>
                    ))}

                    {/* Extra Bento Block for balance (Mobile App Highlight) */}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
