"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

export interface CurrentBranch {
    id: string;
    name: string;
    address?: string | null;
    branch_code?: string;
    city?: string;
}

interface StaffSession {
    id: string;
    name: string;
    role: string;
    permissions: string[];
    branch?: CurrentBranch | null;
}

interface BranchContextValue {
    currentBranch: CurrentBranch | null;
    branchId: string | null;
    setBranch: (branch: CurrentBranch) => void;
    clearBranch: () => void;
    isReady: boolean;
}

const BranchContext =
    createContext<BranchContextValue | null>(null);

const STAFF_SESSION_KEY = "staff_selected_branch";

function BranchInitializer({
    children,
}: {
    children: ReactNode;
}) {

    const [currentBranch, setCurrentBranch] =
        useState<CurrentBranch | null>(null);

    const [isReady, setIsReady] =
        useState(false);

    // ---------------------------------------
    // LOAD BRANCH FROM SESSION STORAGE
    // ---------------------------------------
    useEffect(() => {
        try {

            const raw =
                sessionStorage.getItem(STAFF_SESSION_KEY);

            if (!raw) {
                setIsReady(true);
                return;
            }

            const parsed: StaffSession =
                JSON.parse(raw);

            // support 2 bentuk:
            // 1. branch nested
            // 2. branch fields langsung di root
            if (parsed.branch?.id) {

                setCurrentBranch(parsed.branch);

            } else if (
                parsed.id &&
                parsed.name
            ) {

                setCurrentBranch({
                    id: parsed.id,
                    name: parsed.name,
                });
            }

        } catch (error) {
            console.error(
                "Failed parsing branch session",
                error
            );
        } finally {
            setIsReady(true);
        }
    }, []);

    // ---------------------------------------
    // OPTIONAL MANUAL UPDATE
    // ---------------------------------------
    const setBranch = (
        branch: CurrentBranch
    ) => {

        setCurrentBranch(branch);

        try {

            const raw =
                sessionStorage.getItem(STAFF_SESSION_KEY);

            if (!raw) return;

            const parsed =
                JSON.parse(raw);

            parsed.branch = branch;

            sessionStorage.setItem(
                STAFF_SESSION_KEY,
                JSON.stringify(parsed)
            );

        } catch (error) {
            console.error(
                "Failed updating branch session",
                error
            );
        }
    };

    // ---------------------------------------
    // CLEAR
    // ---------------------------------------
    const clearBranch = () => {
        setCurrentBranch(null);
    };

    // ---------------------------------------
    // LOADING
    // ---------------------------------------
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

export function BranchProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <BranchInitializer>
            {children}
        </BranchInitializer>
    );
}

export function useBranch() {

    const ctx = useContext(BranchContext);

    if (!ctx) {
        throw new Error(
            "useBranch must be used inside <BranchProvider>"
        );
    }

    return ctx;
}