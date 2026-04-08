"use client";

import { UserPlus, Settings2, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import type { ReactNode } from "react";

interface Step {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <UserPlus className="w-5 h-5" />,
    title: "Create your account",
    description: "Sign up in 2 minutes. Import existing member data from spreadsheets or other platforms automatically.",
  },
  {
    number: "02",
    icon: <Settings2 className="w-5 h-5" />,
    title: "Configure your gym",
    description: "Set up classes, pricing plans, staff roles, and payment methods. Our wizard guides you through every step.",
  },
  {
    number: "03",
    icon: <Rocket className="w-5 h-5" />,
    title: "Launch & grow",
    description: "Go live with your branded member app. Watch bookings and revenue grow with real-time analytics.",
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 md:py-28 px-6 bg-gray-900 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative max-w-5xl mx-auto">
      <AnimatedSection className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/50 text-teal-400 text-xs font-semibold mb-4">
          How it Works
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Up and running in minutes
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
          No complex setup. No IT team needed. Just sign up and start managing.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px border-t border-dashed border-gray-700" />
            )}

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700/30 mb-5 relative">
                <span className="text-teal-400">{step.icon}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-gradient-to-r from-teal-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-white">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed max-w-xs mx-auto text-gray-400">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

