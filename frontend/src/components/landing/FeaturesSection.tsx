"use client";

import { Users, BarChart3, Calendar, CreditCard, Shield, Zap, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  const features = [
    { span: "lg:col-span-8", icon: <Users />, title: "Member Management", desc: "Siklus hidup member yang terotomatisasi. Dari onboarding, billing, hingga tracking retensi dalam satu protokol tunggal." },
    { span: "lg:col-span-4", icon: <CreditCard />, title: "Payment Auto-Pilot", desc: "Recurring billing dan integrasi multi-gateway (Stripe/Xendit) dengan auto-reconciliation." },
    { span: "lg:col-span-4", icon: <BarChart3 />, title: "Live Analytics", desc: "Pantau KPI, tren pendapatan, dan engagement member secara real-time." },
    { span: "lg:col-span-4", icon: <Calendar />, title: "Smart Scheduling", desc: "Booking kelas otomatis, manajemen kapasitas, dan alokasi personal trainer." },
    { span: "lg:col-span-4", icon: <Shield />, title: "Access Control", desc: "Integrasi Turnstile RFID, QR check-in, dan manajemen akses multi-cabang." },
  ];

  return (
    <section id="features" className="py-24 px-10 max-w-7xl mx-auto bg-white relative font-sans">
      <div className="">
        
        <div className="mb-16 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Zap className="w-3 h-3 text-teal-400" />
              Core Ecosystem
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900">
              Everything <br />
              <span className="text-teal-500">You Need.</span>
            </h2>
          </div>
          <div className="max-w-xs">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
              Toolkit tingkat enterprise yang dibangun khusus untuk bisnis kebugaran skala besar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${f.span} bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 group hover:bg-slate-900 hover:border-slate-800 transition-colors duration-500 flex flex-col`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-500 transition-all duration-500 shadow-sm">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-3 group-hover:text-white transition-colors duration-500">
                {f.title}
              </h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors duration-500 mt-auto">
                {f.desc}
              </p>
            </motion.div>
          ))}
          
          {/* Extra Bento Block for balance (Mobile App Highlight) */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:col-span-8 bg-teal-500 rounded-[2.5rem] p-8 md:p-10 border border-teal-600 group flex flex-col md:flex-row md:items-center gap-8 overflow-hidden relative"
            >
              <div className="relative z-10 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mb-8 border border-white/30 shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-3">
                  White-label Mobile App
                </h3>
                <p className="text-sm font-bold text-teal-50 leading-relaxed max-w-sm">
                  Aplikasi iOS & Android khusus member dengan branding gym Anda. Booking kelas, tracking progres, dan payment dari satu genggaman.
                </p>
              </div>
              
              {/* Decorative Element */}
              <div className="relative z-0 h-40 md:h-auto flex-1 flex justify-end opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                  <Smartphone size={160} strokeWidth={1} className="text-white transform rotate-12 translate-y-10" />
              </div>
          </motion.div>
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;