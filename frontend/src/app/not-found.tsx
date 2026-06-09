"use client";

import Link from "next/link";
import { Dumbbell, ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4 relative overflow-hidden font-sans">
            {/* Background decorative gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(0,183,181,0.15)_0,transparent_50%)] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(1,135,144,0.15)_0,transparent_50%)] rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full text-center z-10 space-y-8 px-6 py-12 rounded-3xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-2xl">
                {/* Dumbbell Icon Container */}
                <div className="flex justify-center">
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-aksen-dark to-aksen-primary shadow-[0_0_30px_rgba(0,183,181,0.3)] animate-pulse">
                        <Dumbbell className="w-12 h-12 text-white transform -rotate-45" />
                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </div>
                    </div>
                </div>

                {/* 404 Header */}
                <div className="space-y-2">
                    <h1 className="text-8xl font-black tracking-extrawide bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-aksen-primary">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                        Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau Anda tidak memiliki akses ke halaman ini.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-white/10 text-white font-medium transition-all duration-200 cursor-pointer text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>
                    
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aksen-secondary to-aksen-primary hover:from-aksen-primary hover:to-aksen-secondary text-white font-semibold shadow-lg shadow-aksen-primary/20 hover:shadow-aksen-primary/30 transition-all duration-200 text-sm"
                    >
                        <Home className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Debug Info Footer */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Gymfit App Router 404 Handler</span>
                </div>
            </div>
        </div>
    );
}
