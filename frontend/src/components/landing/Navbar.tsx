"use client";

import { useState, useEffect } from "react";
import { Menu, X, Dumbbell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">FitNice</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-3.5 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100/50"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#demo" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Log in
            </a>
            <Button variant="hero" size="sm" asChild>
              <a href="#demo">
                Start Free
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100/50"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-lg">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="block px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Button variant="hero" className="w-full" size="sm" asChild>
                  <a href="#demo" onClick={() => setOpen(false)}>
                    Start Free Trial
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
