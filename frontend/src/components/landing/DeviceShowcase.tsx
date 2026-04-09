"use client";

import { Smartphone, Monitor, ArrowRight, Activity, Users, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const DeviceShowcase = () => {
  return (
    <section className="relative font-sans flex flex-col w-full">
      
      {/* ========================================== */}
      {/* BAGIAN ATAS: WHITE MODE (Tablet & Mobile) */}
      {/* ========================================== */}
      <div className="bg-white py-24 px-6 relative overflow-hidden">
        {/* Background Grid Samar */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* KIRI: Device Mockup (Tablet + Phone) */}
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
            
            {/* Tablet Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: -50, rotate: -5 }}
              whileInView={{ opacity: 1, x: 0, rotate: -2 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-0 md:left-10 w-[85%] aspect-[4/3] bg-slate-50 border-[10px] border-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Tablet Header */}
              <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-teal-500 rounded-md" />
                  <div className="h-3 w-24 bg-slate-200 rounded-sm" />
                </div>
                <div className="h-4 w-4 rounded-full bg-slate-200" />
              </div>
              {/* Tablet Body */}
              <div className="flex-1 flex p-4 gap-4">
                <div className="w-1/3 flex flex-col gap-3">
                  <div className="h-20 bg-white border border-slate-200 rounded-xl shadow-sm" />
                  <div className="h-20 bg-white border border-slate-200 rounded-xl shadow-sm" />
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm" />
                </div>
                <div className="w-2/3 flex flex-col gap-3">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col">
                    <div className="h-3 w-32 bg-slate-200 rounded-sm mb-4" />
                    <div className="flex-1 flex items-end gap-2">
                      {[40, 70, 45, 90, 60, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-teal-100 rounded-t-sm" style={{ height: `${h}%` }}>
                           <div className="w-full bg-teal-500 rounded-t-sm" style={{ height: `${h * 0.4}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Mockup (Overlapping) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="absolute right-0 md:right-10 bottom-0 w-[140px] md:w-[180px] aspect-[1/2.1] bg-white border-[8px] border-slate-900 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            >
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-slate-900 rounded-b-xl z-20" />
              {/* Mobile Header */}
              <div className="h-16 bg-teal-500 pt-6 px-4">
                 <div className="h-3 w-16 bg-white/50 rounded-sm" />
              </div>
              {/* Mobile Body */}
              <div className="flex-1 p-3 space-y-3 bg-slate-50">
                <div className="h-16 bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                   <div className="space-y-1 w-full">
                     <div className="h-2 w-full bg-slate-200 rounded-sm" />
                     <div className="h-2 w-1/2 bg-slate-200 rounded-sm" />
                   </div>
                </div>
                <div className="h-16 bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                   <div className="space-y-1 w-full">
                     <div className="h-2 w-full bg-slate-200 rounded-sm" />
                     <div className="h-2 w-2/3 bg-slate-200 rounded-sm" />
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* KANAN: Teks Konten */}
          <div className="max-w-lg lg:ml-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-slate-900 mb-6"
            >
              Keuntungan Maksimal Dengan <span className="text-teal-500">Operasional Optimal.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-slate-500 leading-relaxed font-medium mb-8"
            >
              Pantau performa bisnis gym Anda dari mana saja. Fitnice memberikan aplikasi khusus untuk staf di lapangan dan dashboard analitik lengkap untuk manajemen di level strategis.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-14 px-8 font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition-all">
                Coba Gratis Sekarang
              </Button>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ========================================== */}
      {/* BAGIAN BAWAH: SOLID COLOR (Monitor Desktop) */}
      {/* ========================================== */}
      <div className="bg-teal-600 pt-20 pb-0 px-6 relative overflow-hidden">
        {/* Ornamen Background Biru/Teal */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start lg:items-center">
          
          {/* KIRI: Teks Konten */}
          <div className="max-w-xl pb-16 lg:pb-24">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white/90 text-lg md:text-xl leading-relaxed font-medium mb-6"
            >
              Tinggalkan rumitnya pencatatan manual. Fitnice menyajikan laporan keuangan real-time mulai dari transaksi harian hingga performa membership, semua terpusat dalam satu platform mudah.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/80 text-base md:text-lg leading-relaxed"
            >
              Pantau arus kas, kelola absensi kelas, dan jalankan auto-billing tanpa repot, sehingga Anda bisa fokus mengembangkan bisnis, bukan urusan administrasi.
            </motion.p>
          </div>

          {/* KANAN: Desktop Mockup (Menempel di bawah) */}
          <div className="relative h-[300px] lg:h-[450px] w-full flex items-end justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[-10px] w-[110%] lg:w-[120%] lg:-right-10 aspect-video bg-slate-900 rounded-t-[2rem] border-[12px] border-slate-900 border-b-0 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            >
              {/* Browser Header */}
              <div className="h-10 bg-slate-800 flex items-center px-4 gap-2 shrink-0">
                 <div className="flex gap-1.5 mr-4">
                   <div className="w-3 h-3 rounded-full bg-red-400" />
                   <div className="w-3 h-3 rounded-full bg-amber-400" />
                   <div className="w-3 h-3 rounded-full bg-green-400" />
                 </div>
                 <div className="h-5 w-48 bg-slate-700 rounded-md flex items-center px-2">
                   <div className="w-2 h-2 rounded-full bg-teal-400" />
                 </div>
              </div>
              {/* Desktop App UI */}
              <div className="flex-1 bg-slate-50 flex">
                {/* Sidebar */}
                <div className="w-48 border-r border-slate-200 bg-white p-4 hidden md:flex flex-col gap-2">
                   <div className="h-4 w-24 bg-slate-200 rounded-sm mb-4" />
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className={`h-8 rounded-md flex items-center px-2 gap-2 ${i === 1 ? 'bg-teal-50' : ''}`}>
                       <div className={`w-4 h-4 rounded-sm ${i === 1 ? 'bg-teal-500' : 'bg-slate-200'}`} />
                       <div className={`h-2 rounded-sm ${i === 1 ? 'w-16 bg-teal-600' : 'w-20 bg-slate-200'}`} />
                     </div>
                   ))}
                </div>
                {/* Main Content Area */}
                <div className="flex-1 p-6 space-y-4">
                   <div className="flex justify-between items-end">
                     <div className="h-6 w-32 bg-slate-200 rounded-sm" />
                     <div className="h-8 w-24 bg-white border border-slate-200 rounded-md shadow-sm" />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="h-20 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                         <div className="h-2 w-16 bg-slate-200 rounded-sm" />
                         <div className="h-6 w-24 bg-slate-800 rounded-sm" />
                       </div>
                     ))}
                   </div>
                   <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-end gap-2 h-40">
                      {/* Fake Chart Bars */}
                      {[30, 45, 25, 60, 40, 80, 50, 90, 70, 100].map((h, i) => (
                         <div key={i} className="flex-1 bg-teal-100 rounded-t-sm" style={{ height: `${h}%` }}>
                           <div className="w-full bg-teal-500 rounded-t-sm" style={{ height: `${h * 0.6}%` }} />
                         </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
};

export default DeviceShowcase;