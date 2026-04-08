"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTenantHeader } from "@/hooks/useTenantHeader";

export interface CurrentBranch {
    id: string;
    name: string;
    address?: string | null;
}

interface BranchContextValue {
    currentBranch: CurrentBranch | null;
    branchId: string | null;
    setBranch: (branch: CurrentBranch) => void;
    clearBranch: () => void;
    isReady: boolean;
}

const BranchContext = createContext<BranchContextValue | null>(null);

// Key per tenant — mencegah branch bocor antar subdomain
function getStorageKey(): string {
    if (typeof window === "undefined") return "current_branch";
    const parts = window.location.hostname.split(".");
    // atmagym.localhost → parts[0] = "atmagym" → key: current_branch_atmagym
    // Tidak ada lagi 3-level domain, jadi parts[0] selalu tenant slug
    const tenantSlug = parts[0];
    return `current_branch_${tenantSlug}`;
}

function BranchInitializer({ children }: { children: ReactNode }) {
    const [currentBranch, setCurrentBranch] = useState<CurrentBranch | null>(null);
    const [isReady, setIsReady] = useState(false);

    // TODO: hapus setelah auth diterapkan
    const { data: tenantData, isSuccess } = useTenantHeader();

    const storageKey = getStorageKey();

    // Step 1: cek localStorage per tenant
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.id) {
                    setCurrentBranch(parsed);
                    setIsReady(true);
                    return;
                }
            } catch {
                localStorage.removeItem(storageKey);
            }
        }
        // localStorage kosong — tunggu tenant data
    }, [storageKey]);

    // Step 2: fallback dari tenant current
    // TODO: hapus setelah auth diterapkan
    useEffect(() => {
        if (isReady) return;
        if (!isSuccess) return;

        const branch = tenantData?.current_branch;
        if (branch?.id) {
            const b: CurrentBranch = {
                id:      branch.id,
                name:    branch.name,
                address: branch.address ?? null,
            };
            setCurrentBranch(b);
            localStorage.setItem(storageKey, JSON.stringify(b));
        }

        setIsReady(true);
    }, [isSuccess, tenantData, isReady, storageKey]);

    const setBranch = (branch: CurrentBranch) => {
        setCurrentBranch(branch);
        localStorage.setItem(storageKey, JSON.stringify(branch));
    };

    const clearBranch = () => {
        setCurrentBranch(null);
        localStorage.removeItem(storageKey);
    };

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
            </div>
        );
    }

    return (
        <BranchContext.Provider
            value={{
                currentBranch,
                branchId: currentBranch?.id ?? null,
                setBranch,
                clearBranch,
                isReady,
            }}
        >
            {children}
        </BranchContext.Provider>
    );
}

export function BranchProvider({ children }: { children: ReactNode }) {
    return <BranchInitializer>{children}</BranchInitializer>;
}

export function useBranch() {
    const ctx = useContext(BranchContext);
    if (!ctx) throw new Error("useBranch must be used inside <BranchProvider>");
    return ctx;
}