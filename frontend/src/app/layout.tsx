// frontend/app/layout.tsx

import type { Metadata } from "next";
import { outfit, figtree, atkin } from "./fonts";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
    title: {
        default: "GymFit - Gym Management Sistem",
        template: "%s | GymFit",
    },
    description: "Platform manajemen gym terlengkap untuk mengelola anggota, jadwal kelas, dan pembayaran. Mulai scale-up bisnis fitness Anda bersama GymFit hari ini.",
    icons: {
        icon: "/images/logobaru.png",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${outfit.variable} ${figtree.variable} ${atkin.variable}`}>
            <body className="font-figtree">
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}
