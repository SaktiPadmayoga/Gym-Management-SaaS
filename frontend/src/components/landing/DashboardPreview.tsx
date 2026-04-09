"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  GitBranch, 
  Globe, 
  CreditCard, 
  Users, 
  User, 
  Activity,
  Search,
  MoreVertical,
  ArrowUpRight,
  ChevronDown,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState("members");

  // Tab navigasi yang diletakkan di LUAR mockup
  const previewTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "members", label: "Member Management", icon: Users },
    { id: "subscription", label: "Billing & Subscriptions", icon: CreditCard },
  ];

  return (
    <section className="relative py-24 md:py-32 px-6 bg-slate-50 font-sans overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
        
        {/* --- HEADER & EXTERNAL TABS --- */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Live Interface
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 mb-8">
            Experience the <span className="text-teal-500">Platform.</span>
          </h2>

          {/* External Tabs Toggle */}
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm overflow-x-auto max-w-full">
            {previewTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap ${
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-teal-500 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={14} />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- THE MOCKUP WINDOW (WHITE MODE) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200 bg-white flex flex-col h-[650px]"
        >
          {/* Browser / App Header */}
          <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-white shrink-0">
            <div className="flex gap-2 w-20">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-32 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 flex items-center gap-2">
                <Lock size={10} className="text-teal-500" /> app.fitnice.io

              </div>
            </div>
            <div className="w-20" />
          </div>

          {/* App Body */}
          <div className="flex flex-1 overflow-hidden bg-slate-50/50">
            
            {/* Sidebar (Based on your screenshot) */}
            <div className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col overflow-y-auto">
              
              {/* Tenant Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center font-bold text-slate-700">A</div>
                   <div>
                     <div className="flex items-center gap-2">
                       <h3 className="text-sm font-bold text-slate-900 leading-none">Atma Gym</h3>
                       <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">Trial</span>
                     </div>
                     <p className="text-[10px] text-slate-500 mt-1">Atmagym Denpasar · Main Branch</p>
                   </div>
                 </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Main Menu */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">Main Menu</p>
                  <div className="space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={activeTab === "dashboard"} />
                    <SidebarItem icon={FileText} label="Reports" />
                  </div>
                </div>

                {/* Tenant & Subscription */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">Tenant & Subscription</p>
                  <div className="space-y-1">
                    <SidebarItem icon={GitBranch} label="Branches" />
                    <SidebarItem icon={Globe} label="Domains" />
                    <SidebarItem icon={CreditCard} label="Subscription" isActive={activeTab === "subscription"} />
                  </div>
                </div>

                {/* User Management */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">User Management</p>
                  <div className="space-y-1">
                    <SidebarItem icon={Users} label="Members" isActive={activeTab === "members"} />
                    <SidebarItem icon={User} label="Staff" />
                  </div>
                </div>

                {/* Analytics & Control */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">Analytics & Control</p>
                  <div className="space-y-1">
                    <SidebarItem icon={Activity} label="Activity Logs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
              {/* Dynamic Content Based on Tab */}
              <AnimatePresence mode="wait">
                {activeTab === "members" && <MembersPage key="members" />}
                {activeTab === "dashboard" && <DashboardPage key="dashboard" />}
                {activeTab === "subscription" && <SubscriptionPage key="subscription" />}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- SIDEBAR COMPONENT ---
const SidebarItem = ({ icon: Icon, label, isActive = false }: any) => (
  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
    isActive ? "bg-teal-400 text-white shadow-sm shadow-teal-500/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  }`}>
    <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
    <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
  </div>
);


// --- PAGE 1: MEMBERS (Replicating Screenshot) ---
const MembersPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="p-6 md:p-8"
  >
    {/* Breadcrumb */}
    <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
      <span>User Management</span>
      <span>›</span>
      <span className="text-teal-600 font-semibold">Members</span>
    </div>

    {/* Page Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Members</h1>
        <p className="text-sm text-slate-500">Manage gym members and their memberships</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
        />
      </div>
    </div>

    {/* Table Container */}
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Membership</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Row 1 */}
            <tr className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">C</div>
                  <span className="text-sm font-semibold text-slate-900">Cynthia Patton</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900">+1 (757) 557-7908</p>
                <p className="text-xs text-slate-500">moperakevi@mailinator.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 text-[10px] font-bold bg-green-100 text-green-700 rounded-md">Active</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">No membership</td>
              <td className="px-6 py-4 text-sm text-slate-500">Male</td>
              <td className="px-6 py-4 text-sm text-slate-500">3/28/2026</td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16}/></button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">T</div>
                  <span className="text-sm font-semibold text-slate-900">Tanek Fox</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900">+1 (253) 741-1738</p>
                <p className="text-xs text-slate-500">lutinykus@mailinator.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 text-[10px] font-bold bg-green-100 text-green-700 rounded-md">Active</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">No membership</td>
              <td className="px-6 py-4 text-sm text-slate-500">Male</td>
              <td className="px-6 py-4 text-sm text-slate-500">3/29/2026</td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16}/></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
         <span className="text-xs text-slate-500">Showing 1 to 2 of 2 data</span>
         <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-600 font-medium">
             Show 5 rows <ChevronDown size={14}/>
           </button>
           <button className="w-7 h-7 flex items-center justify-center rounded bg-teal-600 text-white text-xs font-bold shadow-sm">
             1
           </button>
         </div>
      </div>
    </div>
  </motion.div>
);

// --- PAGE 2: DASHBOARD (Light Mode View) ---
const DashboardPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="p-6 md:p-8 space-y-6"
  >
    <div className="flex items-center justify-between mb-2">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none">
        <option>This Month</option>
        <option>Last Month</option>
      </select>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stat Cards */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Revenue</p>
        <h3 className="text-3xl font-bold text-slate-900 mb-1">Rp 42.8M</h3>
        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><ArrowUpRight size={12}/> +14.5% vs last month</p>
      </div>
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Members</p>
        <h3 className="text-3xl font-bold text-slate-900 mb-1">1,204</h3>
        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><ArrowUpRight size={12}/> +5.2% vs last month</p>
      </div>
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Signups</p>
        <h3 className="text-3xl font-bold text-slate-900 mb-1">48</h3>
        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">This week</p>
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col">
       <p className="text-sm font-bold text-slate-900 mb-6">Revenue Chart</p>
       <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100">
          {[30, 45, 25, 60, 40, 80, 50, 90, 70, 100].map((h, i) => (
             <div key={i} className="w-full bg-teal-100 rounded-t-sm relative group hover:bg-teal-500 transition-colors" style={{ height: `${h}%` }}>
               <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold">Rp {h}M</div>
             </div>
          ))}
       </div>
    </div>
  </motion.div>
);

// --- PAGE 3: SUBSCRIPTION ---
const SubscriptionPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="p-6 md:p-8"
  >
    <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
      <span>Tenant & Subscription</span>
      <span>›</span>
      <span className="text-teal-600 font-semibold">Subscription</span>
    </div>
    
    <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
      <h3 className="text-lg font-bold text-slate-900 mb-2">Subscription Expired</h3>
      <p className="text-sm text-slate-600 mb-4 max-w-xl">Your current trial plan has expired. To continue using Atma Gym management features, please upgrade to a paid plan.</p>
      <button className="bg-red-50 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors">
        View Pricing Plans
      </button>
    </div>

    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4">Billing History</h3>
      <div className="text-center py-12 text-slate-400 text-sm">
        No payment history available.
      </div>
    </div>
  </motion.div>
);

export default DashboardPreview;