"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { staffAuthAPI } from "@/lib/api/tenant/staffAuth";
import { LoginBranchData, SelectedBranch } from "@/types/tenant/staff-auth";

/* =========================
 * CONTEXT TYPE
 * ========================= */

interface StaffAuthContextValue {
    staff:          any | null;
    token:          string | null;
    globalRole:     "owner" | "staff" | null; // role global dari tabel staffs
    branches:       LoginBranchData[];
    selectedBranch: SelectedBranch | null;
    isLoading:      boolean;
    isReady:        boolean;
    isOwner:        boolean;
    login:          (email: string, password: string) => Promise<LoginBranchData[]>;
    loginWithGoogle:() => Promise<void>;
    selectBranch:   (branch: SelectedBranch) => void;
    logout:         () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

const TOKEN_KEY    = "staff_token";
const DATA_KEY     = "staff_data";
const BRANCH_KEY   = "staff_branches";
const ROLE_KEY     = "staff_global_role";
const SELECTED_KEY = "staff_selected_branch";

function getSubdomainKey(key: string): string {
    if (typeof window === "undefined") return key;
    const slug = window.location.hostname.split(".")[0];
    return `${key}_${slug}`;
}

function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `staff_token=${token}; path=/; max-age=${60 * 60 * 8}`;
}

function clearAuth() {
    [TOKEN_KEY, DATA_KEY, BRANCH_KEY, ROLE_KEY].forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(getSubdomainKey(SELECTED_KEY));
    localStorage.removeItem(getSubdomainKey("current_branch"));
    document.cookie = "staff_token=; path=/; max-age=0";
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [staff,          setStaff]          = useState<any | null>(null);
    const [token,          setToken]          = useState<string | null>(null);
    const [globalRole,     setGlobalRole]     = useState<"owner" | "staff" | null>(null);
    const [branches,       setBranches]       = useState<LoginBranchData[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<SelectedBranch | null>(null);
    const [isLoading,      setIsLoading]      = useState(false);
    const [isReady,        setIsReady]        = useState(false);

    // Hydrate dari localStorage
    useEffect(() => {
        const storedToken    = localStorage.getItem(TOKEN_KEY);
        const storedStaff    = localStorage.getItem(DATA_KEY);
        const storedBranches = localStorage.getItem(BRANCH_KEY);
        const storedRole     = localStorage.getItem(ROLE_KEY);
        const storedSelected = localStorage.getItem(getSubdomainKey(SELECTED_KEY));

        if (storedToken && storedStaff) {
            try {
                setToken(storedToken);
                setStaff(JSON.parse(storedStaff));
                setGlobalRole((storedRole as "owner" | "staff") ?? null);
                if (storedBranches) setBranches(JSON.parse(storedBranches));
                if (storedSelected) setSelectedBranch(JSON.parse(storedSelected));
            } catch {
                clearAuth();
            }
        }
        setIsReady(true);
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<LoginBranchData[]> => {
        setIsLoading(true);
        try {
            const { token: newToken, staff: staffData, branches: staffBranches, global_role } =
                await staffAuthAPI.login({ email, password });

            saveToken(newToken);
            localStorage.setItem(DATA_KEY,   JSON.stringify(staffData));
            localStorage.setItem(BRANCH_KEY, JSON.stringify(staffBranches));
            localStorage.setItem(ROLE_KEY,   global_role);

            setToken(newToken);
            setStaff(staffData);
            setBranches(staffBranches);
            setGlobalRole(global_role as "owner" | "staff");

            return staffBranches;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithGoogle = useCallback(async () => {
        const url = await staffAuthAPI.getGoogleRedirectUrl();
        window.location.href = url;
    }, []);

    /**
     * Pilih branch → tentukan redirect berdasarkan global_role:
     * owner  → /owner/dashboard
     * staff  → /dashboard
     */
    const selectBranch = useCallback((branch: SelectedBranch) => {
        setSelectedBranch(branch);
        localStorage.setItem(getSubdomainKey(SELECTED_KEY), JSON.stringify(branch));

        // Sync ke BranchProvider / tenant-api-client interceptor
        localStorage.setItem(
            getSubdomainKey("current_branch"),
            JSON.stringify({ id: branch.id, name: branch.name, address: branch.address ?? null })
        );

        const role = localStorage.getItem(ROLE_KEY);
        router.push(role === "owner" ? "/owner/dashboard" : "/dashboard");
    }, [router]);

    const logout = useCallback(async () => {
        try { await staffAuthAPI.logout(); } catch { /* tetap logout */ }
        clearAuth();
        setToken(null);
        setStaff(null);
        setGlobalRole(null);
        setBranches([]);
        setSelectedBranch(null);
        router.push("/auth/login");
    }, [router]);

    return (
        <StaffAuthContext.Provider value={{
            staff, token, globalRole, branches, selectedBranch,
            isLoading, isReady,
            isOwner: globalRole === "owner",
            login, loginWithGoogle, selectBranch, logout,
        }}>
            {children}
        </StaffAuthContext.Provider>
    );
}

export function useStaffAuth() {
    const ctx = useContext(StaffAuthContext);
    if (!ctx) throw new Error("useStaffAuth must be used inside <StaffAuthProvider>");
    return ctx;
}