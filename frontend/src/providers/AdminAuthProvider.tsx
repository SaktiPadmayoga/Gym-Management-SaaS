"use client";

import {
    createContext, useContext, useEffect,
    useReducer, ReactNode, useCallback, useRef
} from "react";
import { useRouter } from "next/navigation";
import { adminAuthAPI } from "@/lib/api/adminAuth";
import { AdminData } from "@/types/central/admin-auth";
import { useQueryClient } from "@tanstack/react-query";

interface AdminAuthState {
    admin:     AdminData | null;
    isLoading: boolean;
    isReady:   boolean;
}

type AuthAction =
    | { type: "SET_AUTH"; payload: { admin: AdminData } }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_READY" };

const initialState: AdminAuthState = {
    admin:     null,
    isLoading: false,
    isReady:   false,
};

function authReducer(state: AdminAuthState, action: AuthAction): AdminAuthState {
    switch (action.type) {
        case "SET_AUTH":
            return { ...state, admin: action.payload.admin, isLoading: false, isReady: true };
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

interface AdminAuthContextValue extends AdminAuthState {
    login:  (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const router  = useRouter();
    const queryClient = useQueryClient();
    const [state, dispatch] = useReducer(authReducer, initialState);
    const didInit = useRef(false);

    // -----------------------------------------------
    // Init — hit /me sekali saat mount
    // -----------------------------------------------
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        adminAuthAPI.me()
            .then((fresh) => {
                dispatch({ type: "SET_AUTH", payload: { admin: fresh } });
            })
            .catch(() => {
                dispatch({ type: "SET_READY" });
            });
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const { admin: adminData } = await adminAuthAPI.login({ email, password });
                dispatch({ type: "SET_AUTH", payload: { admin: adminData } });
                router.push("/admin/dashboard");
            } catch (e) {
                dispatch({ type: "SET_LOADING", payload: false });
                throw e;
            }
        },
        [router],
    );

    const logout = useCallback(async () => {
        try {
            await adminAuthAPI.logout();
        } catch { /* tetap logout */ }
        queryClient.clear();
        dispatch({ type: "LOGOUT" });
        router.push("/admin/auth/login");
    }, [router, queryClient]);

    return (
        <AdminAuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
    return ctx;
}