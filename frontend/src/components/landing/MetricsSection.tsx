"use client";

import { Users, TrendingUp, Award, Globe } from "lucide-react";
import { motion } from "framer-motion";

const MetricsSection = () => {
    const metrics = [
        {
            icon: <Users className="w-6 h-6" />,
            value: "Multi-Role",
            label: "Akses Pengguna",
            desc: "Mendukung owner, staf, trainer, dan member",
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            value: "Terpusat",
            label: "Operasional Gym",
            desc: "Kelola cabang, member, jadwal, dan transaksi",
        },
        {
            icon: <Award className="w-6 h-6" />,
            value: "SaaS",
            label: "Platform Berlangganan",
            desc: "Mendukung trial, paket langganan, dan invoice",
        },
        {
            icon: <Globe className="w-6 h-6" />,
            value: "Custom",
            label: "Domain Tenant",
            desc: "Setiap gym dapat memiliki identitas akses sendiri",
        },
    ];

    return (
        <section id="metrics" className="relative py-24 lg:py-20 max-w-7xl mx-auto bg-slate-950 text-white z-10 rounded-[3rem] lg:rounded-[2.5rem] shadow-2xl font-sans overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 divide-x-0 lg:divide-x divide-slate-800">
                    {metrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex flex-col items-center text-center lg:px-5"
                        >
                            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl mb-6 shadow-[0_0_30px_rgba(20,184,166,0.15)]">{m.icon}</div>
                            <div className="text-5xl md:text-5xl font-black tracking-tighter mb-2 text-white">{m.value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-teal-500 mb-1">{m.label}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{m.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MetricsSection;
