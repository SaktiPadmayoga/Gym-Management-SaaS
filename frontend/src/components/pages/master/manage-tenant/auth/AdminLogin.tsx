"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useAdminAuth } from "@/providers/AdminAuthProvider";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface LoginFormData {
    email:    string;
    password: string;
}

export default function AdminLogin() {
    const { login, isLoading, admin, isReady } = useAdminAuth();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<LoginFormData>({
        mode: "onChange",
        defaultValues: { email: "", password: "" },
    });

    useEffect(() => {
        if (!isReady || !admin) return;
        router.replace("/admin/dashboard");
    }, [isReady, admin, router]);

    if (!isReady) return null;
    if (admin) return null;

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
        } catch (err: any) {
            const message = err?.response?.data?.message ?? "Login failed";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center font-sans p-4 md:p-6 lg:p-8 relative overflow-hidden">
            <Toaster position="top-center" />

            {/* Background Grid - Industrial SaaS Feel */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 lg:gap-6 items-stretch">
                
                {/* --- SEBELAH KIRI: VISUAL BRANDING FITNICE --- */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 rounded-[2.5rem] bg-slate-950 p-10 flex flex-col justify-between relative overflow-hidden border border-slate-800"
                >
                    {/* --- SILUET TIPIS BACKGROUND --- */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {/* Gambar Siluet */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.15] mix-blend-luminosity grayscale"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }} 
                        />
                        {/* Gradient Masking agar gambar menyatu halus dengan warna hitam */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-slate-950/80" />
                    </div>

                    {/* Abstract Ornament Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 pointer-events-none z-0" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-10 -ml-16 -mb-16 pointer-events-none z-0" />

                    <div className="relative z-10">
                        {/* Logo Fitnice */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Dumbbell className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-white uppercase tracking-tighter">
                                Fitnice<span className="text-teal-400">.</span>
                            </span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-6">
                            Admin <br />
                            <span className="text-teal-400">Workspace.</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">
                            Pusat kendali utama untuk mengelola operasional, member, dan pertumbuhan bisnis gym Anda.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 pt-12 border-t border-slate-800">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-teal-400 backdrop-blur-md">
                            <Activity size={20} strokeWidth={2} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Sistem berjalan optimal. Siap melayani <br /> aktivitas bisnis Anda hari ini.
                        </p>
                    </div>
                </motion.div>


                {/* --- SEBELAH KANAN: FORM LOGIN --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full md:w-md shrink-0 rounded-[2.5rem] bg-white border border-slate-200 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden"
                >
                     {/* Subtle Teal Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-teal-500 rounded-b-full" />

                    <div className="mb-10 text-center flex flex-col items-center">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Welcome Back</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Masuk ke dashboard admin Anda</p>
                    </div>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                            <TextInput
                                name="email"
                                label="Alamat Email"
                                placeholder="admin@fitnice.io"
                                type="email"
                            />

                            <div className="relative group">
                                <TextInput
                                    name="password"
                                    label="Kata Sandi"
                                    placeholder="••••••••••••"
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[32px] p-1.5 text-slate-400 hover:text-teal-600 transition-colors bg-white rounded-md group-focus-within:text-teal-500"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="mt-1.5 w-4 h-4" />
                                    ) : (
                                        <Eye className="mt-1.5 w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            <CustomButton
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-950 hover:bg-slate-800 text-white h-14 mt-6 text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
                            >
                                {isLoading ? "Memproses..." : "Sign In"}
                            </CustomButton>
                        </form>
                    </FormProvider>

                    {/* Footer */}
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-12">
                        &copy; 2026 Fitnice OS. All rights reserved.
                    </p>
                </motion.div>

            </div>
        </div>
    );
}