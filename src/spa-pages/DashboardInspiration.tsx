import React, { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import {
  Search, Plus, Bell, Star, FileText, Settings, Grid, Calendar,
  MessageSquare, ArrowUpRight, Filter, Share, ArrowLeft, LayoutDashboard,
  BarChart2, Activity, Database, MoreHorizontal, X, ArrowRight
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell
} from "recharts";
import { motion } from "framer-motion";

// --- Mock Data ---
const activityData = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 180 },
  { day: "Wed", value: 150 },
  { day: "Thu", value: 240 },
  { day: "Fri", value: 360, isMax: true }, // Highlighted
  { day: "Sat", value: 200 },
  { day: "Sun", value: 140 },
];

const revenueComparisonData = [
  { month: "Mon", y2023: 20, y2024: 30 },
  { month: "Tue", y2023: 15, y2024: 35 },
  { month: "Wed", y2023: 22, y2024: 45 },
  { month: "Thu", y2023: 18, y2024: 40 },
  { month: "Fri", y2023: 35, y2024: 65 }, // Max difference
  { month: "Sat", y2023: 40, y2024: 50 },
  { month: "Sun", y2023: 30, y2024: 40 },
];

const totalSpendData = [
  { day: "Mon", value: 100 },
  { day: "Tue", value: 160 },
  { day: "Wed", value: 120 },
  { day: "Thu", value: 250 },
  { day: "Fri", value: 200 },
  { day: "Sat", value: 320 },
  { day: "Sun", value: 290 },
];

