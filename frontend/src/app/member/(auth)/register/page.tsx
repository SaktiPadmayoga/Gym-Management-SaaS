"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { memberRegistrationAPI, RegisterMemberRequest } from "@/lib/api/tenant/memberRegistration";

// Hook Midtrans Snap (disarankan dibuat terpisah)
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import CustomButton from "@/components/ui/button/CustomButton";

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

    const { pay } = useMidtransSnap();

    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterMemberRequest>({
        defaultValues: {
            plan_id: planId || "",
            password_confirmation: "",
        },
    });

    // Load Midtrans Snap Script
    useEffect(() => {
        const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
        const snapScriptUrl = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

        if (!clientKey) {
            console.error("MIDTRANS CLIENT KEY tidak ditemukan di environment");
            return;
        }

        const script = document.createElement('script');
        script.src = snapScriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const onSubmit = async (data: RegisterMemberRequest) => {
        if (!data.plan_id) {
            toast.error("Paket membership tidak ditemukan. Silakan pilih paket terlebih dahulu.");
            return;
        }

        if (data.password !== data.password_confirmation) {
            toast.error("Konfirmasi password tidak cocok.");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Register ke Backend → dapat snap_token
            const response = await memberRegistrationAPI.register(data);

            const snapToken = response.snap_token;

            if (!snapToken) {
                toast.error("Gagal mendapatkan token pembayaran.");
                setIsLoading(false);
                return;
            }

            // 2. Tampilkan Midtrans Snap
            pay(snapToken, {
                onSuccess: (result: any) => {
                    toast.success("Pembayaran berhasil diproses!", {
                        description: "Akun Anda akan aktif setelah pembayaran dikonfirmasi oleh sistem.",
                    });
                    // Jangan langsung redirect ke login, karena member masih inactive sampai webhook
                    setTimeout(() => {
                        router.push("/member/registration-success"); // Buat halaman success opsional
                    }, 2500);
                },

                onPending: (result: any) => {
                    toast.info("Pembayaran sedang diproses.", {
                        description: "Silakan selesaikan pembayaran. Akun akan aktif otomatis setelah berhasil.",
                    });
                    setTimeout(() => router.push("/member/login"), 3000);
                },

                onError: (result: any) => {
                    toast.error("Pembayaran gagal atau terjadi kesalahan.");
                    console.error("Midtrans Error:", result);
                    setIsLoading(false);
                },

                onClose: () => {
                    toast.warning("Popup pembayaran ditutup.", {
                        description: "Anda masih bisa menyelesaikan pembayaran nanti melalui halaman login.",
                    });
                    setIsLoading(false);
                },
            });

        } catch (error: any) {
            console.error(error);
            const errorMsg =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0] ||
                "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
            toast.error(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Join the Gym</h1>
                <p className="text-zinc-500 text-sm">
                    Buat akun dan selesaikan pembayaran membership Anda.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input type="hidden" {...register("plan_id")} />

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Nama Lengkap</label>
                    <input
                        type="text"
                        {...register("name", { required: "Nama wajib diisi" })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                        placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        {...register("email", { required: "Email wajib diisi" })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                        placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Nomor Telepon</label>
                    <input
                        type="tel"
                        {...register("phone", { required: "Nomor HP wajib diisi" })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                        placeholder="081234567890"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password wajib diisi",
                                minLength: { value: 8, message: "Password minimal 8 karakter" },
                            })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Konfirmasi</label>
                        <input
                            type="password"
                            {...register("password_confirmation", { required: "Konfirmasi password wajib diisi" })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                            placeholder="••••••••"
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
                        )}
                    </div>
                </div>

                <div className="pt-4 mt-6 border-t border-zinc-100">
                    <CustomButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] disabled:opacity-70"
                    >
                        {isLoading ? "Memproses..." : "Lanjut ke Pembayaran"}
                    </CustomButton>
                </div>
            </form>
        </div>
    );
}

export default function MemberRegistrationPage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4 font-figtree">
            <Toaster position="top-center" richColors closeButton />
            <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}