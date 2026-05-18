"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Save } from "lucide-react";
import memberApiClient from "@/lib/member-api-client";

interface ResetFormData {
    password: string;
    password_confirmation: string;
}

export default function MemberResetForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

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

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-figtree p-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-zinc-800">Buat Sandi Baru</h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Untuk akun <span className="font-medium text-zinc-700">{email}</span>
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 shadow-sm">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                            
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
                                    className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-600 text-xs font-medium bg-transparent"
                                    tabIndex={-1}
                                >
                                    {showPassword ? "Hide" : "Show"}
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
                                    className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-600 text-xs font-medium bg-transparent"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <CustomButton
                                type="submit"
                                disabled={isLoading || !token || !email}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Menyimpan..." : "Simpan Kata Sandi"}
                                {!isLoading && <Save className="w-4 h-4" />}
                            </CustomButton>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
}
