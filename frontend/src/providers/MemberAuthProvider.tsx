"use client";

import {
    createContext, useContext, useEffect,
    useReducer, ReactNode, useCallback, useRef
} from "react";
import { useRouter } from "next/navigation";
import { memberAuthAPI } from "@/lib/api/tenant/memberAuth";
import { useQueryClient } from "@tanstack/react-query";

export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null;
    status?: string;
    qr_token?: string | null;
    member_since?: string | null;
    active_membership?: any;
    home_branch?: any;
    [key: string]: unknown;
}

interface MemberAuthState {
    member:    Member | null;
    isLoading: boolean;
    isReady:   boolean;
}

type AuthAction =
    | { type: "SET_AUTH"; payload: { member: Member } }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_READY" };

const initialState: MemberAuthState = {
    member:    null,
    isLoading: false,
    isReady:   false,
};

function authReducer(state: MemberAuthState, action: AuthAction): MemberAuthState {
    switch (action.type) {
        case "SET_AUTH":
            return { ...state, member: action.payload.member, isLoading: false, isReady: true };
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

interface MemberAuthContextValue extends MemberAuthState {
    login:           (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout:          () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
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

        // Hanya jalan di client, bukan SSR
        if (typeof window === "undefined") return;

        memberAuthAPI.me()
            .then((fresh) => {
                dispatch({
                    type: "SET_AUTH",
                    payload: { member: { ...fresh, email: fresh.email ?? "" } },
                });
            })
            .catch(() => {
                // 401 = belum login, bukan error
                dispatch({ type: "SET_READY" });
            });
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const { member: rawMember } = await memberAuthAPI.login({ email, password });
                dispatch({
                    type: "SET_AUTH",
                    payload: { member: { ...rawMember, email: rawMember.email ?? "" } },
                });
                window.location.href = "/member/dashboard";
            } catch (e) {
                dispatch({ type: "SET_LOADING", payload: false });
                throw e;
            }
        },
        [router],
    );

    const loginWithGoogle = useCallback(async () => {
        const url = await memberAuthAPI.getGoogleRedirectUrl();
        window.location.href = url;
    }, []);

    const logout = useCallback(async () => {
        try {
            await memberAuthAPI.logout();
        } catch { /* tetap logout */ }
        queryClient.clear();
        dispatch({ type: "LOGOUT" });
        router.push("/member/login");
    }, [router, queryClient]);

    return (
        <MemberAuthContext.Provider value={{ ...state, login, loginWithGoogle, logout }}>
            {children}
        </MemberAuthContext.Provider>
    );
}

export function useMemberAuth() {
    const ctx = useContext(MemberAuthContext);
    if (!ctx) throw new Error("useMemberAuth must be used inside <MemberAuthProvider>");
    return ctx;
}