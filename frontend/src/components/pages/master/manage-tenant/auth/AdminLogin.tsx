"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useAdminAuth } from "@/providers/AdminAuthProvider";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useRouter } from "next/dist/client/components/navigation";

interface LoginFormData {
    email:    string;
    password: string;
}

export default function AdminLogin() {
    const { login, isLoading, admin, isReady } = useAdminAuth(); // rapihin sekalian
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<LoginFormData>({
        mode: "onChange",
        defaultValues: { email: "", password: "" },
    });

    useEffect(() => {
        if (isReady && admin) {
            router.replace("/admin/dashboard");
        }
    }, [isReady, admin, router]);

    // ⛔ baru boleh conditional setelah semua hooks
    if (!isReady) return null;

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
        } catch (err: any) {
            const message = err?.response?.data?.message ?? "Login failed";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-figtree">
            <Toaster position="top-center" />

            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-aksen-secondary flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-zinc-800">Admin Dashboard</h1>
                    <p className="text-zinc-500 text-sm mt-1">Sign in to your admin account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 shadow-sm">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

                            <TextInput
                                name="email"
                                label="Email"
                                placeholder="admin@platform.com"
                                type="email"
                            />

                            <div className="relative">
                                <TextInput
                                    name="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-zinc-400 hover:text-zinc-600 text-xs"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <CustomButton
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-aksen-secondary text-white py-2.5 mt-2 disabled:opacity-50"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </CustomButton>
                        </form>
                    </FormProvider>
                </div>

                <p className="text-center text-xs text-zinc-400 mt-6">
                    Platform Admin — Unauthorized access is prohibited
                </p>
            </div>
        </div>
    );
}