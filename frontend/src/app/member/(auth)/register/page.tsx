"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { memberRegistrationAPI, RegisterMemberRequest } from "@/lib/api/tenant/memberRegistration";
import CustomButton from "@/components/ui/button/CustomButton";

// Deklarasi global agar TypeScript mengenali window.snap
declare global {
    interface Window {
        snap: any;
    }
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan_id");

    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterMemberRequest>({
        defaultValues: {
            plan_id: planId || "",
        }
    });

    // Memuat script Midtrans Snap saat komponen di-mount
    useEffect(() => {
        const snapScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        
        // Ganti dengan Client Key Midtrans Anda (dari env)
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXXX';

        const script = document.createElement('script');
        script.src = snapScriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const onSubmit = async (data: RegisterMemberRequest) => {
        if (!data.plan_id) {
            toast.error("Tidak ada paket yang dipilih. Silakan kembali ke halaman utama.");
            return;
        }

        if (data.password !== data.password_confirmation) {
            toast.error("Konfirmasi password tidak cocok.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Hit API Backend untuk Create Member & Dapatkan Snap Token
            const response = await memberRegistrationAPI.register(data);

            // 2. Tampilkan Popup Midtrans
            window.snap.pay(response.snap_token, {
                onSuccess: function (result: any) {
                    toast.success("Pembayaran berhasil! Akun Anda telah aktif.");
                    // Redirect ke halaman login setelah bayar sukses
                    setTimeout(() => router.push("/member/login"), 2000);
                },
                onPending: function (result: any) {
                    toast.info("Menunggu pembayaran Anda.");
                    setTimeout(() => router.push("/member/login"), 2000);
                },
                onError: function (result: any) {
                    toast.error("Pembayaran gagal. Silakan coba lagi.");
                    setIsLoading(false);
                },
                onClose: function () {
                    toast.warning("Anda menutup popup sebelum menyelesaikan pembayaran.");
                    setIsLoading(false);
                }
            });

        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Terjadi kesalahan saat pendaftaran.";
            toast.error(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Join the Gym</h1>
                <p className="text-zinc-500 text-sm">Create your account and complete your membership payment.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Hidden input untuk plan_id */}
                <input type="hidden" {...register("plan_id")} />

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        {...register("name", { required: "Nama wajib diisi" })} 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        {...register("email", { required: "Email wajib diisi" })} 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Phone Number</label>
                    <input 
                        type="tel" 
                        {...register("phone", { required: "Nomor HP wajib diisi" })} 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                        placeholder="081234567890"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            {...register("password", { required: "Password wajib diisi", minLength: 8 })} 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Confirm</label>
                        <input 
                            type="password" 
                            {...register("password_confirmation", { required: "Konfirmasi password wajib diisi" })} 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4 mt-6 border-t border-zinc-100">
                    <CustomButton 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02]"
                    >
                        {isLoading ? "Processing..." : "Continue to Payment"}
                    </CustomButton>
                </div>
            </form>
        </div>
    );
}

export default function MemberRegistrationPage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4 font-figtree">
            <Toaster position="top-center" />
            <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}