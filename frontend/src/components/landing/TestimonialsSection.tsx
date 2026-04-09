"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alexandra Chen",
    role: "Owner, FitFactory Jakarta",
    content: "FitNice transformed how we run our gym. Member retention went up 40% in the first quarter. The analytics dashboard alone is worth the investment.",
    initials: "AC",
    span: "lg:col-span-8",
    theme: "bg-teal-500 text-slate-950 border-teal-600",
    textClass: "text-slate-900",
    roleClass: "text-teal-900/70"
  },
  {
    name: "Rizky Pratama",
    role: "Manager, PowerGym",
    content: "The automated billing saved us 15 hours per week. We've seen a 3x increase in class bookings since launch.",
    initials: "RP",
    span: "lg:col-span-4",
    theme: "bg-slate-950 text-white border-slate-800",
    textClass: "text-slate-300",
    roleClass: "text-slate-500"
  },
  {
    name: "Sarah Williams",
    role: "CEO, GymChain Asia",
    content: "We evaluated 12 platforms before choosing FitNice. Best decision we made — ROI was visible within 3 months across all 8 branches.",
    initials: "SW",
    span: "lg:col-span-12",
    theme: "bg-slate-50 text-slate-900 border-slate-200",
    textClass: "text-slate-600",
    roleClass: "text-slate-400"
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 px-6 bg-white font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Star className="w-3 h-3 text-teal-400 fill-teal-400" />
            Social Proof
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900 mb-6">
            Trusted By <br />
            <span className="text-slate-300">Industry Leaders.</span>
          </h2>
        </motion.div>

        {/* Bento Grid Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`${t.span} ${t.theme} rounded-[2.5rem] p-8 md:p-12 border flex flex-col justify-between relative overflow-hidden group`}
            >
              {/* Giant Quote Watermark */}
              <Quote className="absolute -top-4 -right-4 w-40 h-40 opacity-5 rotate-12 pointer-events-none" />

              <p className={`text-xl md:text-3xl font-bold tracking-tight leading-snug mb-10 relative z-10 ${t.textClass}`}>
                "{t.content}"
              </p>

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm ${
                  i === 0 ? "bg-slate-950 text-white" : i === 1 ? "bg-teal-500 text-slate-950" : "bg-white border border-slate-200 text-slate-900"
                }`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-tight">{t.name}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${t.roleClass}`}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;