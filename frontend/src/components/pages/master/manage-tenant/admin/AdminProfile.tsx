"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { Shield, User, Clock, Key, EyeOff, Eye, CheckCircle2 } from "lucide-react";

// Sesuaikan path ini dengan lokasi file hook Anda:
import { 
    useMyProfile, 
    useUpdateAdmin, 
    useUpdatePassword 
} from "@/hooks/useAdmins"; 
import { AdminData } from "@/types/central/admins";

// UI Components
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";

/* =========================================
 * SUB-COMPONENT: FORM UPDATE PROFILE
 * ========================================= */
function ProfileForm({ profile }: { profile: AdminData }) {
    const updateAdminMutation = useUpdateAdmin();
    
    // Auto-fill values dari data profile API
    const form = useForm({
        values: {
            name: profile?.name || "",
            email: profile?.email || "",
        }
    });

    const onSubmit = (data: { name: string; email: string }) => {
        // Asumsi payload Update Admin minimal membutuhkan 'name'
        updateAdminMutation.mutate(
            { 
                id: profile.id, 
                payload: { 
                    name: data.name,
                    // Tambahkan field lain jika API Update Admin mewajibkannya, misal:
                    // role: profile.role,
                    // is_active: profile.is_active,
                } as any 
            },
            {
                onSuccess: () => toast.success("Profil berhasil diperbarui"),
                onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal memperbarui profil")
            }
        );
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInput 
                        name="name" 
                        label="Nama Lengkap" 
                        placeholder="Nama Anda" 
                    />
                    <TextInput 
                        name="email" 
                        label="Alamat Email (Read-only)" 
                        placeholder="email@platform.com" 
                        type="email"
                        disabled // Email biasanya tidak diizinkan diubah lewat profil biasa
                    />
                </div>
                <div className="flex justify-end pt-5 border-t border-zinc-100">
                    <CustomButton 
                        type="submit" 
                        disabled={updateAdminMutation.isPending}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {updateAdminMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </CustomButton>
                </div>
            </form>
        </FormProvider>
    );
}

/* =========================================
 * SUB-COMPONENT: FORM UBAH PASSWORD
 * ========================================= */
function PasswordForm() {
    const updatePasswordMutation = useUpdatePassword();
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const form = useForm({
        defaultValues: {
            current_password: "",
            new_password: "",
            new_password_confirmation: ""
        }
    });

    const toggleShow = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const onSubmit = (data: any) => {
        if (data.new_password !== data.new_password_confirmation) {
            toast.error("Konfirmasi sandi baru tidak cocok!");
            return;
        }

        updatePasswordMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Kata sandi berhasil diubah");
                form.reset(); // Kosongkan form setelah sukses
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Gagal mengubah kata sandi");
            }
        });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <TextInput 
                            name="current_password" 
                            label="Kata Sandi Saat Ini" 
                            placeholder="••••••••••••" 
                            type={showPassword.current ? "text" : "password"}
                        />
                        <button type="button" onClick={() => toggleShow('current')} className="absolute right-3 top-[32px] p-1.5 text-zinc-400 hover:text-zinc-700 bg-white">
                            {showPassword.current ? <EyeOff className="mt-1.5 w-4 h-4"/> : <Eye className="mt-1.5 w-4 h-4"/>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <TextInput 
                            name="new_password" 
                            label="Kata Sandi Baru" 
                            placeholder="••••••••••••" 
                            type={showPassword.new ? "text" : "password"}
                        />
                        <button type="button" onClick={() => toggleShow('new')} className="absolute right-3 top-[32px] p-1.5 text-zinc-400 hover:text-zinc-700 bg-white">
                            {showPassword.new ? <EyeOff className="mt-1.5 w-4 h-4"/> : <Eye className="mt-1.5 w-4 h-4"/>}
                        </button>
                    </div>

                    <div className="relative">
                        <TextInput 
                            name="new_password_confirmation" 
                            label="Konfirmasi Sandi Baru" 
                            placeholder="••••••••••••" 
                            type={showPassword.confirm ? "text" : "password"}
                        />
                        <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-[32px] p-1.5 text-zinc-400 hover:text-zinc-700 bg-white">
                            {showPassword.confirm ? <EyeOff className="mt-1.5 w-4 h-4"/> : <Eye className="mt-1.5 w-4 h-4"/>}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-zinc-100">
                    <CustomButton 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {updatePasswordMutation.isPending ? "Memproses..." : "Perbarui Sandi"}
                    </CustomButton>
                </div>
            </form>
        </FormProvider>
    );
}

/* =========================================
 * MAIN PAGE
 * ========================================= */
export default function AdminProfilePage() {
    const { data: profile, isLoading, isError } = useMyProfile();

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="p-4 md:p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-sm flex items-center justify-center h-40">
                    Gagal memuat data profil. Silakan muat ulang halaman.
                </div>
            </div>
        );
    }

    const initial = profile?.name?.charAt(0).toUpperCase() || "A";
    const formattedDate = profile.created_at 
        ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : "Tidak diketahui";

    return (
        <div className="font-sans max-w-6xl mx-auto w-full pb-12">
            <Toaster position="top-center" />

            {/* --- WADAH PUTIH UTAMA --- */}
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
                
                {/* Header Profil */}
                <div className=" pb-6 mb-7">
                    <h1 className="text-2xl font-semibold text-zinc-900 font-outfit">Profil Admin</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-1">Kelola informasi identitas akun dan atur kredensial keamanan Anda.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
                    
                    {/* --- KOLOM KIRI: INFO AVATAR & STATUS --- */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Status List */}
                        <div className="space-y-4 px-2 border-r border-zinc-100 h-full">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bergabung Sejak</p>
                                    <p className="text-sm font-semibold text-zinc-800">{formattedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status Akun</p>
                                    <p className="text-sm font-semibold text-emerald-600">Aktif & Terverifikasi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- KOLOM KANAN: FORM SETTINGS --- */}
                    <div className="lg:col-span-5 space-y-5">
                        
                        {/* Seksi: Data Personal */}
                        <section>
                            <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-teal-500" />
                                Informasi Personal
                            </h3>
                            <ProfileForm profile={profile} />
                        </section>

                        {/* Seksi: Keamanan */}
                        <section className="">
                            <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2">
                                <Key className="w-4 h-4 text-zinc-400" />
                                Ubah Kata Sandi
                            </h3>
                    
                            <PasswordForm />
                        </section>

                    </div>
                </div>

            </div>
        </div>
    );
}