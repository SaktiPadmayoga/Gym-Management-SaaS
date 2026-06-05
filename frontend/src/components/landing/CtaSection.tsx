"use client";

import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";

const CtaSection = () => {
    return (
        <section id="demo" className="py-24 lg:py-20 px-6 bg-white font-sans">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-[3rem] lg:rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-800 p-10 md:p-16 text-center flex flex-col items-center"
                >
                    {/* Abstract Glow Backgrounds */}
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10 w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mb-8">
                        <Zap className="w-8 h-8 text-teal-400 fill-teal-400/20" />
                    </div>

                    <h2 className="relative z-10 text-5xl md:text-6xl lg:text-[4.75rem] font-black tracking-tighter uppercase text-white leading-[0.85] mb-8">
                        Sistem <br />
                        <span className="text-teal-500">Siap.</span>
                    </h2>

                    <p className="relative z-10 text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest max-w-lg mx-auto mb-12 leading-relaxed">
                        Bergabung dengan 500+ bisnis kebugaran yang telah berkembang bersama GYMFIT. Tingkatkan skala bisnis Anda sekarang juga.
                    </p>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                        <Button className="w-full h-16 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.3)] transition-all active:scale-95">
                            <NavLink to="/create-trial" className="flex items-center justify-center w-full">
                                Mulai Uji Coba Gratis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </NavLink>
                        </Button>
                        <Button variant="outline" className="w-full h-16 bg-transparent border-slate-700 text-white hover:bg-white/5 hover:text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all">
                            <NavLink to="/register-tenant" className="flex items-center justify-center w-full">
                                Mulai Berlangganan
                            </NavLink>
                        </Button>
                    </div>

                    <div className="relative z-10 flex items-center justify-center gap-6 mt-10 opacity-60">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Tanpa Kartu Kredit</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden md:block" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white hidden md:block">Dukungan 24/7</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CtaSection;
