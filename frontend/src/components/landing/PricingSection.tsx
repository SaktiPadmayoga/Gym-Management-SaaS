"use client";

import { Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

const plans = [
  {
    name: "Starter",
    price: "299K",
    period: "/mo",
    description: "For small gyms getting started",
    features: ["Up to 50 active members", "Basic member management", "Online booking", "Simple reporting", "Email support"],
    popular: false,
    cta: "Start free trial",
  },
  {
    name: "Professional",
    price: "699K",
    period: "/mo",
    description: "For growing fitness businesses",
    features: ["Up to 300 active members", "All Starter features", "Mobile app for members", "Payment automation", "Advanced analytics", "Priority support", "WhatsApp integration", "Auto-billing system"],
    popular: true,
    cta: "Start free trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For gym chains and franchises",
    features: ["Unlimited members", "Multi-branch management", "Custom integrations", "Dedicated account manager", "24/7 phone support", "Staff training sessions", "Full API access", "White-label option"],
    popular: false,
    cta: "Contact sales",
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-20 md:py-28 px-6">
    <div className="max-w-5xl mx-auto">
      <AnimatedSection className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-4">
          <CreditCard className="w-3.5 h-3.5" />
          Pricing
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h2>
        <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">Start free, upgrade when you're ready. All plans include a 14-day trial.</p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5 items-start">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-2xl overflow-hidden transition-all duration-300 ${
              plan.popular
                ? "border-2 border-teal-500 shadow-lg shadow-teal-500/20 md:-translate-y-2"
                : "border border-gray-200 shadow-sm"
            }`}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-teal-500 to-teal-400 text-white text-center py-2 text-[11px] font-bold tracking-wider">
                MOST POPULAR
              </div>
            )}

            <div className="p-6 bg-white">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-5">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl md:text-4xl font-extrabold text-gray-900">
                  {plan.price === "Custom" ? "" : "Rp"}{plan.price}
                </span>
                {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
              </div>

              <Button variant={plan.popular ? "hero" : "outline"} size="lg" className="w-full mb-6">
                {plan.cta}
              </Button>

              <ul className="space-y-2.5">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-500" />
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;