"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Dumbbell, CreditCard, Lock, Sparkles, ArrowRight, ArrowLeft, Loader2, AlertCircle, Activity } from "lucide-react";

import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { useAvailableMembershipPlans } from "@/hooks/tenant/useMembershipPlans";
import { memberRegistrationAPI, RegisterMemberRequest } from "@/lib/api/tenant/memberRegistration";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

type ApiValidationError = {
    response?: {
        data?: {
            message?: string;
            errors?: string[] | Record<string, string[]>;
        };
    };
};

function getApiErrorMessage(error: unknown): string {
    const apiError = error as ApiValidationError;
    const errors = apiError.response?.data?.errors;

    if (Array.isArray(errors)) {
        return errors[0] || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
    }

    if (errors && typeof errors === "object") {
        const firstError = Object.values(errors).flat()[0];
        if (firstError) return firstError;
    }

    return apiError.response?.data?.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
}

const formatRupiah = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planIdParam = searchParams.get("plan_id");
    const branchIdParam = searchParams.get("branch_id");

    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState(1);
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- DATA FETCHING & MUTATIONS ---
    const { data: tenantData } = useTenantHeader();
    const { data: plansData, isLoading: isLoadingPlans, isError: isErrorPlans } = useAvailableMembershipPlans({
        branch_id: branchIdParam || undefined,
    });
    
    const { isReady: isSnapReady, pay } = useMidtransSnap();

    // Auto-fill selected plan
    useEffect(() => {
        if (plansData && plansData.length > 0) {
            if (planIdParam && plansData.some(p => p.id === planIdParam)) {
                setSelectedPlanId(planIdParam);
            } else {
                setSelectedPlanId(plansData[0].id);
            }
        }
    }, [plansData, planIdParam]);

    // Find current active plan
    const selectedPlan = plansData?.find(p => p.id === selectedPlanId);
    const planPrice = selectedPlan ? (typeof selectedPlan.price === "string" ? parseFloat(selectedPlan.price) : selectedPlan.price) : 0;
    const total = planPrice;

    // --- FORM SETUP ---
    const form = useForm<RegisterMemberRequest>({
        mode: "onChange",
        defaultValues: {
            plan_id: "",
            name: "",
            email: "",
            phone: "",
            password: "",
            password_confirmation: "",
        },
    });

    const handleNextStep = async () => {
        const isValid = await form.trigger(["name", "email", "phone", "password", "password_confirmation"]);
        if (isValid && selectedPlanId) {
            setStep(2);
        } else if (!selectedPlanId) {
            toast.error("Silakan pilih paket membership terlebih dahulu.");
        }
    };

    const onSubmit = async (data: RegisterMemberRequest) => {
        if (!selectedPlanId) {
            toast.error("Pilih paket membership terlebih dahulu.");
            return;
        }

        if (!isSnapReady) {
            toast.error("Menu pembayaran masih dimuat. Coba lagi sebentar.");
            return;
        }

        const payload: RegisterMemberRequest = {
            ...data,
            plan_id: selectedPlanId,
        };

        if (payload.password !== payload.password_confirmation) {
            toast.error("Konfirmasi password tidak cocok.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await memberRegistrationAPI.register(payload, branchIdParam || undefined);
            const snapToken = response.snap_token;

            if (!snapToken) {
                toast.error("Gagal mendapatkan token pembayaran.");
                setIsLoading(false);
                return;
            }

            pay(snapToken, {
                onSuccess: () => {
                    toast.success("Pembayaran berhasil diproses!");
                    setTimeout(() => {
                        router.push("/member/registration-success");
                    }, 2000);
                },
                onPending: () => {
                    toast.info("Pembayaran pending. Selesaikan tagihan Anda.");
                    setTimeout(() => {
                        router.push("/member/login");
                    }, 3000);
                },
                onError: () => {
                    toast.error("Pembayaran gagal. Silakan coba lagi.");
                    setIsLoading(false);
                },
                onClose: () => {
                    toast.warning("Jendela pembayaran ditutup. Selesaikan pembayaran via login.");
                    setIsLoading(false);
                },
            });
        } catch (error) {
            console.error(error);
            toast.error(getApiErrorMessage(error));
            setIsLoading(false);
        }
    };

    const logoUrl = tenantData?.logo_url || "/images/logobaru.png";
    const gymName = tenantData?.name || "GYMFIT SYSTEM";

    return (
        <div className="min-h-screen lg:h-screen bg-zinc-950 text-white flex flex-col lg:flex-row font-sans selection:bg-blue-500/30 selection:text-white lg:overflow-hidden">
            <Toaster position="top-center" richColors />

            {/* --- LEFT SIDE: BRANDING --- */}
            <div className="hidden lg:flex lg:w-[40%] bg-zinc-950 p-12 text-white flex-col justify-between relative overflow-hidden border-r border-zinc-900/80">
                {/* Background Image and Overlays */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" 
                        alt="Gym Member Training" 
                        className="w-full h-full object-cover opacity-25 scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
                    {/* Glowing Accent Orbs */}
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="inline-flex items-center gap-3 mb-12">
                            {logoUrl ? (
                                <img src={logoUrl} alt={gymName} className="w-10 h-10 rounded-xl object-cover bg-white p-0.5 shadow-md" />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                    <Dumbbell size={22} strokeWidth={2.5} />
                                </div>
                            )}
                            <span className="text-lg font-black tracking-tight uppercase">{gymName}</span>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-6">
                                <Sparkles size={10} className="fill-blue-400 text-blue-400 animate-pulse" />
                                Portal Pendaftaran Member
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-6">
                                BENTUK FISIK <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">TERBAIKMU.</span>
                            </h1>
                            <p className="text-zinc-450 text-sm font-medium max-w-sm leading-relaxed mb-10 text-zinc-400">
                                Selamat datang! Selangkah lagi untuk memulai perjalanan kebugaran Anda. Daftarkan akun Anda dan mulailah berlatih hari ini.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Akses masuk instan via QR Code member di lobi",
                                    "Booking kelas & atur jadwal latihan langsung dari HP",
                                    "Pendampingan Personal Trainer bersertifikasi",
                                    "Pembayaran aman & instan via Midtrans"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-zinc-355 text-zinc-300">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Step Indicator on Left Side */}
                    <div className="flex gap-2 mt-8">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "w-12 bg-blue-500" : "w-6 bg-zinc-800"}`} />
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? "w-12 bg-blue-500" : "w-6 bg-zinc-800"}`} />
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: FORM MULTI-STEP --- */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto h-full min-h-0 bg-zinc-950 relative">
                {/* Glowing radial background orb behind the form */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

                <div className="w-full max-w-xl bg-zinc-900/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-zinc-800/60 shadow-2xl relative z-10 [&_input]:text-zinc-100 [&_input]:placeholder:text-zinc-650 [&_input]:bg-zinc-950/40 [&_input]:border-zinc-850/80 [&_input:focus]:border-blue-500 [&_input:focus]:ring-1 [&_input:focus]:ring-blue-500/20 [&_p.block]:text-zinc-300 [&_p.text-red-500]:text-red-400">
                    <div className="min-h-0 flex flex-col">
                        {/* Mobile Top Navigation (Hanya muncul di HP) */}
                        <div className="lg:hidden flex items-center justify-between w-full mb-6 pb-4 border-b border-zinc-800/80">
                            <div className="flex items-center gap-3">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={gymName} className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm" />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black">
                                        <Dumbbell className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <span className="text-base font-black text-white uppercase tracking-tighter">{gymName}</span>
                            </div>
                            <Link href="/member/login" className="text-xs font-bold text-blue-400 hover:underline">
                                Portal Masuk
                            </Link>
                        </div>

                        {/* HEADER & PROGRESS TEXT */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3">
                                        <Activity className="w-3 h-3 animate-pulse" />
                                        Mulai Perjalanan Kebugaranmu
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase text-white mb-1">
                                        {step === 1 ? "Pilih Paket & Akun" : "Review & Pembayaran"}
                                    </h2>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                        {step === 1 ? "Langkah 1 dari 2: Informasi Layanan & Profil" : "Langkah 2 dari 2: Ringkasan & Checkout"}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Animated step progress line */}
                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                                    style={{ width: step === 1 ? "50%" : "100%" }}
                                />
                            </div>
                        </div>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                                <AnimatePresence mode="wait">
                                    {/* ================= STEP 1: PLAN SELECTOR & BIODATA ================= */}
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="flex-1 space-y-5">
                                            {/* PLAN SELECTOR FETCHED FROM API */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Pilihan Paket Membership</h3>
                                                </div>

                                                {isLoadingPlans ? (
                                                    <div className="flex justify-center items-center py-8">
                                                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                                    </div>
                                                ) : isErrorPlans ? (
                                                    <div className="bg-red-950/20 border border-red-900/50 text-red-400 text-xs font-bold p-4 rounded-xl flex gap-2">
                                                        <AlertCircle className="w-4 h-4" /> Gagal memuat paket membership.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                                                        {plansData?.map((plan) => {
                                                            const isSelected = selectedPlanId === plan.id;
                                                            
                                                            return (
                                                                <div
                                                                    key={plan.id}
                                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col ${
                                                                        isSelected 
                                                                            ? "border-blue-500 bg-blue-950/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                                                                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
                                                                    }`}
                                                                >
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <h4 className={`font-bold uppercase tracking-tight text-xs ${isSelected ? "text-blue-400" : "text-zinc-200"}`}>{plan.name}</h4>
                                                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                                                    </div>

                                                                    <div className="flex items-end gap-1 mb-1">
                                                                        <span className="text-base font-black tracking-tighter leading-none text-white">
                                                                            {formatRupiah(plan.price)}
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-[10px] font-bold text-zinc-400 capitalize">
                                                                        Durasi: {plan.duration} {plan.duration_unit === 'month' ? 'Bulan' : plan.duration_unit === 'day' ? 'Hari' : plan.duration_unit === 'week' ? 'Minggu' : 'Tahun'}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* MEMBER INFO */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 border-b border-zinc-800 pb-2">Informasi Profil Member</h3>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="sm:col-span-2">
                                                        <TextInput name="name" label="Nama Lengkap" placeholder="Cth: Budi Santoso" rules={{ required: "Nama lengkap wajib diisi" }} />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <TextInput name="phone" label="No. Telepon / WhatsApp" placeholder="Cth: 08123456789" rules={{ required: "Nomor WhatsApp wajib diisi" }} />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <TextInput name="email" label="Alamat Email" type="email" placeholder="Cth: budi@email.com" rules={{ required: "Email wajib diisi" }} />
                                                    </div>

                                                    <TextInput name="password" label="Buat Password" type="password" placeholder="Minimal 8 karakter" rules={{ required: "Password wajib diisi", minLength: { value: 8, message: "Minimal 8 karakter" } }} />
                                                    <TextInput name="password_confirmation" label="Konfirmasi Password" type="password" placeholder="Ketik ulang password" rules={{ required: "Konfirmasi password wajib diisi" }} />
                                                </div>
                                            </div>

                                            <div className="pt-2 mt-auto">
                                                <CustomButton
                                                    type="button"
                                                    onClick={handleNextStep}
                                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 border border-blue-400/20"
                                                >
                                                    Lanjut ke Pembayaran <ArrowRight className="w-4 h-4 text-blue-200" />
                                                </CustomButton>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ================= STEP 2: CREDENTIALS & PAY ================= */}
                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col space-y-5">
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 border-b border-zinc-800 pb-2">Ringkasan Pembayaran</h3>

                                                <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-850 space-y-3">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-zinc-400">Paket Terpilih:</span>
                                                        <span className="font-bold text-white uppercase tracking-tight">{selectedPlan?.name || "-"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-zinc-400">Durasi Paket:</span>
                                                        <span className="font-semibold text-zinc-350 capitalize">
                                                            {selectedPlan ? `${selectedPlan.duration} ${selectedPlan.duration_unit === 'month' ? 'Bulan' : selectedPlan.duration_unit === 'day' ? 'Hari' : selectedPlan.duration_unit === 'week' ? 'Minggu' : 'Tahun'}` : "-"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-zinc-400">Harga Layanan:</span>
                                                        <span className="font-semibold text-zinc-200">{formatRupiah(planPrice)}</span>
                                                    </div>
                                                    <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
                                                        <span className="font-black text-zinc-300 text-[10px] uppercase tracking-wider">Total Tagihan:</span>
                                                        <span className="text-lg font-black text-blue-400">{formatRupiah(total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 mt-auto flex gap-3">
                                                <CustomButton type="button" onClick={() => setStep(1)} className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-700">
                                                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                                                </CustomButton>

                                                <CustomButton
                                                    type="submit"
                                                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 border border-blue-400/20"
                                                    disabled={isLoading || !isSnapReady}
                                                >
                                                    {isLoading ? (
                                                        "Memproses..."
                                                    ) : (
                                                        <>
                                                            Selesaikan & Bayar <CreditCard className="w-4 h-4 text-blue-200" />
                                                        </>
                                                    )}
                                                </CustomButton>
                                            </div>

                                            <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Lock className="w-3 h-3" /> Transaksi Aman & Terenkripsi
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MemberRegistrationPage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            }
        >
            <RegisterForm />
        </Suspense>
    );
}
