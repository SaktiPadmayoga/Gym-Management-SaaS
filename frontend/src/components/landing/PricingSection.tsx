"use client";

import React, { useState } from "react";
import { CheckCircle2, CreditCard, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Tambahkan import Link untuk navigasi
import { usePlans } from "@/hooks/usePlans"; 

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const { data: plansData, isLoading, isError } = usePlans();

  const publicPlans = plansData?.filter((plan) => plan.is_public) || [];

  const formatPrice = (price: number) => {
    if (price === 0) return { amount: "Custom", suffix: "" };
    if (price >= 1000000) return { amount: (price / 1000000).toString(), suffix: "M" };
    if (price >= 1000) return { amount: (price / 1000).toString(), suffix: "K" };
    return { amount: price.toString(), suffix: "" };
  };

  const getFallbackDescription = (index: number) => {
    const descriptions = [
      "Untuk gym kecil yang baru mulai berkembang",
      "Untuk bisnis fitness yang sedang scale-up",
      "Untuk franchise & multi-cabang",
    ];
    return descriptions[index] || "Paket langganan sistem fitness";
  };

  // --- KONFIGURASI CTA BERDASARKAN CODE ---
  const getCtaAttributes = (code: string) => {
    if (code.toUpperCase() === "CUSTOM") {
      return {
        label: "Diskusikan Lebih Lanjut",
        href: "/contact-sales", // Arahkan ke halaman kontak atau WhatsApp
        isExternal: false
      };
    }
    
    return {
      label: "Mulai Sekarang",
      href: `/register-tenant?plan=${code.toLowerCase()}`, // Arahkan ke registrasi dengan query param
      isExternal: false
    };
  };

  return (
    <section id="pricing" className="relative py-24 md:py-32 px-6 bg-white overflow-hidden font-sans">
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
          className="mb-12 md:mb-16 text-center flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
             <CreditCard className="w-3 h-3 text-teal-400" />
             Transparent Pricing
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900 mb-6">
            Scale Your <br />
            <span className="text-teal-500">Revenue.</span>
          </h2>
          <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-tight max-w-xl leading-relaxed mb-10">
            Mulai dengan gratis, upgrade kapan pun Anda siap. Semua paket mencakup uji coba 14 hari tanpa kartu kredit.
          </p>

          {!isLoading && !isError && publicPlans.length > 0 && (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 rounded-full shadow-sm">
              <span className={`text-xs font-black uppercase tracking-widest pl-3 transition-colors ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                className="relative w-14 h-7 bg-slate-200 rounded-full p-1 transition-colors hover:bg-slate-300 focus:outline-none"
              >
                <motion.div
                  layout
                  className="w-5 h-5 bg-slate-900 rounded-full shadow-md"
                  initial={false}
                  animate={{ x: billingCycle === "yearly" ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-xs font-black uppercase tracking-widest pr-3 transition-colors ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
                Yearly <span className="text-teal-500 ml-1 hidden sm:inline-block">-20%</span>
              </span>
            </div>
          )}
        </motion.div>

        {/* --- LOADING & ERROR STATES --- */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading Plans...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-600">Failed to load pricing plans.</p>
          </div>
        )}

        {/* --- PRICING CARDS --- */}
        {!isLoading && !isError && (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-center">
            {publicPlans.map((plan, i) => {
              const isPopular = plan.code.toLowerCase().includes("pro") || i === 1;
              const priceValue = billingCycle === "monthly" ? plan.pricing.monthly : plan.pricing.yearly;
              const { amount, suffix } = formatPrice(priceValue);
              const isCustom = amount === "Custom";
              
              const description = getFallbackDescription(i);
              const periodLabel = billingCycle === "monthly" ? "/mo" : "/yr";
              
              // Ambil konfigurasi CTA
              const { label, href } = getCtaAttributes(plan.code);

              return (
                <motion.div
                  key={plan.id || i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 flex flex-col h-full ${
                    isPopular
                      ? "bg-slate-950 text-white border border-slate-800 shadow-2xl shadow-teal-900/20 lg:scale-105 z-10"
                      : "bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:border-teal-200 hover:bg-white z-0"
                  }`}
                >
                  {isPopular && (
                    <>
                      <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                        <div className="bg-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-teal-500/30">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-teal-500/5 blur-[80px] pointer-events-none rounded-full" />
                    </>
                  )}

                  <div className="mb-8 relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                      {plan.name}
                    </h3>
                    <p className={`text-xs font-bold uppercase tracking-tight ${isPopular ? "text-slate-400" : "text-slate-500"}`}>
                      {description}
                    </p>
                  </div>

                  <div className="mb-8 relative z-10 flex items-end gap-1">
                    {isCustom ? (
                      <span className="text-5xl md:text-6xl font-black tracking-tighter uppercase">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className={`text-2xl font-black mb-1 ${isPopular ? "text-slate-400" : "text-slate-400"}`}>
                          {plan.pricing.currency === "IDR" ? "Rp" : plan.pricing.currency}
                        </span>
                        <span className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                          {amount}
                        </span>
                        <span className={`text-2xl font-black ${isPopular ? "text-teal-500" : "text-slate-900"}`}>
                          {suffix}
                        </span>
                        <span className={`text-sm font-bold uppercase tracking-widest mb-2 ml-1 ${isPopular ? "text-slate-500" : "text-slate-400"}`}>
                          {periodLabel}
                        </span>
                      </>
                    )}
                  </div>

                  {/* --- CTA BUTTON DENGAN NAVIGASI --- */}
                  <div className="mb-10 relative z-10">
                    <Link href={href} className="w-full block">
                      <Button 
                        className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
                          isPopular 
                            ? "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20" 
                            : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
                        }`}
                      >
                        {label}
                      </Button>
                    </Link>
                  </div>

                  <div className="relative z-10 flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isPopular ? "text-teal-400" : "text-slate-400"}`}>
                      Features Included
                    </p>
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPopular ? "text-teal-500" : "text-slate-300"}`} />
                          <span className={`text-sm font-medium leading-tight ${isPopular ? "text-slate-300" : "text-slate-600"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;