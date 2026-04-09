"use client";

import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

const footerSections = [
  { title: "Platform", links: ["Features", "Pricing", "Integrations", "Changelog", "Mobile App"] },
  { title: "Company", links: ["About Fitnice", "Blog", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Documentation", "Help Center", "API Reference", "Community", "System Status"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "GDPR"] },
];

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-900 overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        
        {/* --- TOP GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 md:gap-8 mb-20">
          
          {/* Brand Info */}
          <div className="col-span-2 md:pr-8 flex flex-col justify-between">
            <div>
              <a href="#" className="flex items-center gap-3 mb-6 group inline-flex">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:border-teal-500/50 shadow-lg">
                  <Dumbbell className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter uppercase">
                  Fitnice<span className="text-teal-500">.</span>
                </span>
              </a>
              <p className="text-xs font-bold leading-relaxed text-slate-500 uppercase tracking-wide max-w-xs mb-8">
                The modern operating system for fitness businesses. Manage, grow, and scale with absolute confidence.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg w-max">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Systems Operational</span>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, idx) => (
            <div key={section.title} className="col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-bold text-slate-500 hover:text-teal-400 uppercase tracking-wider transition-colors duration-200 block w-max"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- BIG LOGO WATERMARK --- */}
        <div className="w-full flex justify-center items-center border-t border-slate-900 py-12 md:py-16">
           <h1 className="text-[15vw] md:text-[10rem] font-black uppercase tracking-tighter text-slate-900 leading-none select-none">
             FITNICE.
           </h1>
        </div>

        {/* --- BOTTOM LEGAL --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            &copy; 2026 Fitnice OS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Powered by Innovation</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Bali, ID</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;