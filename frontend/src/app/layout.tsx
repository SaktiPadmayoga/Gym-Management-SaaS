// frontend/app/layout.tsx

import type { Metadata } from "next";
import { outfit, figtree, atkin } from "./fonts";
import "./globals.css";
import { AdminAuthProvider } from "@/providers/AdminAuthProvider";

export const metadata: Metadata = {
    title: "Gym Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${outfit.variable} ${figtree.variable} ${atkin.variable}`}>
            <body className="font-figtree"><AdminAuthProvider>
  {children}
</AdminAuthProvider></body>
        </html>
    );
}
