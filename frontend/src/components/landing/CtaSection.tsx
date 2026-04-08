"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

const CtaSection = () => (
  <section id="demo" className="py-20 md:py-28 px-6">
    <AnimatedSection className="max-w-3xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 text-center p-10 md:p-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
            Ready to modernize your gym?
          </h2>
          <p className="text-sm md:text-base mb-8 max-w-md mx-auto text-gray-400">
            Join 500+ fitness businesses already growing with FitNice. Free 14-day trial, no credit card needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="xl">
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="xl"
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              Schedule a demo
            </Button>
          </div>

          <p className="text-[11px] mt-6 text-gray-500">
            No credit card required · Cancel anytime · 24/7 support
          </p>
        </div>
      </div>
    </AnimatedSection>
  </section>
);

export default CtaSection;
