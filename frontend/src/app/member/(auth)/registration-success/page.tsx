"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Dumbbell, Sparkles, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import CustomButton from "@/components/ui/button/CustomButton";

export default function MemberRegistrationSuccessPage() {
    const router = useRouter();
    const { data: tenantData, isLoading } = useTenantHeader();

    const logoUrl = tenantData?.logo_url;
    const gymName = tenantData?.name || "GYMFIT SYSTEM";

    // Container Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.15,
                duration: 0.5,
                ease: "easeOut" as const
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" as const }
        }
    };

    const checkmarkVariants = {
        hidden: { scale: 0, rotate: -45 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring" as const,
                stiffness: 260,
                damping: 20,
                delay: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans select-none">
            {/* Background Radial Gradient and Grid patterns */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:20px_20px] h-full" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -z-10" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-lg relative z-10"
            >
                {/* Dynamic Branded Header */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-3 mb-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={gymName} className="w-12 h-12 rounded-2xl object-cover bg-white p-0.5 shadow-xl border border-slate-800" />
                        ) : (
                            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
                                <Dumbbell size={26} strokeWidth={2.5} />
                            </div>
                        )}
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-sm font-black uppercase tracking-[0.2em] text-teal-400">
                        {gymName}
                    </motion.h2>
                </div>

                {/* Main Success Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-slate-950/50 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl" />

                    {/* Animated Checkmark */}
                    <div className="flex justify-center mb-6">
                        <motion.div
                            variants={checkmarkVariants}
                            className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/30 text-teal-400 shadow-inner"
                        >
                            <CheckCircle2 size={44} className="text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]" />
                        </motion.div>
                    </div>

                    {/* Header Texts */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-3xl font-black uppercase tracking-tight text-white mb-3"
                    >
                        Pembayaran Diproses
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-sm font-medium leading-relaxed text-slate-400 mb-8 max-w-md mx-auto"
                    >
                        Pendaftaran berhasil dikirim. Sistem sedang memverifikasi transaksi Anda. Akun member akan aktif secara otomatis setelah pembayaran dikonfirmasi.
                    </motion.p>

                    {/* Summary badge row */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl p-4 mb-8 text-left"
                    >
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Status Akun</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-wide text-amber-400">Proses Verifikasi</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Metode Gateway</span>
                            <span className="text-xs font-black uppercase tracking-wide text-teal-400">Midtrans Secure</span>
                        </div>
                    </motion.div>

                    {/* Action button */}
                    <motion.div variants={itemVariants}>
                        <CustomButton
                            className="w-full h-14 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-teal-500/10 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
                            onClick={() => router.push("/member/login")}
                        >
                            Ke Portal Masuk <ArrowRight className="w-4 h-4 text-slate-950" />
                        </CustomButton>
                    </motion.div>

                    {/* Support note */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-center gap-1.5 mt-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest"
                    >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-500/60" /> Aktivasi Instan via Webhook Gateway
                    </motion.div>
                </div>

                {/* Footer security badge */}
                <motion.div
                    variants={itemVariants}
                    className="flex justify-center items-center gap-1.5 mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest"
                >
                    <Lock className="w-3 h-3" /> Transaksi Aman & Terenkripsi SSL
                </motion.div>
            </motion.div>
        </div>
    );
}
