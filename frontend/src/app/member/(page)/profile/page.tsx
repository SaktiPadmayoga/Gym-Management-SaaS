// app/member/profile/page.tsx
"use client";

import { useMemberAuth } from "@/providers/MemberAuthProvider";
import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { memberAuthAPI } from "@/lib/api/tenant/memberAuth";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { useMemberMe } from "@/hooks/tenant/useMemberAuth";
import { Eye, EyeOff } from "lucide-react";
import { MemberUpdateRequest } from "@/types/tenant/members";

export default function MemberProfilePage() {
    const { logout } = useMemberAuth();
    const { data: member } = useMemberMe();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    // Konfigurasi React Hook Form untuk ubah password
    const form = useForm({
        defaultValues: {
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        },
    });

    const toggleShow = (field: "current" | "new" | "confirm") => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Jika data member belum termuat (masih loading/hydrate)
    if (!member) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Ekstrak data
    const activeMembership = member.active_membership;
    const homeBranch = member.home_branch;

    const onSubmitPassword = async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
        if (data.new_password !== data.new_password_confirmation) {
            toast.error("Konfirmasi sandi baru tidak cocok!");
            return;
        }

        setIsChangingPassword(true);
        try {
            await memberAuthAPI.changePassword(data);

            toast.success("Kata sandi berhasil diubah! Silakan login kembali.", { duration: 5000 });

            // Backend menghapus token saat ganti password, jadi kita harus logout paksa di FE
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err: unknown) {
            const errorMsg = (err as any).response?.data?.message || (err as any).message || "Gagal mengubah kata sandi";
            toast.error(errorMsg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
            <Toaster position="top-center" />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Profil Saya</h1>
                <p className="text-zinc-500 text-sm mt-1">Kelola pengaturan akun dan detail keanggotaan Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KIRI: Informasi Profile & Membership */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col items-center text-center">
                        {member.avatar_url ? (
                            <img src={member.avatar_url as string} alt={member.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-teal-100" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-2xl font-bold mb-4">{member.name.charAt(0).toUpperCase()}</div>
                        )}

                        <h2 className="text-lg font-bold text-zinc-900">{member.name}</h2>
                        <p className="text-zinc-500 text-sm mt-1">{member.email}</p>

                        <div className="w-full pt-4 mt-4 border-t border-zinc-100 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Status</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        member.status === "active" ? "bg-green-100 text-green-700" : member.status === "inactive" ? "bg-zinc-100 text-zinc-600" : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {member.status as string}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Bergabung Sejak</span>
                                <span className="font-medium text-zinc-800">{member.member_since ? new Date(member.member_since as string).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Membership Info Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Keanggotaan Aktif
                        </h3>

                        {activeMembership ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-1">Paket</p>
                                    <p className="font-bold text-zinc-900">{activeMembership.plan?.name || "Paket Tidak Diketahui"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-1">Cabang Rumah</p>
                                    <p className="font-bold text-zinc-900">{homeBranch?.name || "Global"}</p>
                                </div>
                                <div className="pt-2 border-t border-zinc-100">
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-1">Berakhir Pada</p>
                                    <p className="font-bold text-red-600">{new Date(activeMembership.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                                <p className="text-sm text-zinc-500">Tidak ada keanggotaan aktif</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* KANAN: Settings / Security Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Pengaturan Keamanan</h3>
                        <p className="text-zinc-500 text-sm mb-6">Perbarui kata sandi Anda untuk menjaga keamanan akun.</p>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <TextInput name="current_password" label="Kata Sandi Saat Ini" type={showPassword.current ? "text" : "password"} placeholder="••••••••••••" />
                                        <button type="button" onClick={() => toggleShow("current")} className="absolute right-3 top-[32px] p-1.5 text-zinc-400 hover:text-zinc-700 bg-white">
                                            {showPassword.current ? <EyeOff className="mt-1.5 w-4 h-4" /> : <Eye className="mt-1.5 w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <TextInput name="new_password" label="Kata Sandi Baru" type={showPassword.new ? "text" : "password"} placeholder="••••••••••••" />
                                        <button type="button" onClick={() => toggleShow("new")} className="absolute right-3 top-[32px] p-1.5 text-zinc-400 hover:text-zinc-700 bg-white">
                                            {showPassword.new ? <EyeOff className="mt-1.5 w-4 h-4" /> : <Eye className="mt-1.5 w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <TextInput name="new_password_confirmation" label="Konfirmasi Sandi Baru" type={showPassword.confirm ? "text" : "password"} placeholder="••••••••••••" />
                                        <button type="button" onClick={() => toggleShow("confirm")} className="absolute right-3 top-[32px] p-1.5 text-zinc-400 hover:text-zinc-700 bg-white">
                                            {showPassword.confirm ? <EyeOff className="mt-1.5 w-4 h-4" /> : <Eye className="mt-1.5 w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <p className="text-xs text-zinc-400 max-w-[200px] sm:max-w-sm">Anda akan secara otomatis logout setelah berhasil mengubah kata sandi.</p>
                                    <CustomButton
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        {isChangingPassword ? "Memproses..." : "Perbarui Sandi"}
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
