"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    name: "Alexandra Chen",
    role: "Owner, FitFactory Jakarta",
    content: "FitNice transformed how we run our gym. Member retention went up 40% in the first quarter. The analytics dashboard alone is worth the investment.",
    initials: "AC",
  },
  {
    name: "Rizky Pratama",
    role: "Manager, PowerGym Surabaya",
    content: "The automated billing saved us 15 hours per week. Our members love the app — we've seen a 3x increase in class bookings since launch.",
    initials: "RP",
  },
  {
    name: "Sarah Williams",
    role: "CEO, GymChain Asia",
    content: "We evaluated 12 platforms before choosing FitNice. Best decision we made — ROI was visible within 3 months across all 8 branches.",
    initials: "SW",
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-20 md:py-28 px-6 bg-gray-900 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative max-w-5xl mx-auto">
      <AnimatedSection className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/50 text-teal-400 text-xs font-semibold mb-4">
          <Star className="w-3.5 h-3.5" />
          Testimonials
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Trusted by gym owners
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
          See why hundreds of fitness businesses choose FitNice.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6 bg-gray-800 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 group"
          >
            <Quote className="w-8 h-8 text-teal-500/30 mb-4" />
            <p className="text-sm leading-relaxed mb-6 text-gray-100">
              "{t.content}"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-700/30">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-400 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-teal-500/25">
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;