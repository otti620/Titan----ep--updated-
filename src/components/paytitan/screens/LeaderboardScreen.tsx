"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, TrendingUp, Shield, User, ChevronRight } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen = ({ onBack }: LeaderboardScreenProps) => {
  const { leaderboard, profile } = usePayTitan();
  const [activeTab, setActiveTab] = useState<'savers' | 'spenders'>('savers');

  const data = leaderboard?.[activeTab] || [];

  if (data.length < 3) {
    return (
      <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center">
        <Trophy size={48} className="text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-bold">Node Consensus Pending</h3>
        <p className="text-sm text-muted-foreground">The leaderboard is being recalculated across the network.</p>
        <button onClick={onBack} className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-full font-bold">Back</button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Titan Pulse Background */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      
      {/* Navigation */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30">
        <button onClick={onBack} className="text-foreground/80 flex flex-row items-center gap-1 active:opacity-60 transition-opacity z-10 w-20">
          <ArrowLeft size={22} strokeWidth={2.5} /> 
          <span className="text-[15px] font-bold tracking-tight">Back</span>
        </button>
        
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Community Nodes</span>

        <div className="z-10 w-20 flex justify-end">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
             <Trophy size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-6 pt-2 pb-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-black text-foreground tracking-tighter leading-none mb-2">Top Titans</h1>
            <p className="text-[14px] text-muted-foreground font-medium max-w-[80%]">
              Recognizing the architects of high-volume financial engineering.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-[22px] mb-8">
            <button 
              onClick={() => { hapticFeedback('light'); setActiveTab('savers'); }}
              className={cn(
                "flex-1 py-3 rounded-[18px] text-[12px] font-black uppercase tracking-widest transition-all",
                activeTab === 'savers' ? "bg-white dark:bg-white/10 shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Elite Savers
            </button>
            <button 
              onClick={() => { hapticFeedback('light'); setActiveTab('spenders'); }}
              className={cn(
                "flex-1 py-3 rounded-[18px] text-[12px] font-black uppercase tracking-widest transition-all",
                activeTab === 'spenders' ? "bg-white dark:bg-white/10 shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Master Spenders
            </button>
          </div>

          {/* Podiums */}
          <div className="flex items-end justify-center gap-3 mb-10 pt-10">
            {/* Rank 2 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-black p-1 shadow-lg">
                  <img src={data[1].avatar} alt={data[1].username} className="w-full h-full object-cover rounded-[20px]" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-white">2</div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black truncate max-w-[80px]">@{data[1].username}</p>
                <p className="text-[10px] font-mono text-muted-foreground opacity-60">₦{data[1].amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center gap-4 flex-1 pb-4">
              <div className="relative">
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                   className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-500"
                >
                  <Star size={32} fill="currentColor" />
                </motion.div>
                <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-amber-500 bg-white dark:bg-black p-1.5 shadow-2xl shadow-amber-500/20">
                  <img src={data[0].avatar} alt={data[0].username} className="w-full h-full object-cover rounded-[24px]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[12px] font-black text-white shadow-lg">1</div>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-black truncate max-w-[100px]">@{data[0].username}</p>
                <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">₦{data[0].amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-orange-300 dark:border-orange-900/50 bg-white dark:bg-black p-1 shadow-lg">
                  <img src={data[2].avatar} alt={data[2].username} className="w-full h-full object-cover rounded-[20px]" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-300 dark:bg-orange-900 flex items-center justify-center text-[10px] font-black text-white">3</div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black truncate max-w-[80px]">@{data[2].username}</p>
                <p className="text-[10px] font-mono text-muted-foreground opacity-60">₦{data[2].amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Full List */}
          <div className="space-y-3">
             <div className="flex items-center justify-between px-2 mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Architect Network Index</span>
               <div className="flex gap-1 opacity-20">
                 {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-foreground" />)}
               </div>
             </div>

             <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[32px] overflow-hidden">
                {data.map((item, idx) => (
                  <div key={item.id} className={cn(
                    "flex items-center justify-between p-4",
                    idx !== data.length - 1 && "border-b border-black/5 dark:border-white/5"
                  )}>
                    <div className="flex items-center gap-4">
                       <span className="text-[12px] font-mono text-muted-foreground opacity-40 w-4">{idx + 1}</span>
                       <div className="w-10 h-10 rounded-[14px] overflow-hidden bg-muted">
                          <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-[14px] font-bold text-foreground">@{item.username}</p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground opacity-60">Verified Node</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[14px] font-mono font-bold text-foreground">₦{item.amount.toLocaleString()}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">+12.4%</p>
                    </div>
                  </div>
                ))}

                {/* Privacy Toggle Footer */}
                <div className="p-5 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Shield size={16} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-foreground">Privacy Protection</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Hide your node from leaderboard</span>
                      </div>
                    </div>
                    <div className="w-10 h-5 bg-black/10 dark:bg-white/20 rounded-full relative p-1 cursor-pointer">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
