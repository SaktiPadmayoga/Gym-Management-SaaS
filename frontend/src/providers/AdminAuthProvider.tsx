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
import { adminAuthAPI } from "@/lib/api/adminAuth";
import { AdminData } from "@/types/central/admin-auth";

interface AdminAuthContextValue {
    admin:     AdminData | null;
    token:     string | null;
    isLoading: boolean;
    isReady:   boolean;
    login:     (email: string, password: string) => Promise<void>;
    logout:    () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const TOKEN_KEY = "admin_token";
const DATA_KEY  = "admin_data";

// Helper — simpan token ke localStorage DAN cookie
// Cookie dibutuhkan agar middleware Next.js bisa baca (server-side)
function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DATA_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`; // hapus cookie
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [admin,     setAdmin]     = useState<AdminData | null>(null);
    const [token,     setToken]     = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady,   setIsReady]   = useState(false);

    // Hydrate dari localStorage saat mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedData  = localStorage.getItem(DATA_KEY);

        if (storedToken && storedData) {
            try {
                setToken(storedToken);
                setAdmin(JSON.parse(storedData));
            } catch {
                clearToken();
            }
        }

        setIsReady(true);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { token: newToken, admin: adminData } = await adminAuthAPI.login({ email, password });

            saveToken(newToken);
            localStorage.setItem(DATA_KEY, JSON.stringify(adminData));

            setToken(newToken);
            setAdmin(adminData);

            router.push("/admin/dashboard");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async () => {
        try {
            await adminAuthAPI.logout();
        } catch {
            // Tetap logout meski API error
        } finally {
            clearToken();
            setToken(null);
            setAdmin(null);
            router.push("/admin/auth/login");
        }
    }, [router]);

    return (
        <AdminAuthContext.Provider value={{ admin, token, isLoading, isReady, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
    return ctx;
}