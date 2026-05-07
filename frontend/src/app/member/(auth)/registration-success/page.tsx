"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import CustomButton from "@/components/ui/button/CustomButton";

export default function MemberRegistrationSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12 font-figtree">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl shadow-zinc-200/50">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={36} />
                </div>

                <h1 className="mb-3 text-3xl font-black tracking-tight text-zinc-950">
                    Pembayaran Diproses
                </h1>
                <p className="mb-8 text-sm leading-relaxed text-zinc-500">
                    Registrasi berhasil dikirim. Setelah webhook pembayaran diterima, akun member akan aktif dan notifikasi tenant akan dibuat.
                </p>

                <CustomButton
                    className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700"
                    onClick={() => router.push("/member/login")}
                >
                    Ke Halaman Login
                </CustomButton>
            </div>
        </div>
    );
}
