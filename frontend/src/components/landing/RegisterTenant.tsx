"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CheckCircle2, Dumbbell, CreditCard, Lock, 
    Sparkles, ArrowRight, ArrowLeft, Loader2, AlertCircle 
} from "lucide-react";

import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

// --- HOOKS BARU ---
import { usePlans } from "@/hooks/usePlans"; 
import { useRegisterPaid } from "@/hooks/useRegister"; // Hook register baru Anda
import { useMidtransSnap } from "@/hooks/useMidtransSnap"; // Hook Midtrans Snap

const timezoneOptions: DropdownOption<string>[] = [
    { key: "Asia/Jakarta", label: "Asia/Jakarta (WIB)", value: "Asia/Jakarta" },
    { key: "Asia/Makassar", label: "Asia/Makassar (WITA)", value: "Asia/Makassar" },
    { key: "Asia/Jayapura", label: "Asia/Jayapura (WIT)", value: "Asia/Jayapura" },
];

// --- KOMPONEN ISI (Logic & UI asli Anda) ---
function RegisterTenantContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(""); // Sekarang ini akan menyimpan ID/UUID Paket
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    // --- DATA FETCHING & MUTATIONS ---
    const { data: plansData, isLoading: isLoadingPlans, isError: isErrorPlans } = usePlans();
    const publicPlans = plansData?.filter((plan) => plan.is_public) || [];

    const registerPaidMutation = useRegisterPaid();
    const { pay } = useMidtransSnap();

    // Set default selected plan (Mengubah logic agar menyimpan ID Paket, bukan sekedar string 'starter')
    useEffect(() => {
        if (publicPlans.length > 0 && !selectedPlan) {
            const urlPlanCode = searchParams.get("plan");
            if (urlPlanCode) {
                // Cari paket yang codenya sesuai URL (misal ?plan=starter)
                const matchedPlan = publicPlans.find(p => p.code.toLowerCase() === urlPlanCode.toLowerCase());
                setSelectedPlan(matchedPlan?.id ?? publicPlans[0]?.id ?? "");
            } else {
                setSelectedPlan(publicPlans[0]?.id ?? "");
            }
        }
    }, [publicPlans, searchParams, selectedPlan]);

    // --- FORM SETUP ---
    const form = useForm({
        mode: "onChange",
        defaultValues: {
            // Step 1
            owner_name: "",
            owner_email: "",
            password: "",
            phone: "",
            // Step 2
            name: "",
            slug: "",
            city: "",
            timezone: "Asia/Jakarta",
        },
    });

    // Auto-fill slug based on gym name
    const tenantName = form.watch("name");
    useEffect(() => {
        if (tenantName && !form.getValues("slug") && step === 2) {
            const autoSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            form.setValue("slug", autoSlug);
        }
    }, [tenantName, form, step]);

    // --- HELPER FUNCTIONS ---
    const formatPrice = (price: number) => {
        if (price === 0) return { amount: "Custom", suffix: "" };
        if (price >= 1000000) return { amount: (price / 1000000).toString(), suffix: "M" };
        if (price >= 1000) return { amount: (price / 1000).toString(), suffix: "K" };
        return { amount: price.toString(), suffix: "" };
    };

    const handleNextStep = async () => {
        // Validasi field di Step 1 sebelum lanjut ke Step 2
        const isValid = await form.trigger(["owner_name", "owner_email", "password", "phone"]);
        if (isValid && selectedPlan) {
            setStep(2);
        } else if (!selectedPlan) {
            toast.error("Silakan pilih paket langganan terlebih dahulu.");
        }
    };

    // --- LOGIKA UTAMA SUBMIT & PEMBAYARAN ---
    const onSubmit = async (data: any) => {
        try {
            // 1. Susun Payload (Sesuai dengan RegisterPaidPayload type)
            const payload = {
                tenant_name: data.name,
                slug: data.slug,
                owner_name: data.owner_name,
                owner_email: data.owner_email,
                password: data.password,
                timezone: data.timezone,
                city: data.city,
                phone: data.phone,
                plan_id: selectedPlan,
                billing_cycle: billingCycle,
            };

            // 2. Eksekusi API
            // Karena kita sudah me-return `res.data.data` di authAPI, 
            // response di sini sudah langsung berupa objek token.
            const response = await registerPaidMutation.mutateAsync(payload);
            
            const snapToken = response.snap_token;
            const tenantDomain = response.tenant_domain;

            if (!snapToken) {
                toast.error("Sistem gagal menghasilkan token pembayaran.");
                return;
            }

            // 3. Panggil Popup Midtrans Snap
            pay(snapToken, {
                onSuccess: () => {
                    toast.success("Pembayaran berhasil! Menyiapkan sistem Anda...");
                    setTimeout(() => {
                        window.location.href = `http://${tenantDomain}/tenant-auth/login?registered=true`;
                    }, 2000);
                },
                onPending: () => {
                    toast.info("Menunggu penyelesaian pembayaran Anda.");
                    toast.success("Link pembayaran & tagihan telah dikirim ke email Anda.");
                },
                onError: () => {
                    toast.error("Pembayaran gagal. Silakan coba lagi.");
                },
                onClose: () => {
                    toast.info("Jendela pembayaran ditutup.");
                },
            });

        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.message || "Gagal memproses pendaftaran. Periksa kembali data Anda.";
            toast.error(msg);
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex font-sans selection:bg-teal-200 overflow-hidden" >
            <Toaster position="top-center" richColors />

            {/* --- LEFT SIDE: BRANDING --- */}
            <div className="hidden lg:flex w-[45%] bg-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden ">
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px] h-full"/>

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-16">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950">
                            <Dumbbell size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black tracking-tight uppercase">Fitnice</span>
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-teal-400 text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
                            <Lock className="w-3 h-3" /> Secure Checkout
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                            Upgrade Bisnis <br/><span className="text-teal-400">Fitness Anda.</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-md leading-relaxed mb-10">
                            Langkah terakhir untuk mengotomatisasi manajemen member, pembayaran, dan laporan operasional harian gym Anda.
                        </p>

                        <ul className="space-y-5">
                            {["Setup sistem instan setelah pembayaran", "Migrasi data awal dibantu tim support", "Akses penuh ke modul POS & Member", "Dukungan CS Prioritas"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-teal-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
                
                {/* Step Indicator on Left Side */}
                <div className="relative z-10 flex gap-2">
                    <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? "bg-teal-500" : "bg-slate-800"}`} />
                    <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? "bg-teal-500" : "bg-slate-800"}`} />
                </div>
            </div>

            {/* --- RIGHT SIDE: FORM MULTI-STEP --- */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-2 min-h-full">
                <div className="w-full max-w-2xl ">
                    <div className=" p-2 sm:p-12 min-h-[300px] flex flex-col">
                        
                        {/* HEADER & PROGRESS TEXT */}
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 mb-1">
                                    {step === 1 ? "Pilih Paket" : "Detail Bisnis"}
                                </h2>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                                    {step === 1 ? "Langkah 1 dari 2: Profil & Layanan" : "Langkah 2 dari 2: Konfigurasi Sistem"}
                                </p>
                            </div>
                        </div>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                                <AnimatePresence mode="wait">
                                    
                                    {/* ================= STEP 1: PLAN & OWNER INFO ================= */}
                                    {step === 1 && (
                                        <motion.div 
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex-1 space-y-8"
                                        >
                                            {/* PLAN SELECTOR FETCHED FROM API */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                    <h3 className="text-xs font-black uppercase tracking-widest text-teal-500">Paket Berlangganan</h3>
                                                    {/* Toggle Monthly/Yearly */}
                                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                                                        <button type="button" onClick={() => setBillingCycle("monthly")} className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-all ${billingCycle === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}>Bln</button>
                                                        <button type="button" onClick={() => setBillingCycle("yearly")} className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-all ${billingCycle === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}>Thn</button>
                                                    </div>
                                                </div>

                                                {isLoadingPlans ? (
                                                    <div className="flex justify-center items-center py-8">
                                                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                                    </div>
                                                ) : isErrorPlans ? (
                                                    <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl flex gap-2">
                                                        <AlertCircle className="w-4 h-4" /> Gagal memuat paket.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {publicPlans.map((plan, idx) => {
                                                            // PERUBAHAN: Membandingkan ID paket alih-alih nama code
                                                            const isSelected = selectedPlan === plan.id;
                                                            const isPopular = plan.code.toLowerCase().includes("pro") || idx === 1;
                                                            const priceValue = billingCycle === "monthly" ? plan.pricing.monthly : plan.pricing.yearly;
                                                            const { amount, suffix } = formatPrice(priceValue);
                                                            if (amount === "Custom") return null;

                                                            return (
                                                                <div 
                                                                    key={plan.id}
                                                                    onClick={() => setSelectedPlan(plan.id ?? "")}
                                                                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col ${
                                                                        isSelected ? "border-teal-500 bg-teal-50/30 shadow-sm" : "border-slate-100 hover:border-slate-300 bg-white"
                                                                    }`}
                                                                >
                                                                    {isPopular && isSelected && (
                                                                        <div className="absolute -top-2.5 right-4 bg-slate-900 text-teal-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                            <Sparkles className="w-2 h-2" /> Best Value
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <h4 className="font-bold text-slate-900 uppercase tracking-tight">{plan.name}</h4>
                                                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                                                                    </div>
                                                                    <div className="flex items-end gap-1 mb-2">
                                                                        <span className="text-xs font-bold text-slate-400">{plan.pricing.currency === "IDR" ? "Rp" : plan.pricing.currency}</span>
                                                                        <span className="text-2xl font-black tracking-tighter leading-none text-slate-900">{amount}{suffix}</span>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-slate-500 capitalize line-clamp-1">{plan.features[0] || "Akses Fitur Premium"}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* OWNER INFO */}
                                            <div className="space-y-4">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-teal-500 border-b border-slate-100 pb-2">Profil Pemilik (Owner)</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="sm:col-span-2">
                                                        <TextInput name="owner_name" label="Nama Lengkap" placeholder="Cth: Budi Santoso"  />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <TextInput name="phone" label="No. WhatsApp Aktif" placeholder="08123456789"  />
                                                    </div>
                                                    <TextInput name="owner_email" label="Email Login" type="email" placeholder="budi@email.com" />
                                                    <TextInput name="password" label="Buat Password" type="password" placeholder="Minimal 8 karakter" />
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-auto">
                                                <CustomButton type="button" onClick={handleNextStep} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
                                                    Lanjut ke Detail Bisnis <ArrowRight className="w-4 h-4 text-teal-400" />
                                                </CustomButton>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ================= STEP 2: GYM DETAILS ================= */}
                                    {step === 2 && (
                                        <motion.div 
                                            key="step2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex-1 flex flex-col space-y-8"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-teal-500 border-b border-slate-100 pb-2">Detail Cabang Utama</h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <TextInput name="name" label="Nama Gym / Studio" placeholder="Cth: Fitnice Gym & Studio" />
                                                    
                                                    <div>
                                                        <TextInput name="slug" label="URL Sistem Bisnis Anda" placeholder="fitnice-gym" />
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">
                                                            Akses sistem: <span className="text-teal-500 lowercase">{form.watch("slug") || "nama-gym"}</span>.fitnice.id
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <SearchableDropdown name="timezone" label="Zona Waktu" options={timezoneOptions} />
                                                        <TextInput name="city" label="Kota Utama (Pusat)" placeholder="Cth: Gianyar" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-auto flex gap-4">
                                                <CustomButton type="button" onClick={() => setStep(1)} className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
                                                    <ArrowLeft className="w-5 h-5" />
                                                </CustomButton>
                                                <CustomButton 
                                                    type="submit" 
                                                    className="flex-1 h-14 bg-slate-950 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2" 
                                                    disabled={registerPaidMutation.isPending}
                                                >
                                                    {registerPaidMutation.isPending ? "Memproses..." : (
                                                        <>Selesaikan & Bayar <CreditCard className="w-4 h-4 text-teal-400" /></>
                                                    )}
                                                </CustomButton>
                                            </div>
                                            <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Lock className="w-3 h-3" /> Data dijamin aman & terenkripsi
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

// --- KOMPONEN UTAMA (Yang di-export ke Next.js) ---
export default function RegisterTenant() {
    return (
        <Suspense 
            fallback={
                <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                </div>
            }
        >
            <RegisterTenantContent />
        </Suspense>
    );
}