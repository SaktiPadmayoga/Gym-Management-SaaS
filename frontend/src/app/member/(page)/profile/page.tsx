// app/(tenant)/member/profile/page.tsx
"use client";

import { useMemberAuth } from "@/providers/MemberAuthProvider";
import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { memberAuthAPI } from "@/lib/api/tenant/memberAuth";
import { TextInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";

export default function MemberProfilePage() {
    const { member, logout } = useMemberAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Konfigurasi React Hook Form untuk ubah password
    const form = useForm({
        defaultValues: {
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        },
    });

    // Jika data member belum termuat (masih loading/hydrate)
    if (!member) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Ekstrak data (menyesuaikan dengan Resource backend yang Anda kirim)
    // Asumsi: Backend mengirim activeMembership dan homeBranch
    const activeMembership = member.active_membership;
    const homeBranch = member.home_branch;
    const isGoogleAccount = !member.email?.includes('placeholder'); // Atau logika lain jika ada penanda akun OAuth

    const onSubmitPassword = async (data: any) => {
        if (data.new_password !== data.new_password_confirmation) {
            toast.error("New passwords do not match!");
            return;
        }

        setIsChangingPassword(true);
        try {
            await memberAuthAPI.changePassword(data);
            
            toast.success("Password changed successfully! Please login again.", { duration: 5000 });
            
            // Backend menghapus token saat ganti password, jadi kita harus logout paksa di FE
            setTimeout(() => {
                logout();
            }, 2000);

        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to change password";
            toast.error(errorMsg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-figtree">
            <Toaster position="top-center" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900">My Profile</h1>
                <p className="text-zinc-500 mt-1">Manage your account settings and membership details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* KIRI: Informasi Profile & Membership */}
                <div className="md:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col items-center text-center">
                        {member.avatar_url ? (
                            <img src={member.avatar_url as string} alt={member.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-50" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        
                        <h2 className="text-xl font-bold text-zinc-800">{member.name}</h2>
                        <p className="text-zinc-500 text-sm mb-4">{member.email}</p>

                        <div className="w-full pt-4 border-t border-zinc-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    member.status === 'active' ? 'bg-green-100 text-green-700' :
                                    member.status === 'inactive' ? 'bg-zinc-100 text-zinc-600' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {member.status as string}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Member Since</span>
                                <span className="font-medium text-zinc-800">
                                    {member.member_since ? new Date(member.member_since as string).toLocaleDateString('en-GB') : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Membership Info Card */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                        <h3 className="font-bold text-zinc-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Active Membership
                        </h3>
                        
                        {activeMembership ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-zinc-500">Plan</p>
                                    <p className="font-medium text-zinc-800">{activeMembership.plan?.name || "Unknown Plan"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Home Branch</p>
                                    <p className="font-medium text-zinc-800">{activeMembership?.branch_id?.name || "Global"}</p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-zinc-500">Expires On</p>
                                    <p className="font-medium text-red-600">
                                        {new Date(activeMembership.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                                <p className="text-sm text-zinc-500">No active membership</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* KANAN: Settings / Security Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-800 mb-1">Security Settings</h3>
                        <p className="text-zinc-500 text-sm mb-6">Update your password to keep your account secure.</p>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-5">
                                <div className="max-w-md space-y-5">
                                    <TextInput 
                                        name="current_password" 
                                        label="Current Password" 
                                        type="password" 
                                        placeholder="Enter your current password" 
                                         
                                    />
                                    
                                    <div className="pt-2">
                                        <TextInput 
                                            name="new_password" 
                                            label="New Password" 
                                            type="password" 
                                            placeholder="Minimum 8 characters" 
                                             
                                        />
                                    </div>

                                    <TextInput 
                                        name="new_password_confirmation" 
                                        label="Confirm New Password" 
                                        type="password" 
                                        placeholder="Re-type new password" 
                                         
                                    />
                                </div>

                                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <p className="text-xs text-zinc-400 max-w-[200px] sm:max-w-sm">
                                        You will be automatically logged out after a successful password change.
                                    </p>
                                    <CustomButton 
                                        type="submit" 
                                        disabled={isChangingPassword}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white"
                                    >
                                        {isChangingPassword ? "Updating..." : "Update Password"}
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