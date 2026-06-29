"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trees, Leaf, Globe, Sprout, Wind, Droplets, ChevronRight, Share2 } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

interface TitanForestScreenProps {
  onBack: () => void;
}

const TitanForestScreen = ({ onBack }: TitanForestScreenProps) => {
  const { titanForestCount } = usePayTitan();

  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Nature Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      
      {/* Decorative Floating Leaves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * 400, opacity: 0 }}
            animate={{ 
              y: [null, 800], 
              x: [null, Math.random() * 400], 
              rotate: [0, 360],
              opacity: [0, 0.4, 0] 
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity, 
              delay: i * 3,
              ease: "linear"
            }}
            className="absolute text-emerald-500/20"
          >
            <Leaf size={24 + Math.random() * 24} />
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30">
        <button onClick={onBack} className="text-foreground/80 flex flex-row items-center gap-1 active:opacity-60 transition-opacity z-10 w-20">
          <ArrowLeft size={22} strokeWidth={2.5} /> 
          <span className="text-[15px] font-bold tracking-tight">Back</span>
        </button>
        
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Green Ledger</span>

        <div className="z-10 w-20 flex justify-end">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
             <Sprout size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
        <div className="px-6 pt-2 pb-6">
          {/* Header */}
          <div className="mb-12 text-center flex flex-col items-center">
            <motion.div 
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ repeat: Infinity, duration: 4 }}
               className="w-24 h-24 rounded-[40px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 shadow-2xl shadow-emerald-500/20 border border-emerald-500/20"
            >
              <Trees size={48} strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-[36px] font-black text-foreground tracking-tighter leading-none mb-4 italic">The Titan Forest</h1>
            <p className="text-[15px] text-muted-foreground font-medium max-w-[85%] mx-auto">
              For every 100 transactions, PayTitan plants a tree in your name. Decentralized impact for a greener future.
            </p>
          </div>

          {/* Main Counter */}
          <div className="glass-card rounded-[40px] p-8 text-center mb-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-4 block">Carbon Neutrality Index</span>
             
             <div className="flex flex-col gap-1 mb-6">
                <span className="text-[64px] font-black text-foreground leading-none tracking-tighter italic">
                   {titanForestCount}
                </span>
                <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Trees Planted</span>
             </div>

             <div className="flex items-center justify-center gap-6 pt-6 border-t border-black/5 dark:border-white/5">
                <div className="flex flex-col items-center gap-1">
                   <div className="text-foreground font-black text-[18px]">2.4t</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">CO2 Offset</div>
                </div>
                <div className="w-[1px] h-8 bg-black/5 dark:bg-white/5" />
                <div className="flex flex-col items-center gap-1">
                   <div className="text-foreground font-black text-[18px]">94%</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Green Score</div>
                </div>
             </div>
          </div>

          {/* Ecosystem Benefits Bento */}
          <div className="grid grid-cols-2 gap-3 mb-8">
             <BentoItem icon={Wind} label="Air Purity" value="Enhanced" />
             <BentoItem icon={Droplets} label="Water Loop" value="Stabilized" />
             <BentoItem icon={Globe} label="Global Reach" value="Kenya Hub" />
             <BentoItem icon={Sprout} label="Bio Diversity" value="8 Species" />
          </div>

          {/* Milestone Progress */}
          <div className="space-y-4 mb-8">
             <div className="flex items-center justify-between px-2">
               <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Next Sapling Progress</span>
               <span className="text-[11px] font-mono font-bold text-foreground">74 / 100 TXS</span>
             </div>
             <div className="h-6 w-full bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "74%" }}
                  transition={{ duration: 1.5, type: 'spring' }}
                  className="h-full bg-emerald-500 rounded-full flex items-center justify-end px-3"
                >
                   <Leaf size={12} className="text-white fill-white" />
                </motion.div>
             </div>
             <p className="text-[11px] text-muted-foreground text-center italic font-medium px-4">
                "Planting trees is the highest form of architectural legacy."
             </p>
          </div>

          {/* Share Action */}
          <button className="w-full h-16 bg-emerald-600 text-white rounded-[24px] px-6 flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-lg shadow-emerald-600/20 font-black uppercase tracking-widest text-[14px]">
             <Share2 size={20} />
             Share Your Impact
          </button>
        </div>
      </div>
    </div>
  );
};

const BentoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[28px] p-5 flex flex-col gap-3">
    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 leading-none mb-1">{label}</p>
      <p className="text-[14px] font-bold text-foreground leading-none">{value}</p>
    </div>
  </div>
);

export default TitanForestScreen;
