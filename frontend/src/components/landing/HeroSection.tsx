"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const highlights = [
  "14-day free trial",
  "No credit card required",
  "Cancel anytime",
];

const HeroSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thanks! We'll contact you at ${email}`);
    setEmail("");
  };

  return (
    <section className="relative pt-28 pb-8 md:pt-36 md:pb-12 px-6 bg-gradient-to-b from-white to-teal-50/50 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #111 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-gray-200 bg-white shadow-sm text-xs font-medium text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Now serving 500+ gyms across Southeast Asia
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold tracking-tight leading-[1.08] mb-6 text-gray-900"
        >
          The operating system
          <br />
          for modern{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
            fitness businesses
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 text-gray-600"
        >
          Manage members, automate payments, track analytics, and grow revenue — all from one
          beautifully simple platform.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mb-6"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your work email"
            className="w-full sm:flex-1 px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
            required
          />
          <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto whitespace-nowrap">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-400"
        >
          {highlights.map((h) => (
            <span key={h} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              {h}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;