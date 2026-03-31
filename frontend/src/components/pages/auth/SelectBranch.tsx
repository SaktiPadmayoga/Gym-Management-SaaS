"use client";

// app/(tenant)/tenant-auth/select-branch/page.tsx

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { SelectedBranch } from "@/types/tenant/staff-auth";

const branchRoleColor: Record<string, string> = {
    owner: "bg-indigo-100 text-indigo-700",
    branch_manager: "bg-purple-100 text-purple-700",
    trainer: "bg-blue-100 text-blue-700",
    receptionist: "bg-teal-100 text-teal-700",
    cashier: "bg-orange-100 text-orange-700",
};

export default function SelectBranchPage() {
    const router = useRouter();
    const { branches, selectBranch, isReady, staff } = useStaffAuth();

    useEffect(() => {
        if (!isReady) return;
        if (!staff) router.replace("/tenant-auth/login");
    }, [isReady, staff]);

    if (!isReady || !staff) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aksen-secondary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-figtree">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-aksen-secondary flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-zinc-800">Select Branch</h1>
                    <p className="text-zinc-500 text-sm mt-1">Welcome, {staff?.name}. Choose which branch to manage.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 px-8 py-8 shadow-sm">
                    {branches.length === 0 ? (
                        <p className="text-center text-sm text-zinc-400 py-4">No branch assigned. Contact your administrator.</p>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                            {branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    type="button"
                                    onClick={() => selectBranch(branch as SelectedBranch)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 hover:border-aksen-secondary hover:bg-aksen-secondary/5 transition text-left group"
                                >
                                    <div>
                                        <p className="font-medium text-zinc-800 group-hover:text-aksen-secondary">{branch.name}</p>
                                        {branch.city && <p className="text-xs text-zinc-400 mt-0.5">{branch.city}</p>}
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize shrink-0 ${branchRoleColor[branch.role] ?? "bg-zinc-100 text-zinc-600"}`}>{branch.role.replace("_", " ")}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
