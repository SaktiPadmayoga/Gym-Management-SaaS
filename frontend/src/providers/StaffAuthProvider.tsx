"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { staffAuthAPI } from "@/lib/api/tenant/staffAuth";
import { LoginBranchData, SelectedBranch } from "@/types/tenant/staff-auth";

interface Staff {
    id: string;
    name: string;
    email: string;
    role: string;
    [key: string]: unknown;
}

interface AuthState {
    staff: Staff | null;
    token: string | null;
    globalRole: "owner" | "staff" | null;
    branches: LoginBranchData[];
    selectedBranch: SelectedBranch | null;
    isLoading: boolean;
    isReady: boolean;
    loginDomain: "tenant" | "branch" | null;
}

type AuthAction =
    | { type: "HYDRATE"; payload: Omit<AuthState, "isLoading" | "isReady"> }
    | { type: "HYDRATE_EMPTY" }
    | { type: "LOGIN"; payload: { token: string; staff: Staff; branches: LoginBranchData[]; globalRole: "owner" | "staff"; loginDomain: "tenant" | "branch" } }
    | { type: "SELECT_BRANCH"; payload: SelectedBranch }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
    staff: null,
    token: null,
    globalRole: null,
    branches: [],
    selectedBranch: null,
    isLoading: false,
    isReady: false,
    loginDomain: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "HYDRATE":
            return { ...state, ...action.payload, isReady: true };
        case "HYDRATE_EMPTY":
            return { ...state, isReady: true };
        case "LOGIN":
            return {
                ...state,
                token: action.payload.token,
                staff: action.payload.staff,
                branches: action.payload.branches,
                globalRole: action.payload.globalRole,
                loginDomain: action.payload.loginDomain,
                isLoading: false,
            };
        case "SELECT_BRANCH":
            return { ...state, selectedBranch: action.payload };
        case "LOGOUT":
            return { ...initialState, isReady: true };
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
}

interface StaffAuthContextValue extends AuthState {
    isOwner: boolean;
    isBranchDomain: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    selectBranch: (branch: SelectedBranch) => void;
    logout: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

const TOKEN_KEY = "staff_token";
const DATA_KEY = "staff_data";
const BRANCH_KEY = "staff_branches";
const ROLE_KEY = "staff_global_role";
const SELECTED_KEY = "staff_selected_branch";
const LOGIN_DOMAIN_KEY = "staff_login_domain";

function getSubdomainKey(key: string): string {
    if (typeof window === "undefined") return key;
    const slug = window.location.hostname.split(".")[0];
    return `${key}_${slug}`;
}

function detectDomain(): "tenant" | "branch" {
    if (typeof window === "undefined") return "tenant";
    const parts = window.location.hostname.split(".");
    return parts.length >= 3 ? "branch" : "tenant";
}

/**
 * Ambil branch dari subdomain saat ini
 * denpasar.atmagym.localhost → cari branch dengan branch_code = 'denpasar'
 */
function getCurrentSubdomain(): string {
    if (typeof window === "undefined") return "";
    return window.location.hostname.split(".")[0];
}

function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `staff_token=${token}; path=/; max-age=${60 * 60 * 8}`;
}

function clearAuth() {
    [TOKEN_KEY, DATA_KEY, BRANCH_KEY, ROLE_KEY, LOGIN_DOMAIN_KEY].forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(getSubdomainKey(SELECTED_KEY));
    localStorage.removeItem(getSubdomainKey("current_branch"));
    document.cookie = "staff_token=; path=/; max-age=0";
}

