"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { memberAuthAPI } from "@/lib/api/tenant/memberAuth"; 


// --- TYPES ---
export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null; // ✅ Sesuaikan dengan backend
    status?: string;
    qr_token?: string | null;
    member_since?: string | null;
    active_membership?: any;    // ✅ Ubah dari any[] menjadi any (karena ini hasOne/objek)
    home_branch?: any;
    [key: string]: unknown;
}

interface MemberAuthState {
    member: Member | null;
    token: string | null;
    isLoading: boolean;
    isReady: boolean;
}

type AuthAction =
    | { type: "HYDRATE"; payload: Omit<MemberAuthState, "isLoading" | "isReady"> }
    | { type: "HYDRATE_EMPTY" }
    | { type: "LOGIN"; payload: { token: string; member: Member } }
    | { type: "LOGOUT" }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: MemberAuthState = {
    member: null,
    token: null,
    isLoading: false,
    isReady: false,
};

// --- REDUCER ---
function authReducer(state: MemberAuthState, action: AuthAction): MemberAuthState {
    switch (action.type) {
        case "HYDRATE":
            return { ...state, ...action.payload, isReady: true };
        case "HYDRATE_EMPTY":
            return { ...state, isReady: true };
        case "LOGIN":
            return {
                ...state,
                token: action.payload.token,
                member: action.payload.member,
                isLoading: false,
            };
        case "LOGOUT":
            return { ...initialState, isReady: true };
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
}

// --- CONTEXT ---
interface MemberAuthContextValue extends MemberAuthState {
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

// --- STORAGE CONSTANTS ---
const TOKEN_KEY = "member_token";
const DATA_KEY = "member_data";

function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `member_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; 
}

function clearAuth() {
    [TOKEN_KEY, DATA_KEY].forEach((k) => localStorage.removeItem(k));
    document.cookie = "member_token=; path=/; max-age=0";
}

// --- PROVIDER COMPONENT ---
export function MemberAuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedMember = localStorage.getItem(DATA_KEY);

        if (storedToken && storedMember) {
            try {
                dispatch({
                    type: "HYDRATE",
                    payload: {
                        token: storedToken,
                        member: JSON.parse(storedMember),
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
                // rawMemberData tipe email-nya mungkin string | null | undefined dari API
                const { token: newToken, member: rawMemberData } = await memberAuthAPI.login({ email, password });

                // ✅ PENERAPAN OPSI 2: Fallback email ke string kosong jika null/undefined
                const memberData: Member = {
                    ...rawMemberData,
                    email: rawMemberData.email ?? "", 
                };

                saveToken(newToken);
                localStorage.setItem(DATA_KEY, JSON.stringify(memberData));

                dispatch({
                    type: "LOGIN",
                    payload: {
                        token: newToken,
                        member: memberData, // Sekarang memberData dijamin memiliki email bertipe string
                    },
                });

                router.push("/member/dashboard");
                
            } catch (e) {
                dispatch({ type: "SET_LOADING", payload: false });
                throw e; 
            }
        },
        [router]
    );

    const loginWithGoogle = useCallback(async () => {
        const url = await memberAuthAPI.getGoogleRedirectUrl();
        window.location.href = url;
    }, []);

    const logout = useCallback(async () => {
        try {
            await memberAuthAPI.logout();
        } catch {
            // Biarkan lanjut bersihkan state lokal
        }
        clearAuth();
        dispatch({ type: "LOGOUT" });
        router.push("/login"); 
    }, [router]);

    return (
        <MemberAuthContext.Provider
            value={{
                ...state,
                login,
                loginWithGoogle,
                logout,
            }}
        >
            {children}
        </MemberAuthContext.Provider>
    );
}

// --- HOOK ---
export function useMemberAuth() {
    const ctx = useContext(MemberAuthContext);
    if (!ctx) throw new Error("useMemberAuth must be used inside <MemberAuthProvider>");
    return ctx;
}