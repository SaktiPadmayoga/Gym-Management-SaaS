"use client";

import { TrendingUp, Users, Award, Globe } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Metric {
  icon: ReactNode;
  value: string;
  label: string;
  description: string;
}

const metrics: Metric[] = [
  { icon: <Users className="w-5 h-5" />, value: "500+", label: "Gyms powered", description: "Active businesses on FitNice" },
  { icon: <TrendingUp className="w-5 h-5" />, value: "3x", label: "Revenue growth", description: "Average increase in first year" },
  { icon: <Award className="w-5 h-5" />, value: "98.7%", label: "Satisfaction", description: "Customer satisfaction score" },
  { icon: <Globe className="w-5 h-5" />, value: "12", label: "Countries", description: "Serving gyms across APAC" },
];

const MetricsSection = () => (
  <section className="py-20 md:py-28 px-6 bg-gray-50">
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center p-6"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-700 mb-4">
              {m.icon}
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">{m.value}</div>
            <div className="text-sm font-semibold text-gray-900 mb-1">{m.label}</div>
            <div className="text-xs text-gray-400">{m.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MetricsSection;
