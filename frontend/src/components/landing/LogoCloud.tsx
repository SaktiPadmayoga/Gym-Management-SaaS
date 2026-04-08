"use client";

import AnimatedSection from "./AnimatedSection";

const logos = [
  "FitFactory", "PowerGym", "GymChain", "FlexZone", "IronWorks",
  "CoreFit", "PeakForm", "VitalGym",
];

const LogoCloud = () => (
  <section className="py-14 px-6 border-y border-gray-200 bg-gray-50">
    <AnimatedSection className="max-w-5xl mx-auto">
      <p className="text-center text-xs font-medium uppercase tracking-wider text-gray-400 mb-8">
        Trusted by leading fitness brands
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {logos.map((name) => (
          <span
            key={name}
            className="text-base font-bold text-gray-300 hover:text-gray-500 transition-colors select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </AnimatedSection>
  </section>
);

export default LogoCloud;