function saveBranchToStorage(branch: SelectedBranch) {
    localStorage.setItem(getSubdomainKey(SELECTED_KEY), JSON.stringify(branch));
    localStorage.setItem(getSubdomainKey("current_branch"), JSON.stringify({ id: branch.id, name: branch.name, address: branch.address ?? null }));
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedStaff = localStorage.getItem(DATA_KEY);
        const storedBranches = localStorage.getItem(BRANCH_KEY);
        const storedRole = localStorage.getItem(ROLE_KEY);
        const storedSelected = localStorage.getItem(getSubdomainKey(SELECTED_KEY));
        const storedLoginDomain = localStorage.getItem(LOGIN_DOMAIN_KEY) as "tenant" | "branch" | null;

        if (storedToken && storedStaff) {
            try {
                dispatch({
                    type: "HYDRATE",
                    payload: {
                        token: storedToken,
                        staff: JSON.parse(storedStaff),
                        globalRole: (storedRole as "owner" | "staff") ?? null,
                        branches: storedBranches ? JSON.parse(storedBranches) : [],
                        selectedBranch: storedSelected ? JSON.parse(storedSelected) : null,
                        loginDomain: storedLoginDomain ?? detectDomain(),
                    },
                });
            } catch {
                clearAuth();
                dispatch({ type: "HYDRATE_EMPTY" });
            }
        } else {
            dispatch({ type: "HYDRATE_EMPTY" });
        }
    }, []);

    // providers/StaffAuthProvider.tsx
    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            dispatch({ type: "SET_LOADING", payload: true });

            const currentDomain = detectDomain();
            const currentSubdomain = getCurrentSubdomain();

            try {
                const { token: newToken, staff: staffData, branches: staffBranches, global_role } = await staffAuthAPI.login({ email, password });

                // Staff biasa hanya boleh login dari branch domain
                if (global_role === "staff" && currentDomain === "tenant") {
                    dispatch({ type: "SET_LOADING", payload: false });
                    throw new Error("Staff hanya dapat login melalui subdomain cabang masing-masing.");
                }

                saveToken(newToken);
                localStorage.setItem(DATA_KEY, JSON.stringify(staffData));
                localStorage.setItem(BRANCH_KEY, JSON.stringify(staffBranches));
                localStorage.setItem(ROLE_KEY, global_role);
                localStorage.setItem(LOGIN_DOMAIN_KEY, currentDomain);

                dispatch({
                    type: "LOGIN",
                    payload: {
                        token: newToken,
                        staff: staffData,
                        branches: staffBranches,
                        globalRole: global_role as "owner" | "staff",
                        loginDomain: currentDomain,
                    },
                });

                // ==================== ROUTING LOGIC BARU ====================
                if (global_role === "owner" && currentDomain === "tenant") {
                    //router.push("/owner/dashboard");
                    return;
                }

                if (currentDomain === "branch") {
                    const matchedBranch = staffBranches.find((b: LoginBranchData) => b.branch_code?.toLowerCase() === currentSubdomain.toLowerCase());

                    if (matchedBranch) {
                        const branchToSelect: SelectedBranch = {
                            id: matchedBranch.id,
                            name: matchedBranch.name,
                            address: matchedBranch.address ?? null,
                            role: matchedBranch.role,
                        };
                        dispatch({ type: "SELECT_BRANCH", payload: branchToSelect });
                        saveBranchToStorage(branchToSelect);
                        //router.push("/dashboard");
                        return;
                    }

                    // ← PERUBAHAN UTAMA
                    // Tidak ada akses ke branch ini
                    dispatch({ type: "SET_LOADING", payload: false });
                    throw new Error(`Anda tidak memiliki akses ke cabang "${currentSubdomain}". Silakan login melalui subdomain cabang yang sesuai.`);
                }

                // Fallback (seharusnya tidak sampai sini)
                router.push("/tenant-auth/login");
            } catch (e) {
                dispatch({ type: "SET_LOADING", payload: false });
                throw e;
            }
        },
        [router],
    );

    const loginWithGoogle = useCallback(async () => {
        const url = await staffAuthAPI.getGoogleRedirectUrl();
        window.location.href = url;
    }, []);

    const selectBranch = useCallback(
        (branch: SelectedBranch) => {
            dispatch({ type: "SELECT_BRANCH", payload: branch });
            saveBranchToStorage(branch);

            const role = localStorage.getItem(ROLE_KEY);
            const loginDomain = localStorage.getItem(LOGIN_DOMAIN_KEY);

            if (role === "owner" && loginDomain === "tenant") {
                router.push("/owner/dashboard");
            } else {
                router.push("/dashboard");
            }
        },
        [router],
    );

    const logout = useCallback(async () => {
        try {
            await staffAuthAPI.logout();
        } catch {
            /* tetap logout */
        }
        clearAuth();
        dispatch({ type: "LOGOUT" });
        router.push("/tenant-auth/login");
    }, [router]);

    return (
        <StaffAuthContext.Provider
            value={{
                ...state,
                isOwner: state.globalRole === "owner",
                isBranchDomain: detectDomain() === "branch",
                login,
                loginWithGoogle,
                selectBranch,
                logout,
            }}
        >
            {children}
        </StaffAuthContext.Provider>
    );
}

export function useStaffAuth() {
    const ctx = useContext(StaffAuthContext);
    if (!ctx) throw new Error("useStaffAuth must be used inside <StaffAuthProvider>");
    return ctx;
}
