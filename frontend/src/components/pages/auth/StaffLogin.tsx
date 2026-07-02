"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { Building2, Dumbbell, Users, CheckCircle2, Activity } from "lucide-react";
import { motion } from "framer-motion";

// Components
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";

// Hooks & Providers
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";
import Link from "next/link";

/* =========================
 * UTILS
 * ========================= */
// Fungsi untuk mengecek apakah warna gelap (untuk teks kontras)
function isColorDark(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) || 255;
    const g = parseInt(c.substring(2, 4), 16) || 255;
    const b = parseInt(c.substring(4, 6), 16) || 255;

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

/* =========================
 * LOGIN FORM COMPONENT
 * ========================= */
interface LoginFormProps {
    primaryColor: string;
}

function LoginForm({ primaryColor }: LoginFormProps) {
    const { login, loginWithGoogle, isLoading } = useStaffAuth();

    const form = useForm({ defaultValues: { email: "", password: "" } });

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            await login(data.email, data.password);
        } catch (err) {
            let message = "Login gagal";
            const error = err as any;

            if (error?.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0] as string[];
                message = firstError[0] || "Validasi gagal";
            } else if (error?.response?.data?.message) {
                message = error.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            toast.error(message, { duration: 6000 });
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <TextInput name="email" label="Alamat Email" placeholder="staff@gym.com" type="email" />

                <TextInput name="password" label="Kata Sandi" placeholder="••••••••••••" type="password" />

                <div className="flex items-center justify-between mt-[-8px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 focus:ring-2 focus:ring-offset-1" style={{ accentColor: primaryColor }} />
                        <span className="text-xs font-semibold text-zinc-500">Ingat saya</span>
                    </label>
                    <Link href="/tenant-auth/forgot-password" className="text-xs font-bold transition-colors hover:opacity-80" style={{ color: primaryColor }}>
                        Lupa sandi?
                    </Link>
                </div>

                <CustomButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 mt-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    style={{
                        backgroundColor: primaryColor,
                        color: isColorDark(primaryColor) ? "#ffffff" : "#18181b",
                        boxShadow: `0 10px 25px -5px ${primaryColor}40`,
                    }}
                >
                    {isLoading ? "Memproses..." : "Masuk ke Portal"}
                </CustomButton>

                <div className="flex items-center gap-3 my-2">
                    <hr className="flex-1 border-zinc-100" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">atau masuk dengan</span>
                    <hr className="flex-1 border-zinc-100" />
                </div>

                <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full h-14 flex items-center justify-center gap-3 border border-zinc-200 bg-white rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google Workspace
                </button>
            </form>
        </FormProvider>
    );
}

/* =========================
 * MAIN PAGE
 * ========================= */
export default function StaffLoginPage() {
    const { isReady, staff, selectedBranch, globalRole } = useStaffAuth();
    const router = useRouter();

    // Fetch Tenant Branding Data
    const { data: tenant, isLoading: isTenantLoading } = useTenantHeader();
    const { data: publicSettings } = usePublicBranchSettings(undefined);

    const primaryColor = publicSettings?.primary_color ?? "#0f766e"; // Default Teal
    const logoUrl = publicSettings?.logo_url || tenant?.logo_url || "/images/logobaru.webp";
    const tenantName = tenant?.name ?? "Loading Workspace...";

    useEffect(() => {
        router.prefetch("/dashboard");
        router.prefetch("/owner/dashboard");
    }, [router]);

    // Hanya loading state saat auth belum siap (pertama kali mount)
    if (!isReady || isTenantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Tentukan URL dashboard berdasarkan role
    const dashboardUrl = globalRole === "owner" ? "/owner/dashboard" : "/dashboard";

    return (
        <div className="min-h-screen bg-white flex font-sans overflow-hidden">
            <Toaster position="top-center" />

            {/* ========================================================= */}
            {/* KIRI: VISUAL BRANDING & GYM SAAS VIBE (Sembunyi di Mobile) */}
            {/* ========================================================= */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden">
                {/* Gym Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
                    style={{ backgroundImage: "url('/images/tenant-gym-2.webp')" }}
                />

                {/* Gradient Masking dengan Hint PrimaryColor milik Tenant */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-20 mix-blend-color" style={{ backgroundColor: primaryColor }} />

                {/* Top Branding (Tenant Logo & Name) */}
                <div className="relative z-10 flex items-center gap-4">
                    {logoUrl ? (
                        <img src={logoUrl} alt={tenantName} className="w-12 h-12 rounded-xl object-cover bg-white p-0.5 shadow-lg" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <span className="text-2xl font-black text-white uppercase tracking-tighter">{tenantName}</span>
                </div>

                {/* Bottom Copywriting */}
                <div className="relative z-10">
                    <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        Staff & <br />
                        <span style={{ color: primaryColor }}>Management.</span>
                    </h1>
                    <p className="text-sm font-semibold text-zinc-400 max-w-md leading-relaxed">Sistem terpusat untuk memantau kehadiran, jadwal kelas, dan operasional harian fasilitas {tenantName}.</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-6">Powered by GYMFIT OS</p>
                </div>
            </div>

            {/* ========================================================= */}
            {/* KANAN: FORM LOGIN AREA                                      */}
            {/* ========================================================= */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
                {/* Mobile Header (Hanya muncul jika di HP) */}
                <div className="absolute top-8 left-6 lg:hidden flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={tenantName} className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <span className="text-lg font-black text-zinc-900 uppercase tracking-tighter">{tenantName}</span>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">
                            <Activity className="w-3 h-3" style={{ color: primaryColor }} />
                            Portal Staf
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter uppercase mb-2">Selamat Datang Kembali</h2>
                        <p className="text-sm font-medium text-zinc-500">Silakan masuk menggunakan kredensial staf Anda.</p>
                    </div>

                    {/* Mengoper primaryColor ke form komponen */}
                    <LoginForm primaryColor={primaryColor} />

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
