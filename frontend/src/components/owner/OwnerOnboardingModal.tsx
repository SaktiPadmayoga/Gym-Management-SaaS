"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Sparkles, 
    Building2, 
    Users, 
    CreditCard, 
    ArrowRight, 
    Check, 
    Dumbbell,
    X,
    TrendingUp,
    LayoutDashboard
} from "lucide-react";
import CustomButton from "@/components/ui/button/CustomButton";

interface OwnerOnboardingModalProps {
    tenantName?: string;
    onClose?: () => void;
}

export default function OwnerOnboardingModal({ tenantName = "Gym Anda", onClose }: OwnerOnboardingModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    useEffect(() => {
        // Cek localStorage apakah onboarding sudah pernah ditampilkan
        const isShown = localStorage.getItem("gymfit_owner_onboarding_shown");
        if (!isShown) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("gymfit_owner_onboarding_shown", "true");
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    if (!isOpen) return null;

    const stepsData = [
        {
            title: "Selamat Datang di GymFit!",
            subtitle: "Mari kelola bisnis fitness Anda dengan lebih cerdas.",
            description: "Sebagai Owner, Anda memegang kendali penuh atas seluruh operasional gym. Dashboard ini dirancang khusus untuk memberikan visibilitas total terhadap pertumbuhan bisnis Anda.",
            icon: <Sparkles className="w-10 h-10 text-teal-500 animate-pulse" />,
            color: "bg-teal-50 border-teal-100",
            bullets: [
                { icon: <TrendingUp className="w-4 h-4 text-teal-600" />, text: "Pantau revenue konsolidasi dari seluruh cabang secara real-time." },
                { icon: <LayoutDashboard className="w-4 h-4 text-teal-600" />, text: "Analisis statistik check-in harian dan pendaftaran member baru." }
            ]
        },
        {
            title: "Konfigurasi Cabang & Layanan",
            subtitle: "Langkah awal sebelum meluncurkan pendaftaran online.",
            description: "Untuk memulai, Anda perlu menyiapkan infrastruktur dasar gym Anda agar calon member dapat mulai mendaftar dan melakukan transaksi.",
            icon: <Building2 className="w-10 h-10 text-indigo-500" />,
            color: "bg-indigo-50 border-indigo-100",
            bullets: [
                { icon: <Building2 className="w-4 h-4 text-indigo-600" />, text: "Atur detail cabang, jam operasional, dan kapasitas di Pengaturan Cabang." },
                { icon: <CreditCard className="w-4 h-4 text-indigo-600" />, text: "Buat Paket Keanggotaan (Membership Plan) di menu Master Data." }
            ]
        },
        {
            title: "Siap Kolaborasi dengan Tim?",
            subtitle: "Undang staff dan kelola peran dengan aman.",
            description: "GymFit mendukung multi-role access control (RBAC). Anda dapat mendaftarkan staff dengan tugas spesifik tanpa khawatir kebocoran data sensitif.",
            icon: <Users className="w-10 h-10 text-violet-500" />,
            color: "bg-violet-50 border-violet-100",
            bullets: [
                { icon: <Users className="w-4 h-4 text-violet-600" />, text: "Mendaftarkan Manager Cabang, Kasir, Resepsionis, dan Personal Trainer." },
                { icon: <Check className="w-4 h-4 text-violet-600" />, text: "Setiap staff hanya akan melihat menu yang sesuai dengan perannya." }
            ]
        }
    ];

    const currentStepData = stepsData[step - 1];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop Blur overlay */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 overflow-hidden z-10 flex flex-col min-h-[480px]"
                >
                    {/* Header Decorative Pattern */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 via-indigo-500 to-violet-500" />
                    
                    {/* Close Button */}
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Content Section */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* Step Logo/Icon Container */}
                            <div className="flex items-center gap-3">
                                <div className={`p-4 rounded-2xl border ${currentStepData.color} flex items-center justify-center`}>
                                    {currentStepData.icon}
                                </div>
                                <div>
                                    <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Panduan Memulai</span>
                                    <h4 className="text-xs font-bold text-slate-400">Langkah {step} dari {totalSteps}</h4>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-none">
                                    {currentStepData.title}
                                </h3>
                                <p className="text-sm font-bold text-slate-500">
                                    {currentStepData.subtitle}
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed pt-2">
                                    {currentStepData.description}
                                </p>
                            </div>

                            {/* Bullets/Tips */}
                            <div className="space-y-3 pt-2">
                                {currentStepData.bullets.map((bullet, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                        <div className="mt-0.5 p-1 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
                                            {bullet.icon}
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 leading-normal">
                                            {bullet.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                            {/* Step Indicators */}
                            <div className="flex gap-1.5">
                                {Array.from({ length: totalSteps }).map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx + 1 === step ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-200"
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-2">
                                {step > 1 && (
                                    <button 
                                        type="button"
                                        onClick={handlePrev}
                                        className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
                                    >
                                        Kembali
                                    </button>
                                )}
                                
                                <CustomButton
                                    type="button"
                                    onClick={handleNext}
                                    className="px-5 h-10 bg-slate-950 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
                                >
                                    {step === totalSteps ? (
                                        <>Mulai Jelajah <Check className="w-3.5 h-3.5" /></>
                                    ) : (
                                        <>Lanjut <ArrowRight className="w-3.5 h-3.5" /></>
                                    )}
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
