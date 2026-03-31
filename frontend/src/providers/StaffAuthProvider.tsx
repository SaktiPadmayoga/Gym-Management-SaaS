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
}

type AuthAction =
    | { type: "HYDRATE"; payload: Omit<AuthState, "isLoading" | "isReady"> }
    | { type: "HYDRATE_EMPTY" }
    | { type: "LOGIN"; payload: { token: string; staff: Staff; branches: LoginBranchData[]; globalRole: "owner" | "staff" } }
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

// Key tidak perlu subdomain-scoped lagi karena hanya 1 domain (tenant domain)
function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `staff_token=${token}; path=/; max-age=${60 * 60 * 8}`;
}

function clearAuth() {
    [TOKEN_KEY, DATA_KEY, BRANCH_KEY, ROLE_KEY, SELECTED_KEY].forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("current_branch");
    document.cookie = "staff_token=; path=/; max-age=0";
}

function saveBranchToStorage(branch: SelectedBranch) {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(branch));
    localStorage.setItem(
        "current_branch",
        JSON.stringify({
            id: branch.id,
            name: branch.name,
            address: branch.address ?? null,
        }),
    );
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedStaff = localStorage.getItem(DATA_KEY);
        const storedBranches = localStorage.getItem(BRANCH_KEY);
        const storedRole = localStorage.getItem(ROLE_KEY);
        const storedSelected = localStorage.getItem(SELECTED_KEY);

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

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const { token: newToken, staff: staffData, branches: staffBranches, global_role } = await staffAuthAPI.login({ email, password });

                saveToken(newToken);
                localStorage.setItem(DATA_KEY, JSON.stringify(staffData));
                localStorage.setItem(BRANCH_KEY, JSON.stringify(staffBranches));
                localStorage.setItem(ROLE_KEY, global_role);

                dispatch({
                    type: "LOGIN",
                    payload: {
                        token: newToken,
                        staff: staffData,
                        branches: staffBranches,
                        globalRole: global_role as "owner" | "staff",
                    },
                });

                // -----------------------------------------------
                // ROUTING LOGIC
                // -----------------------------------------------

                if (global_role === "owner") {
                    // Owner → langsung owner dashboard, tidak perlu pilih branch
                    router.push("/owner/dashboard");
                    return;
                }

                // Staff biasa
                if (staffBranches.length === 1) {
                    // Hanya 1 branch → auto-select
                    const branch = staffBranches[0];
                    const branchToSelect: SelectedBranch = {
                        id: branch.id,
                        name: branch.name,
                        branch_code: branch.branch_code,
                        address: branch.address ?? null,
                        city: branch.city ?? null,
                        role: branch.role,
                    };
                    dispatch({ type: "SELECT_BRANCH", payload: branchToSelect });
                    saveBranchToStorage(branchToSelect);
                    router.push("/dashboard");
                    return;
                }

                if (staffBranches.length > 1) {
                    // Lebih dari 1 branch → tampilkan pilihan
                    router.push("/tenant-auth/select-branch");
                    return;
                }

                // Tidak ada branch → tetap di login dengan error
                dispatch({ type: "SET_LOADING", payload: false });
                throw new Error("No branch assigned to your account. Please contact your administrator.");
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
            router.push("/dashboard");
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
