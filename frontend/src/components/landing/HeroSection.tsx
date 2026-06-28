"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, MapPin, Building2, ShoppingCart, Receipt, Nfc, Rocket, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";
import Image from "next/image";

const HeroSection = () => {
    const [email, setEmail] = useState("");

    return (
        <section className="relative min-h-screen bg-white text-slate-900 overflow-hidden font-sans pt-24 pb-12">
            {/* Background Grid - Industrial Style */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* --- BLOCK 1: BIG TYPOGRAPHY --- */}
                <div className="lg:col-span-8 flex flex-col justify-between p-10 lg:p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] lg:rounded-[2rem] min-h-[400px] lg:min-h-[350px] relative overflow-hidden">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
                        <h1 className="text-4xl md:text-4xl lg:text-[4.25rem] font-black tracking-tighter leading-[0.85] uppercase">
                            Kelola <br />
                            <span className="text-teal-500">Bisnis Gym</span> <br />
                            Tanpa Batas.
                        </h1>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col md:flex-row items-end justify-between gap-6 mt-12 relative z-10">
                        <p className="max-w-xs text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                            Platform all-in-one untuk keanggotaan, mesin kasir (POS), dan laporan performa yang didesain untuk skalabilitas tinggi.
                        </p>
                    </motion.div>

                    {/* Subtle Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/30 blur-[100px] rounded-full -mr-20 -mt-20" />
                </div>

                {/* --- BLOCK 2: CTA CARD (GRADIENT IMAGE TO FORM) --- */}
                <div className="lg:col-span-4 rounded-[2.5rem] lg:rounded-[2rem] border border-slate-200 flex flex-col justify-between group overflow-hidden relative min-h-[450px] lg:min-h-[400px]">
                    {/* Background Image with Gradient Overlay */}
                    <Image
                        src="/images/hero.webp"
                        alt="Gym Management"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                    />
                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-black/60 to-teal-900/95" />

                    <div className="relative z-20 p-8 lg:p-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
                            <Zap size={24} className="text-white fill-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight uppercase">
                            Ajukan <br /> Trial Sistem.
                        </h2>
                        <p className="text-teal-200 font-bold text-xs mt-2 uppercase tracking-widest">Optimalkan bisnis Anda sekarang</p>
                    </div>

                    <div className="relative z-20 p-8 lg:p-4 pt-0 lg:pt-0">
                        <div className="space-y-3">
                            <Button className="w-full bg-white text-teal-700 hover:bg-teal-50 font-black h-14 rounded-2xl uppercase shadow-2xl transition-transform active:scale-95 flex">
                                <NavLink to="/create-trial" className="flex items-center justify-center w-full">
                                    Mulai Trial Gratis
                                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                </NavLink>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* --- NEW GRIDS START HERE --- */}
                {/* ========================================== */}

                {/* --- BLOCK 3: MULTI BRANCH MANAGEMENT --- */}
                <div className="lg:col-span-4 bg-slate-950 p-8 lg:p-6 rounded-[2.5rem] lg:rounded-[2rem] border border-slate-800 flex flex-col min-h-[280px] lg:min-h-[240px] relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 size={14} /> Kontrol Multi-Cabang
                        </p>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[8px] text-white font-bold uppercase tracking-widest">Langsung</span>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-center">
                        {/* Branch 1 */}
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                    <MapPin size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white leading-none">GYMFIT HQ</p>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase">Jakarta, ID</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white leading-none">Rp 24.5M</p>
                                <p className="text-[9px] text-emerald-400 mt-1 uppercase font-bold">+12% Hari Ini</p>
                            </div>
                        </div>

                        {/* Branch 2 */}
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                    <MapPin size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white leading-none">GYMFIT Payangan</p>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase">Bali, ID</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white leading-none">Rp 18.2M</p>
                                <p className="text-[9px] text-emerald-400 mt-1 uppercase font-bold">+8% Hari Ini</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-20 -right-20 w-48 h-48 bg-teal-500/10 blur-[60px] rounded-full pointer-events-none" />
                </div>

                {/* --- BLOCK 4: POINT OF SALE (POS) --- */}
                <div className="lg:col-span-4 bg-white p-8 lg:p-6 rounded-[2.5rem] lg:rounded-[2rem] border border-slate-200 flex flex-col min-h-[280px] lg:min-h-[240px]">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ShoppingCart size={14} /> POS / Kasir Terintegrasi
                        </p>
                        <MoreHorizontal size={16} className="text-slate-300" />
                    </div>

                    <div className="flex-1 flex gap-6 items-center">
                        {/* Fake POS Receipt UI */}
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                <span>Transaksi #4092</span>
                                <span>14:32</span>
                            </div>
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Whey Protein Isolate</p>
                                        <p className="text-[10px] text-slate-500">1x Rasa Vanila</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">Rp 450K</p>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Tiket Harian (Daily Pass)</p>
                                        <p className="text-[10px] text-slate-500">1x Drop-in</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">Rp 150K</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Total</p>
                                <p className="text-lg font-black text-teal-600">Rp 600K</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BLOCK 5: EASY SETUP --- */}
                <div className="lg:col-span-4 bg-teal-50 border border-teal-100 rounded-[2.5rem] lg:rounded-[2rem] p-8 lg:p-6 flex flex-col justify-between min-h-[280px] lg:min-h-[240px]">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center mb-5 shadow-md shadow-teal-200">
                            <Rocket size={18} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-[1.1] mb-2 uppercase tracking-tighter">
                            Setup Cepat & <br /> Instan.
                        </h3>
                    </div>

                    <div className="space-y-3 mt-auto">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Daftarkan Gym Anda</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Atur Harga & Paket</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mulai Beroperasi Hari Ini</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
