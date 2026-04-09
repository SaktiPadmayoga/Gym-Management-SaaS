"use client";

import { motion } from "framer-motion";

const logos = [
  "FITFACTORY", "POWERGYM", "GYMCHAIN", "FLEXZONE", "IRONWORKS",
  "COREFIT", "PEAKFORM", "VITALGYM", "ELEVATE", "APEX"
];

// Menduplikasi array berkali-kali agar loop animasi berjalan sangat mulus (seamless)
const repeatedLogos = [...logos, ...logos, ...logos, ...logos];

const LogoCloud = () => {
  return (
    <section className="py-12 border-y border-slate-200 bg-white overflow-hidden relative font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
          Dipercaya oleh 500+ Fasilitas Kebugaran Terkemuka
        </p>
      </div>

      <div className="relative w-full overflow-hidden flex">
        {/* Edge Gradients (Efek transparan di ujung kiri dan kanan) */}
        <div className="absolute top-0 left-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee Animation */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35, // Semakin besar angka, semakin lambat gerakannya
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex whitespace-nowrap items-center w-max"
        >
          {repeatedLogos.map((name, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-200 hover:text-teal-500 transition-colors duration-300 cursor-default select-none">
                {name}
              </span>
              {/* Separator / Ornamen antar logo */}
              <span className="mx-8 md:mx-16 text-xl font-light text-slate-200">
                /
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LogoCloud;