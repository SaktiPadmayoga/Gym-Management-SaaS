"use client";

import { Dumbbell } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const footerSections = [
  { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog", "Mobile App"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Documentation", "Help Center", "API Reference", "Community", "Status"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
];

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800">
    <AnimatedSection className="max-w-6xl mx-auto px-6 py-14">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
        <div className="col-span-2">
          <a href="#" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FitNice</span>
          </a>
          <p className="text-sm leading-relaxed max-w-xs text-gray-400">
            The modern operating system for fitness businesses. Manage, grow, and scale with confidence.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-white">
              {section.title}
            </h4>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} FitNice. All rights reserved.
        </p>
        <p className="text-xs text-gray-500">
          Made with ❤️ for fitness businesses worldwide
        </p>
      </div>
    </AnimatedSection>
  </footer>
);

export default Footer;