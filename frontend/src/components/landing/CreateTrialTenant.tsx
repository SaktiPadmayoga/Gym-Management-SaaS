"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";

import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";

// --- HOOK BARU ---
import { useRegisterTrial } from "@/hooks/useRegister";

const timezoneOptions: DropdownOption<string>[] = [
    { key: "Asia/Jakarta", label: "Asia/Jakarta (WIB)", value: "Asia/Jakarta" },
    { key: "Asia/Makassar", label: "Asia/Makassar (WITA)", value: "Asia/Makassar" },
    { key: "Asia/Jayapura", label: "Asia/Jayapura (WIT)", value: "Asia/Jayapura" },
];

export default function CreateTrialTenant() {
    const router = useRouter();
    
    // Gunakan 1 Hook khusus Trial
    const registerTrialMutation = useRegisterTrial();

    const form = useForm({
        mode: "onChange",
        defaultValues: {
            tenant_name: "",
            slug: "",
            owner_name: "",
            owner_email: "",
            password: "",
            timezone: "Asia/Jakarta",
            city: "",
            phone: "",
        },
    });

    // Auto-fill slug berdasarkan nama gym (UX Enhancement)
    const tenantName = form.watch("tenant_name");
    useEffect(() => {
        if (tenantName && !form.getValues("slug")) {
            const autoSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            form.setValue("slug", autoSlug);
        }
    }, [tenantName, form]);

    const onSubmit = async (data: any) => {
        try {
            // 1. Susun Payload sesuai kebutuhan API
            const payload = {
                tenant_name: data.tenant_name,
                slug: data.slug,
                owner_name: data.owner_name,
                owner_email: data.owner_email,
                password: data.password,
                timezone: data.timezone,
                city: data.city,
                phone: data.phone,
            };

            // 2. Eksekusi API Register Trial (Sekali tembak beres semua)
            const response = await registerTrialMutation.mutateAsync(payload);
            
            // Ekstrak domain dari response
            const tenantDomain = response?.data?.tenant_domain || response?.tenant_domain;

            if (!tenantDomain) {
                toast.error("Gagal mendapatkan domain sistem. Hubungi support.");
                return;
            }

            toast.success("Trial berhasil dibuat! Mengarahkan ke sistem Anda...");
            
            // 3. Redirect ke halaman Login Tenant dengan penanganan Port Localhost
            setTimeout(() => {
               
                
                window.location.href = `${tenantDomain}/tenant-auth/login?registered=true`;
            }, 1500);
            
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.message || "Gagal memulai trial. Silakan coba lagi.";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-teal-200">
            <Toaster position="top-center" richColors />

            {/* LEFT SIDE: TRIAL BRANDING */}
            <div className="hidden lg:flex w-[40%] bg-slate-900 p-12 text-white flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-16">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950">
                            <Zap size={24} className="font-bold" />
                        </div>
                        <span className="text-2xl font-black tracking-tight uppercase">Fitnice Trial</span>
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                            Mulai Dalam <br/><span className="text-teal-400">60 Detik.</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-8">
                            Eksplorasi seluruh fitur premium kami selama 14 hari tanpa biaya sepeser pun.
                        </p>
                        <ul className="space-y-4">
                            {["POS & Kasir Cerdas", "Manajemen Multi-Cabang", "Aplikasi Member", "Tanpa Kartu Kredit"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-teal-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE: TRIAL FORM */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900 mb-2">Claim Your Free Trial</h2>
                            <p className="text-sm font-bold text-slate-500 uppercase">Isi data dasar untuk membuat akses Owner.</p>
                        </div>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* DATA PEMILIK */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <TextInput name="owner_name" label="Nama Lengkap"  />
                                        <TextInput name="phone" label="No. WhatsApp"  />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TextInput name="owner_email" label="Email Aktif" type="email"  />
                                        <TextInput name="password" label="Buat Password" type="password" />
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* DATA GYM */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <TextInput name="tenant_name" label="Nama Gym" placeholder="Fitnice Studio"  />
                                        
                                        <div>
                                            <TextInput name="slug" label="Subdomain Sistem" placeholder="fitnice" />
                                            <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">
                                                <span className="text-teal-500 lowercase">{form.watch("slug") || "nama-gym"}</span>.fitnice.id
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SearchableDropdown name="timezone" label="Zona Waktu" options={timezoneOptions} />
                                        <TextInput name="city" label="Kota" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <CustomButton 
                                        type="submit" 
                                        className="w-full h-12 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                                        disabled={registerTrialMutation.isPending}
                                    >
                                        {registerTrialMutation.isPending ? "Menyiapkan Sistem..." : "Buat Sistem Sekarang"}
                                    </CustomButton>
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}