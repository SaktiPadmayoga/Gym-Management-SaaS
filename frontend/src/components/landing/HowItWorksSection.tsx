"use client";

import { motion } from "framer-motion";
import { Database, Settings2, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Database className="w-6 h-6" />,
    title: "Data Migration",
    description: "Import data member, staf, dan paket dari sistem lama Anda. Setup database Fitnice selesai secara otomatis tanpa hambatan.",
  },
  {
    number: "02",
    icon: <Settings2 className="w-6 h-6" />,
    title: "System Config",
    description: "Konfigurasi role, metode pembayaran, dan integrasi hardware (seperti turnstile/RFID). Sesuaikan alur dengan SOP operasional gym Anda.",
  },
  {
    number: "03",
    icon: <Rocket className="w-6 h-6" />,
    title: "Go Live & Scale",
    description: "Sistem aktif beroperasi penuh. Pantau transaksi POS harian dan analitik retensi member dari satu dashboard real-time.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-6 bg-white overflow-hidden font-sans max-w-7xl mx-auto">
      {/* Background Grid - Consistent with Hero */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Deployment Protocol
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900">
              Setup in <br />
              <span className="text-teal-500">Minutes.</span>
            </h2>
          </div>
          <div className="max-w-xs">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
              Transisi mulus tanpa downtime. Tidak perlu tim IT khusus untuk mulai mengelola cabang Anda.
            </p>
          </div>
        </motion.div>

        {/* --- STEPS PIPELINE --- */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Decorative Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-slate-100 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="h-full bg-teal-500/30" 
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-10 hover:bg-white transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden"
            >
              {/* Giant Number Watermark */}
              <div className="absolute -top-10 -right-6 text-[10rem] font-black text-slate-200/50 leading-none group-hover:text-teal-50 transition-colors duration-500 z-0 pointer-events-none tracking-tighter">
                {step.number}
              </div>

              {/* Header Box */}
              <div className="relative z-10 flex items-center justify-between mb-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:border-teal-200 group-hover:text-teal-600 transition-all duration-500">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="text-slate-300 md:hidden" />
                )}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3 leading-none">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;