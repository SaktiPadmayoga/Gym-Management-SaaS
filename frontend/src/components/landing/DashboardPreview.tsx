"use client";

import { Dumbbell } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const DashboardPreview = () => {
  const miniStats = [
    { label: "Active Members", value: "2,847", change: "+12%" },
    { label: "Monthly Revenue", value: "Rp 142M", change: "+23%" },
    { label: "Retention Rate", value: "94.2%", change: "+3.1%" },
    { label: "New Signups", value: "186", change: "+8%" },
  ];

  return (
    <section className="px-6 pb-20 md:pb-28 -mt-2">
      <AnimatedSection className="max-w-5xl mx-auto">
        <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-8">
              <div className="max-w-xs mx-auto bg-white rounded-md border border-gray-200 px-3 py-1 text-[11px] text-gray-400 text-center">
                app.fitnice.io/dashboard
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-gray-900">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">FitNice Dashboard</div>
                  <div className="text-[11px] text-gray-400">Good morning, Alex 👋</div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-500/15 text-green-400">All systems operational</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {miniStats.map((stat, i) => (
                <div key={i} className="rounded-xl p-3.5 bg-gray-800 border border-gray-700/30">
                  <div className="text-[11px] mb-1.5 text-gray-400">{stat.label}</div>
                  <div className="text-lg md:text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] font-medium text-green-400 mt-0.5">{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 rounded-xl p-4 bg-gray-800 border border-gray-700/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-white">Revenue Overview</span>
                  <span className="text-[10px] font-medium text-teal-400">Last 6 months</span>
                </div>
                <div className="flex items-end gap-2 h-20 md:h-28">
                  {[40, 55, 45, 65, 58, 75, 68, 85, 78, 92, 88, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-teal-500 to-teal-400 opacity-70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4 bg-gray-800 border border-gray-700/30">
                <span className="text-xs font-medium text-white">Top Classes</span>
                <div className="mt-3 space-y-2.5">
                  {[
                    { name: "HIIT Training", pct: 85 },
                    { name: "Yoga Flow", pct: 72 },
                    { name: "Strength", pct: 68 },
                    { name: "Spin Class", pct: 54 },
                  ].map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-white">{c.name}</span>
                        <span className="text-gray-400">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400" style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default DashboardPreview;
