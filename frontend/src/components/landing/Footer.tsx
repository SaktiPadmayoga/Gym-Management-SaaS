"use client";

import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

const footerSections = [
    { title: "Platform", links: ["Fitur", "Harga", "Integrasi", "Changelog", "Aplikasi Mobile"] },
    { title: "Perusahaan", links: ["Tentang GYMFIT", "Blog", "Karir", "Pers", "Hubungi Kami"] },
    { title: "Sumber Daya", links: ["Dokumentasi", "Pusat Bantuan", "Referensi API", "Komunitas", "Status Sistem"] },
    { title: "Hukum", links: ["Kebijakan Privasi", "Syarat & Ketentuan", "Keamanan", "GDPR"] },
];

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-900 overflow-hidden relative">
            {/* Background Ornaments */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 lg:pt-16 pb-10">
                {/* --- TOP GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-6 mb-20 lg:mb-16 items-center">
                    {/* Brand Info */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                        <a href="#" className="flex items-center gap-3 mb-6 group w-fit">
                            <img src="/images/logobaru.png" alt="GymFit Logo" className="w-10 h-10 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105 shadow-lg" />

                            <span className="text-2xl font-black text-white tracking-tighter uppercase">
                                GYMFIT<span className="text-teal-500">.</span>
                            </span>
                        </a>

                        <p className="text-xs font-bold leading-relaxed text-slate-500 uppercase tracking-wide max-w-xs">Sistem operasi modern untuk bisnis kebugaran. Kelola, kembangkan, dan tingkatkan skala dengan percaya diri.</p>
                    </div>

                    {/* --- BIG LOGO WATERMARK --- */}
                    <div className="md:col-span-4 flex justify-start md:justify-end items-center">
                        <h1 className="text-[18vw] md:text-[10rem] lg:text-[12rem] font-black uppercase tracking-tighter text-slate-900 leading-none select-none">GYMFIT.</h1>
                    </div>
                </div>

                {/* --- BOTTOM LEGAL --- */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2026 GYMFIT OS. Hak Cipta Dilindungi.</p>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <span>Didorong oleh Inovasi</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>Bali, ID</span>
                    </div>
                </div>
                {/* Links Columns */}
                {/* {footerSections.map((section, idx) => (
                        <div key={section.title} className="col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-xs font-bold text-slate-500 hover:text-teal-400 uppercase tracking-wider transition-colors duration-200 block w-max">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))} */}
            </div>
        </footer>
    );
};

export default Footer;