export default function DashboardGuidance() {
  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden text-slate-800 font-sans selection:bg-[#D4F718] selection:text-black">
      
      {/* ─── FLOATING SIDEBAR (Mini) ─── */}
      <aside className="w-[80px] flex-shrink-0 flex flex-col items-center py-6 gap-6 z-20">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-8 shadow-lg">
          <Grid className="w-5 h-5" />
        </div>
        
        <div className="flex flex-col gap-4">
          <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110">
            <Star className="w-4 h-4 fill-current" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 text-slate-500 flex items-center justify-center backdrop-blur-md transition-all hover:bg-white hover:text-slate-800 hover:shadow-sm">
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 text-slate-500 flex items-center justify-center backdrop-blur-md transition-all hover:bg-white hover:text-slate-800 hover:shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 text-slate-500 flex items-center justify-center backdrop-blur-md transition-all hover:bg-white hover:text-slate-800 hover:shadow-sm">
            <FileText className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 text-slate-500 flex items-center justify-center backdrop-blur-md transition-all hover:bg-white hover:text-slate-800 hover:shadow-sm mt-auto">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col pt-5 pr-6 pb-6 overflow-y-auto custom-scrollbar">
        
        {/* TOP NAVIGATION TIER */}
        <header className="flex items-center justify-between pl-2">
          {/* Middle Nav Pills */}
          <div className="flex items-center bg-white/40 p-1.5 rounded-full backdrop-blur-xl border border-white/60 shadow-sm">
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-[13px] font-medium shadow-md">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all text-[13px] font-medium">
              <BarChart2 className="w-4 h-4 opacity-50" />
              Analytics
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all text-[13px] font-medium">
              <Activity className="w-4 h-4 opacity-50" />
              Pulse
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all text-[13px] font-medium">
              <Database className="w-4 h-4 opacity-50" />
              Data
            </button>
          </div>

          {/* Right Nav (Avatars + Profile) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/40 p-1.5 rounded-full backdrop-blur-xl border border-white/60 shadow-sm">
              <div className="flex -space-x-2 mr-3 pl-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white/80 overflow-hidden text-[10px] flex items-center justify-center shadow-sm z-30">
                  <span className="text-blue-700 font-bold">AJ</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white/80 overflow-hidden text-[10px] flex items-center justify-center shadow-sm z-20">
                  <span className="text-emerald-700 font-bold">MK</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white/80 overflow-hidden text-[10px] flex items-center justify-center shadow-sm z-10">
                  <span className="text-orange-700 font-bold">SL</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white/80 text-white text-[11px] font-medium flex items-center justify-center shadow-sm z-0">
                  +6
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 text-[12px] font-medium shadow-sm hover:shadow transition-all border border-white/50">
                <Share className="w-3.5 h-3.5" />
                Shared
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm border border-white/60 hover:shadow transition-all relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-red-400"></span>
              </button>
              <div className="w-10 h-10 rounded-full border border-white/60 shadow-sm overflow-hidden bg-white">
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE HEADER ROW */}
        <div className="mt-8 pl-2 w-full">
          <div className="flex items-center gap-4 text-[13px] font-medium text-slate-400 mb-2">
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer transition-colors"><FileText className="w-3.5 h-3.5" /> Sales</span>
            <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer transition-colors"><FileText className="w-3.5 h-3.5" /> Teach Products</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-100">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-[38px] font-light tracking-tight text-slate-800">
                Product Sales Performance
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-100/50">
                <button className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-5 bg-slate-200 mx-1"></div>
                <button className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-sm">
                  <Calendar className="w-4 h-4" />
                </button>
                <span className="px-3 text-[13px] font-medium text-slate-600">22 6 2025</span>
                <span className="text-slate-300">|</span>
                <span className="px-3 text-[13px] font-medium text-slate-600">26 6 2025</span>
              </div>
              <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/70 border border-white text-slate-700 text-[13px] font-medium shadow-sm hover:bg-white transition-all backdrop-blur-md">
                <Plus className="w-4 h-4" />
                Add widget
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-white text-slate-700 text-[13px] font-medium shadow-sm hover:shadow-md transition-all">
                Create a report
              </button>
            </div>
          </div>
        </div>

        {/* ─── MASONRY GRID LAYOUT ─── */}
        <div className="mt-8 pl-2 flex-1 grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1.4fr] gap-6 max-h-[calc(100vh-200px)] min-h-0">
          
          {/* COLUMN 1: The Tall "Pro Version" visual card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="relative flex-1 rounded-[28px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                <h3 className="text-[17px] font-medium text-slate-700">Pro Version</h3>
                <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-slate-400 flex items-center justify-center hover:bg-white hover:text-slate-800 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Graphical Background Area */}
              <div className="absolute inset-0 bg-slate-50 overflows-hidden">
                {/* Abstract rendering of the "green spheres" using soft CSS meshes */}
                <div className="absolute top-1/4 -left-10 w-64 h-64 bg-[#E0F83F]/40 rounded-full mix-blend-multiply filter blur-[50px]"></div>
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#BAE61A]/50 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute right-0 top-20 w-48 h-48 bg-[#65A30D]/20 rounded-full mix-blend-multiply filter blur-[40px]"></div>
                
                {/* Dots Pattern to mimic the spheres */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#84cc16 3px, transparent 3px)', backgroundSize: '24px 24px' }}></div>
              </div>

              <div className="flex-1"></div>

              {/* Glassmorphic Bottom Panel */}
              <div className="relative z-20 mx-4 mb-4 p-5 rounded-[24px] bg-white/30 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BFEA1A]/30 flex items-center justify-center border border-[#BFEA1A]/40">
                      <BarChart2 className="w-4 h-4 text-[#4D7C0F]" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-medium text-slate-800">Advantages</h4>
                      <p className="text-[11px] text-slate-500">Your earning with the pro version</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4">
                  {/* Left Column in Panel */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[26px] font-light text-slate-800 tracking-tight">30-45</span>
                        <span className="text-[12px] text-slate-400 font-medium">age</span>
                      </div>
                    </div>
                    <div className="bg-[#D4F718] p-4 rounded-xl flex items-end justify-between min-h-[90px]">
                      <div>
                        <div className="text-[18px] font-medium text-slate-800">12,233</div>
                        <div className="text-[11px] text-slate-700 font-medium uppercase tracking-wide">sale</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] font-medium text-slate-800">6%</div>
                        <div className="text-[11px] text-slate-700 font-medium uppercase tracking-wide">Growth</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column in Panel */}
                  <div className="flex-1 mt-6">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[22px] font-light text-slate-800 tracking-tight">12-21</span>
                        <span className="text-[12px] text-slate-400 font-medium">age</span>
                      </div>
                    </div>
                    <div className="bg-[#D4F718]/40 p-4 rounded-xl flex items-end justify-between min-h-[90px] border border-[#D4F718]/60">
                      <div>
                        <div className="text-[18px] font-medium text-slate-800">33,337</div>
                        <div className="text-[11px] text-slate-700 font-medium uppercase tracking-wide">sale</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] font-medium text-slate-800">9%</div>
                        <div className="text-[11px] text-slate-600 font-medium uppercase tracking-wide">Growth</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* COLUMN 2: Activity & Total Spend */}
          <div className="flex flex-col gap-6 h-full">
            
            {/* Activity Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1 rounded-[28px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 flex flex-col min-h-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[17px] font-medium text-slate-700">Activity</h3>
                  <p className="text-[12px] text-slate-400 mt-1">Worked this week</p>
                  <div className="mt-2 text-[42px] font-light tracking-tighter text-slate-800 leading-none">186</div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative mt-2 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                      {activityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isMax ? '#D4F718' : '#F1F5F9'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Overlay annotation for max value */}
                <div className="absolute top-0 right-[25%] bg-[#D4F718] text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md z-10">
                  12,464
                </div>
              </div>
            </motion.div>

            {/* Total Spend Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 rounded-[28px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 flex flex-col min-h-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[17px] font-medium text-slate-700">Total Spend</h3>
                  <p className="text-[12px] text-slate-400 mt-4">Spend the week</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[18px] text-slate-500">$</span>
                    <span className="text-[38px] font-light tracking-tighter text-slate-800 leading-none">278.86</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">$432.00</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex mt-4 min-h-[140px] relative">
                <div className="flex flex-col justify-end gap-2 pr-4 pb-6 absolute left-0 bottom-0 top-0 w-24">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[11px] text-slate-500 font-medium w-max">34 <span className="text-slate-400 ml-1">Wallets</span></div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[11px] text-slate-500 font-medium w-max">28 <span className="text-slate-400 ml-1">Assets</span></div>
                </div>
                <div className="flex-1 ml-20 h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={totalSpendData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#1E293B" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: "#1E293B", stroke: "#fff", strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: "#D4F718", stroke: "#1E293B", strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                   {/* Overlay annotation for chart peak */}
                  <div className="absolute top-[30%] left-[60%] bg-[#D4F718] text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md z-10 pointer-events-none">
                    34,533
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* COLUMN 3: Comparison & Virtual Cards */}
          <div className="flex flex-col gap-6 h-full">
            
            {/* Comparison of Revenue Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-[1.2] rounded-[28px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 flex flex-col min-h-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-[17px] font-medium text-slate-700">Comparison of Revenue</h3>
                  <p className="text-[12px] text-slate-400 mt-3">For all time</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[38px] font-light tracking-tighter text-slate-800 leading-none">29,48</span>
                    <span className="text-[18px] text-slate-500 font-medium">m</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white shadow-md hover:bg-slate-700 transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative mt-4 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueComparisonData} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#D1D5DB" strokeWidth="1" opacity={0.5} />
                      </pattern>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                    <Area type="monotone" dataKey="y2024" stroke="#9CA3AF" strokeWidth={2} fill="url(#diagonalHatch)" dot={{ r: 3, fill: "#9CA3AF", stroke: "none" }} />
                    <Area type="monotone" dataKey="y2023" stroke="#D1D5DB" strokeWidth={2} fill="white" dot={{ r: 3, fill: "#D1D5DB", stroke: "none" }} />
                  </AreaChart>
                </ResponsiveContainer>
                {/* Static Year labels mimicking design */}
                <div className="absolute top-[10%] left-0 text-[10px] text-slate-400 font-medium">2023</div>
                <div className="absolute top-[40%] left-0 text-[10px] text-slate-400 font-medium">2024</div>
                
                {/* The floating green badge on the chart */}
                <div className="absolute top-[50%] right-[30%] w-8 h-8 rounded-full bg-[#D4F718] flex items-center justify-center text-[10px] font-bold text-slate-800 z-10 shadow-sm border-2 border-white">
                  +9%
                </div>
              </div>
            </motion.div>

            {/* Virtual Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex-[0.8] rounded-[28px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 min-h-0 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[17px] font-medium text-slate-700">Virtual Cards</h3>
                  <p className="text-[12px] text-slate-400 mt-4">Total Balance</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[18px] text-slate-500">$</span>
                    <span className="text-[32px] font-light tracking-tighter text-slate-800 leading-none">6,010.27</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">$432.00</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <span className="text-[12px] font-medium text-slate-500 w-10">Dolar</span>
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-[13px] font-medium text-slate-700 w-8 text-right">72%</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <span className="text-[12px] font-medium text-slate-500 w-10">Tether</span>
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <span className="text-[13px] font-medium text-slate-700 w-8 text-right">28%</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Global minimal scrollbar for this exact page to match the pristine look */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(203, 213, 225, 0.4); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(203, 213, 225, 0.8); }
      `}</style>
    </div>
  );
}
