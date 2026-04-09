"use client";

import { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How long does it take to set up Fitnice?",
    a: "Sebagian besar gym sudah bisa beroperasi dalam 30 menit. Wizard setup kami akan memandu Anda melakukan import data member, konfigurasi kelas, dan setup pembayaran. Kami juga menyediakan bantuan onboarding gratis.",
  },
  {
    q: "Can I import data from my current system?",
    a: "Tentu! Fitnice mendukung import via CSV dan integrasi langsung dengan beberapa tool manajemen gym populer. Tim data engineer kami siap membantu migrasi tanpa biaya tambahan.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "Tidak ada kontrak jangka panjang. Semua paket berjalan secara *month-to-month* dan bisa dibatalkan kapan saja. Kami juga menawarkan diskon 20% untuk penagihan tahunan.",
  },
  {
    q: "Does Fitnice work for multiple gym locations?",
    a: "Sangat bisa. Paket Professional kami mendukung multi-cabang, dan paket Enterprise menawarkan cabang tak terbatas (unlimited nodes) dengan manajemen terpusat dan analitik lintas-cabang.",
  },
  {
    q: "What payment methods are supported?",
    a: "Fitnice terintegrasi dengan payment gateway utama (Stripe, Xendit) untuk memproses transfer bank, kartu kredit, e-wallet (GoPay, OVO, DANA), hingga auto-debit (direct debit).",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Buka FAQ pertama secara default

  return (
    <section id="faq" className="py-24 px-6 bg-slate-50 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        
        {/* --- LEFT: TITLE --- */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <HelpCircle className="w-3 h-3 text-teal-400" />
              Knowledge Base
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900 mb-6">
              System <br />
              <span className="text-slate-300">F.A.Q.</span>
            </h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight leading-relaxed max-w-sm mb-8">
              Tidak menemukan jawaban yang Anda cari? Tim support kami standby 24/7 untuk membantu Anda.
            </p>
            <a 
              href="mailto:support@fitnice.io" 
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
            >
              Contact Support
            </a>
          </motion.div>
        </div>

        {/* --- RIGHT: ACCORDION --- */}
        <div className="lg:col-span-7">
          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isOpen ? "border-teal-500 shadow-lg shadow-teal-500/10" : "border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? "text-teal-500" : "text-slate-400"}`}>
                        [{String(i + 1).padStart(2, '0')}]
                      </span>
                      <span className={`text-lg md:text-xl font-bold tracking-tight pr-4 ${isOpen ? "text-slate-900" : "text-slate-700"}`}>
                        {faq.q}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 md:px-8 pb-8 pt-0 md:pl-20">
                          <p className="text-sm font-medium leading-relaxed text-slate-500">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FaqSection;