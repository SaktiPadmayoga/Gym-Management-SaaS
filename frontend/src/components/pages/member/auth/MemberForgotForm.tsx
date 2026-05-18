"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import memberApiClient from "@/lib/member-api-client";

interface ForgotFormData {
    email: string;
}

export default function MemberForgotForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const form = useForm<ForgotFormData>({
        mode: "onChange",
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: ForgotFormData) => {
        try {
            setIsLoading(true);
            const response = await memberApiClient.post("/member/auth/forgot-password", {
                email: data.email
            });
            setIsSuccess(true);
            toast.success(response.data.message || "Link reset telah dikirim.");
        } catch (err: any) {
            const message = err?.response?.data?.message ?? "Terjadi kesalahan";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-figtree p-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-zinc-800">Lupa Kata Sandi</h1>
                    <p className="text-zinc-500 text-sm mt-1">Masukkan email Anda untuk menerima link pemulihan</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 shadow-sm">
                    {!isSuccess ? (
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                                <TextInput
                                    name="email"
                                    label="Alamat Email"
                                    placeholder="member@email.com"
                                    type="email"
                                />

                                <CustomButton
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                                    {!isLoading && <Send className="w-4 h-4" />}
                                </CustomButton>
                            </form>
                        </FormProvider>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-zinc-800 mb-2">Email Terkirim</h2>
                            <p className="text-sm text-zinc-500 mb-6">
                                Kami telah mengirimkan tautan untuk mereset kata sandi Anda ke <strong>{form.getValues('email')}</strong>. Silakan periksa kotak masuk Anda.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center pt-6 border-t border-zinc-100">
                        <button 
                            type="button" 
                            onClick={() => router.push('/member/login')}
                            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
