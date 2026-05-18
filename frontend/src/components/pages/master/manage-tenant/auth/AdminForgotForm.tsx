"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter } from "next/navigation";
import { Dumbbell, ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";

interface ForgotFormData {
    email: string;
}

export default function AdminForgotForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const form = useForm<ForgotFormData>({
        mode: "onChange",
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: ForgotFormData) => {
        try {
            setIsLoading(true);
            const response = await apiClient.post("/admin/auth/forgot-password", {
                email: data.email
            });
            setIsSuccess(true);
            toast.success(response.data.message || "Link reset telah dikirim.");
        } catch (err: any) {
            const message = err?.response?.data?.message ?? "Terjadi kesalahan";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center font-sans p-4 md:p-6 lg:p-8 relative overflow-hidden">
            <Toaster position="top-center" />

            {/* Background Grid - Industrial SaaS Feel */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full shrink-0 rounded-[2.5rem] bg-white border border-slate-200 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden"
                >
                     {/* Subtle Teal Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-teal-500 rounded-b-full" />

                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
                            <Dumbbell className="w-5 h-5 text-teal-400" />
                        </div>
                        <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                            Fitnice<span className="text-teal-500">.</span>
                        </span>
                    </div>

                    {!isSuccess ? (
                        <>
                            <div className="mb-10 text-center flex flex-col items-center">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Lupa Kata Sandi</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                                    Masukkan email Anda untuk mereset kata sandi.
                                </p>
                            </div>

                            <FormProvider {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                                    <TextInput
                                        name="email"
                                        label="Alamat Email"
                                        placeholder="admin@fitnice.io"
                                        type="email"
                                    />

                                    <CustomButton
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-slate-950 hover:bg-slate-800 text-white h-14 mt-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-[0.98] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                                        {!isLoading && <Send className="w-4 h-4" />}
                                    </CustomButton>
                                </form>
                            </FormProvider>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-8 h-8 text-teal-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4">Email Terkirim</h2>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                                Kami telah mengirimkan tautan untuk mereset kata sandi Anda ke <strong>{form.getValues('email')}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center border-t border-slate-100 pt-8">
                        <button 
                            type="button" 
                            onClick={() => router.push('/auth/login')}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Login
                        </button>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
