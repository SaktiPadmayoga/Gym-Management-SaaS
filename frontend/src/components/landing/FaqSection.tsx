"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const faqs = [
  {
    q: "How long does it take to set up FitNice?",
    a: "Most gyms are up and running within 30 minutes. Our setup wizard guides you through importing members, configuring classes, and setting up payments. We also offer free onboarding assistance.",
  },
  {
    q: "Can I import data from my current system?",
    a: "Yes! FitNice supports CSV imports and direct integrations with popular gym management tools. Our team can assist with data migration at no extra cost.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "No long-term contracts. All plans are month-to-month and you can cancel anytime. We also offer annual billing with a 20% discount.",
  },
  {
    q: "Does FitNice work for multiple gym locations?",
    a: "Absolutely. Our Professional plan supports multiple locations, and Enterprise offers unlimited branches with centralized management and cross-location analytics.",
  },
  {
    q: "What payment methods are supported?",
    a: "FitNice integrates with major payment gateways including bank transfers, credit cards, e-wallets (GoPay, OVO, Dana), and international payments via Stripe.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Frequently asked questions</h2>
          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
            Can't find what you're looking for? Reach out to our support team.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FaqSection;