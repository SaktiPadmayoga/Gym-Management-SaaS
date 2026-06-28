"use client";

import { useState, useEffect } from "react";
import { Menu, X, Dumbbell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "./NavLink"; // Sesuaikan dengan path file NavLink Anda
import Image from "next/image";

const navLinks = [
    { label: "Fitur", to: "/#features" },
    { label: "Cara Kerja", to: "/#how-it-works" },
    { label: "Harga", to: "/#pricing" },
    { label: "FAQ", to: "/#faq" },
];

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 font-sans ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-2" : "bg-transparent py-4"}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-12">
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <Image src="/images/logobaru.png" alt="GymFit Logo" width={40} height={40} className="w-10 h-10 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6 shadow-md" />
                        <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                            GYMFIT<span className="text-teal-500">.</span>
                        </span>
                    </NavLink>

                    <div className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-6 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((l) => (
                            <NavLink key={l.label} to={l.to} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 transition-colors relative group" activeClassName="text-teal-600">
                                {l.label}
                                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full" />
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Button asChild className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl h-10 px-6 shadow-lg shadow-teal-500/20 transition-transform active:scale-95">
                            <NavLink to="/create-trial">
                                Mulai Uji Coba
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </NavLink>
                        </Button>
                    </div>

                    <button className="md:hidden w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setOpen(!open)}>
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* --- MOBILE DROPDOWN (ANIMATED) --- */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden absolute top-full left-0 w-full px-6 pt-4 pb-6 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl"
                        >
                            <div className="flex flex-col space-y-2">
                                {navLinks.map((l) => (
                                    <NavLink
                                        key={l.label}
                                        to={l.to}
                                        className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition-colors"
                                        activeClassName="text-teal-600 bg-slate-50"
                                        onClick={() => setOpen(false)}
                                    >
                                        {l.label}
                                    </NavLink>
                                ))}

                                <div className="h-px w-full bg-slate-100 my-2" />

                                <NavLink
                                    to="/login"
                                    className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition-colors"
                                    activeClassName="text-teal-600 bg-slate-50"
                                    onClick={() => setOpen(false)}
                                >
                                    Masuk
                                </NavLink>

                                <Button asChild className="w-full mt-2 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-teal-500/20">
                                    <NavLink to="/register" onClick={() => setOpen(false)}>
                                        Daftar Sekarang <ArrowRight className="w-4 h-4 ml-2" />
                                    </NavLink>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
