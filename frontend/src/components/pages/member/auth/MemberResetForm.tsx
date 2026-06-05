"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Dumbbell, Activity, Eye, EyeOff } from "lucide-react";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";
import { motion } from "framer-motion";
import memberApiClient from "@/lib/member-api-client";

interface ResetFormData {
    password: string;
    password_confirmation: string;
}

function isColorDark(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) || 255;
    const g = parseInt(c.substring(2, 4), 16) || 255;
    const b = parseInt(c.substring(4, 6), 16) || 255;

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

export default function MemberResetForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    // Fetch Tenant Branding Data
    const { data: tenant, isLoading: isTenantLoading } = useTenantHeader();
    const { data: publicSettings } = usePublicBranchSettings(undefined);

    const primaryColor = publicSettings?.primary_color ?? "#2563eb"; // default to brand blue
    const logoUrl = publicSettings?.logo_url || tenant?.logo_url || "/images/logobaru.png";
    const tenantName = tenant?.name ?? "Workspace...";

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
            const response = await memberApiClient.post("/member/auth/reset-password", {
                email,
                token,
                password: data.password,
                password_confirmation: data.password_confirmation
            });
            
            toast.success(response.data.message || "Kata sandi berhasil direset.");
            
            setTimeout(() => {
                router.push("/member/login");
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
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex font-sans overflow-hidden">
            <Toaster position="top-center" />

            {/* ========================================================= */}
            {/* KIRI: VISUAL BRANDING & LIFESTYLE MOTIVATION (Sembunyi di Mobile) */}
            {/* ========================================================= */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden">
                {/* Gym Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
                />

                {/* Gradient Masking */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-20 mix-blend-color" style={{ backgroundColor: primaryColor }} />

                {/* Top Branding (Tenant Logo & Name) */}
                <div className="relative z-10 flex items-center gap-4">
                    {logoUrl ? (
                        <img src={logoUrl} alt={tenantName} className="w-12 h-12 rounded-xl object-cover bg-white p-0.5 shadow-lg" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                            <Dumbbell className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <span className="text-2xl font-black text-white uppercase tracking-tighter">{tenantName}</span>
                </div>

                {/* Bottom Copywriting */}
                <div className="relative z-10">
                    <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        TRAIN. HARDER.
                        <br />
                        <span style={{ color: primaryColor }}>TRANSFORM.</span>
                    </h1>
                    <p className="text-sm font-semibold text-zinc-400 max-w-md leading-relaxed">Buat kata sandi baru yang aman untuk melindungi akun portal member Anda.</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-6">Powered by GYMFIT</p>
                </div>
            </div>

            {/* ========================================================= */}
            {/* KANAN: FORM RESET SANDI AREA                                  */}
            {/* ========================================================= */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
                {/* Mobile Header (Hanya muncul di HP) */}
                <div className="absolute top-8 left-6 lg:hidden flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={tenantName} className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                            <Dumbbell className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <span className="text-lg font-black text-zinc-900 uppercase tracking-tighter">{tenantName}</span>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">
                            <Activity className="w-3 h-3 animate-pulse" style={{ color: primaryColor }} />
                            Pemulihan Akun
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter uppercase mb-2">Buat Sandi Baru</h2>
                        <p className="text-sm font-medium text-zinc-500">
                            Untuk akun <span className="font-bold text-zinc-700">{email}</span>
                        </p>
                    </div>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                            
                            <div className="relative">
                                <TextInput
                                    name="password"
                                    label="Kata Sandi Baru"
                                    placeholder="Min. 8 karakter"
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[34px] p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors bg-transparent rounded-md focus:outline-none flex items-center justify-center"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative">
                                <TextInput
                                    name="password_confirmation"
                                    label="Konfirmasi Kata Sandi"
                                    placeholder="Ulangi kata sandi baru"
                                    type={showConfirmPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[34px] p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors bg-transparent rounded-md focus:outline-none flex items-center justify-center"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <CustomButton
                                type="submit"
                                disabled={isLoading || !token || !email}
                                className="w-full h-14 mt-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: primaryColor,
                                    color: isColorDark(primaryColor) ? "#ffffff" : "#18181b",
                                    boxShadow: `0 10px 25px -5px ${primaryColor}40`,
                                }}
                            >
                                {isLoading ? "Menyimpan..." : "Simpan Kata Sandi"}
                                {!isLoading && <Save className="w-4 h-4" />}
                            </CustomButton>
                        </form>
                    </FormProvider>

                    {/* Security Notice */}
                    <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sistem Terenkripsi & Terlindungi</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
