"use client";

import {
    createContext, useContext, useEffect,
    useReducer, ReactNode, useCallback, useRef
} from "react";
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
    staff:          Staff | null;
    globalRole:     "owner" | "staff" | null;
    branches:       LoginBranchData[];
    selectedBranch: SelectedBranch | null;
    isLoading:      boolean;
    isReady:        boolean;
}

type AuthAction =
    | { type: "SET_AUTH"; payload: { staff: Staff; branches: LoginBranchData[]; globalRole: "owner" | "staff" } }
    | { type: "SELECT_BRANCH"; payload: SelectedBranch }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_READY" };

const initialState: AuthState = {
    staff:          null,
    globalRole:     null,
    branches:       [],
    selectedBranch: null,
    isLoading:      false,
    isReady:        false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_AUTH":
            return {
                ...state,
                staff:      action.payload.staff,
                branches:   action.payload.branches,
                globalRole: action.payload.globalRole,
                isReady:    true,
                isLoading:  false,
            };
        case "SELECT_BRANCH":
            return { ...state, selectedBranch: action.payload };
        case "LOGOUT":
            return { ...initialState, isReady: true };
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_READY":
            return { ...state, isReady: true };
        default:
            return state;
    }
}

interface StaffAuthContextValue extends AuthState {
    isOwner:            boolean;
    login:              (email: string, password: string) => Promise<void>;
    loginWithGoogle:    () => Promise<void>;
    selectBranch:       (branch: SelectedBranch) => void;
    logout:             () => Promise<void>;
    hasPermission:      (permission: string) => boolean;
    currentPermissions: string[];
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

const SELECTED_KEY = "staff_selected_branch";

function saveSelectedBranch(branch: SelectedBranch): void {
    sessionStorage.setItem(SELECTED_KEY, JSON.stringify(branch));
}

function getSelectedBranch(): SelectedBranch | null {
    try {
        const stored = sessionStorage.getItem(SELECTED_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}

function clearSelectedBranch(): void {
    sessionStorage.removeItem(SELECTED_KEY);
}

function buildSelectedBranch(branch: LoginBranchData): SelectedBranch {
    return {
        id:          branch.id,
        name:        branch.name,
        branch_code: branch.branch_code,
        address:     branch.address ?? null,
        city:        branch.city    ?? null,
        role:        branch.role,
        permissions: branch.permissions ?? [],
    };
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
    const router   = useRouter();
    const [state, dispatch] = useReducer(authReducer, initialState);
    const didInit  = useRef(false);

    // -----------------------------------------------
    // Init — hit /me sekali saat mount
    // -----------------------------------------------
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        staffAuthAPI.me()
            .then((fresh) => {
                const savedBranch = getSelectedBranch();

                // Sync permissions kalau branch sudah dipilih sebelumnya
                let selectedBranch = savedBranch;
                if (savedBranch) {
                    const freshBranch = fresh.branches?.find(
                        (b: LoginBranchData) => b.id === savedBranch.id
                    );
                    if (freshBranch) {
                        selectedBranch = buildSelectedBranch(freshBranch);
                        saveSelectedBranch(selectedBranch);
                    }
                }

                dispatch({
                    type: "SET_AUTH",
                    payload: {
                        staff:      fresh.staff,
                        branches:   fresh.branches ?? [],
                        globalRole: fresh.global_role,
                    },
                });

                if (selectedBranch) {
                    dispatch({ type: "SELECT_BRANCH", payload: selectedBranch });
                }
            })
            .catch(() => {
                // Cookie tidak ada / expired → tidak ada auth state
                dispatch({ type: "SET_READY" });
            });
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const { staff: staffData, branches: staffBranches, global_role } =
                    await staffAuthAPI.login({ email, password });

                dispatch({
                    type: "SET_AUTH",
                    payload: {
                        staff:      staffData,
                        branches:   staffBranches,
                        globalRole: global_role as "owner" | "staff",
                    },
                });

                if (global_role === "owner") {
                    if (staffBranches.length > 0) {
                        const branch = buildSelectedBranch(staffBranches[0]);
                        dispatch({ type: "SELECT_BRANCH", payload: branch });
                        saveSelectedBranch(branch);
                    }
                    router.push("/owner/dashboard");
                    return;
                }

                if (staffBranches.length === 1) {
                    const branch = buildSelectedBranch(staffBranches[0]);
                    dispatch({ type: "SELECT_BRANCH", payload: branch });
                    saveSelectedBranch(branch);
                    if (branch.role === 'trainer') {
                        router.push("/dashboard/trainer");
                    } else {
                        router.push("/dashboard");
                    }
                    return;
                }

                if (staffBranches.length > 1) {
                    router.push("/tenant-auth/select-branch");
                    return;
                }

                dispatch({ type: "SET_LOADING", payload: false });
                throw new Error("No branch assigned. Please contact your administrator.");
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
            saveSelectedBranch(branch);
            if (branch.role === 'trainer') {
                router.push("/dashboard/trainer");
            } else {
                router.push("/dashboard");
            }
        },
        [router],
    );

    const logout = useCallback(async () => {
        try {
            await staffAuthAPI.logout();
        } catch { /* tetap logout */ }
        clearSelectedBranch();
        dispatch({ type: "LOGOUT" });
        router.push("/tenant-auth/login");
    }, [router]);

    const currentPermissions: string[] = state.selectedBranch?.permissions ?? [];

    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (state.globalRole === "owner") return true;
            if (currentPermissions.includes("*")) return true;
            return currentPermissions.includes(permission);
        },
        [state.globalRole, currentPermissions],
    );

    return (
        <StaffAuthContext.Provider value={{
            ...state,
            isOwner: state.globalRole === "owner",
            login,
            loginWithGoogle,
            selectBranch,
            logout,
            hasPermission,
            currentPermissions,
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