
"use client";

import { Users, BarChart3, Calendar, CreditCard, Smartphone, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import type { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: <Users className="w-5 h-5" />, title: "Member Management", description: "Complete member lifecycle from onboarding to retention with automated workflows." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Real-time Analytics", description: "Track KPIs, revenue trends, and member engagement with live dashboards." },
  { icon: <Calendar className="w-5 h-5" />, title: "Smart Scheduling", description: "Automated class booking, trainer assignments, and capacity management." },
  { icon: <CreditCard className="w-5 h-5" />, title: "Payment Automation", description: "Recurring billing, multi-gateway support, and automated invoice generation." },
  { icon: <Smartphone className="w-5 h-5" />, title: "Mobile Experience", description: "Native iOS & Android apps for members to book, pay, and track progress." },
  { icon: <Shield className="w-5 h-5" />, title: "Access Control", description: "QR check-in, biometric integration, and multi-location access management." },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28 px-6">
    <div className="max-w-6xl mx-auto">
      <AnimatedSection className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          Features
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Everything you need,<br />nothing you don't
        </h2>
        <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
          A complete toolkit built specifically for fitness businesses — from single studios to multi-branch chains.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-2xl border border-gray-200 p-6 group cursor-default shadow-sm hover:shadow-md transition-all duration-300 ${
              i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-teal-400 group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-teal-500/25">
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;