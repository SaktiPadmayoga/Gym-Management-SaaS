"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Eye, EyeOff, Save } from "lucide-react";
import { motion } from "framer-motion";
import tenantApiClient from "@/lib/tenant-api-client";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";

interface ResetFormData {
    password: string;
    password_confirmation: string;
}

export default function StaffResetForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const { data: tenant, isLoading: isTenantLoading } = useTenantHeader();
    const { data: publicSettings } = usePublicBranchSettings(undefined);

    const primaryColor = publicSettings?.primary_color ?? "#0f766e"; 
    const logoUrl = publicSettings?.logo_url ?? null;
    const tenantName = tenant?.name ?? "Workspace";

    const form = useForm<ResetFormData>({
        mode: "onChange",
        defaultValues: { password: "", password_confirmation: "" },
    });

    useEffect(() => {
        if (!token || !email) {
            toast.error("Tautan reset kata sandi tidak valid atau telah kedaluwarsa.");
        }
    }, [token, email]);

    const onSubmit = async (data: ResetFormData) => {
        if (!token || !email) {
            toast.error("Parameter reset tidak valid.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await tenantApiClient.post("/tenant-auth/reset-password", {
                email,
                token,
                password: data.password,
                password_confirmation: data.password_confirmation
            });
            
            toast.success(response.data.message || "Kata sandi berhasil direset.");
            
            setTimeout(() => {
                router.push("/tenant-auth/login");
            }, 2000);
            
        } catch (err: any) {
            const message = err?.response?.data?.message ?? "Gagal mereset kata sandi.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isTenantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center font-sans p-4 md:p-6 lg:p-8 relative overflow-hidden">
            <Toaster position="top-center" />

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full shrink-0 rounded-[2.5rem] bg-white border border-slate-200 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-center relative overflow-hidden"
                >
                    <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full" 
                        style={{ backgroundColor: primaryColor }}
                    />

                    <div className="flex items-center gap-3 mb-8 justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt={tenantName} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                            {tenantName}
                        </span>
                    </div>

                    <div className="mb-10 text-center flex flex-col items-center">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Buat Sandi Baru</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                            Untuk staf <span className="text-slate-600">{email}</span>
                        </p>
                    </div>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                            <div className="relative group">
                                <TextInput
                                    name="password"
                                    label="Kata Sandi Baru"
                                    placeholder="Min. 8 karakter"
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[32px] p-1.5 text-slate-400 hover:text-slate-700 transition-colors bg-white rounded-md"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="mt-1.5 w-4 h-4" /> : <Eye className="mt-1.5 w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative group">
                                <TextInput
                                    name="password_confirmation"
                                    label="Konfirmasi Kata Sandi"
                                    placeholder="Ulangi kata sandi"
                                    type={showConfirmPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[32px] p-1.5 text-slate-400 hover:text-slate-700 transition-colors bg-white rounded-md"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="mt-1.5 w-4 h-4" /> : <Eye className="mt-1.5 w-4 h-4" />}
                                </button>
                            </div>

                            <CustomButton
                                type="submit"
                                disabled={isLoading || !token || !email}
                                className="w-full h-14 mt-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-[0.98] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                                style={{ 
                                    backgroundColor: primaryColor, 
                                    color: '#ffffff',
                                    boxShadow: `0 10px 25px -5px ${primaryColor}40`
                                }}
                            >
                                {isLoading ? "Memproses..." : "Simpan Kata Sandi"}
                                {!isLoading && <Save className="w-4 h-4" />}
                            </CustomButton>
                        </form>
                    </FormProvider>

                </motion.div>
            </div>
        </div>
    );
}
