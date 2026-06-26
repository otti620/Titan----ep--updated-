"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Plane, Home, Coffee, ArrowRight, UserPlus, Sparkles, Heart, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

const CirclesScreen = ({ onCreate, onJoin, onSelectCircle }: { onCreate: () => void, onJoin: () => void, onSelectCircle: (c: any) => void }) => {
  const { circles } = usePayTitan();

  return (
    <div className="px-5 space-y-8 pt-[env(safe-area-inset-top,14px)] mt-4">
      <div className="space-y-1">
        <h1 className="large-title tracking-tight text-foreground">
          Tribes
        </h1>
        <p className="headline text-muted-foreground font-medium">
          Hit your money goals together.
        </p>
      </div>

      {/* Tribe List */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center px-4 pb-1">
          <h3 className="footnote font-semibold text-muted-foreground uppercase tracking-widest">Your Tribes</h3>
          <button onClick={() => { hapticFeedback('light'); onJoin(); }} className="text-indigo-500 footnote font-bold active:opacity-60 uppercase tracking-widest">Join</button>
        </div>

        {circles.length > 0 ? (
          <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[28px] overflow-hidden">
            {circles.map((circle, index) => (
              <button 
                key={circle.id}
                onClick={() => { hapticFeedback('medium'); onSelectCircle(circle); }}
                className={cn(
                  "w-full py-3.5 px-4 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors ios-spring",
                  index !== circles.length - 1 && "ios-hairline-bottom"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <Users size={20} strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <h4 className="body font-semibold text-foreground tracking-tight">{circle.name}</h4>
                    <p className="caption-1 text-muted-foreground font-medium mt-0.5">{circle.members_count} active members</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground/50 shrink-0" />
              </button>
            ))}
            
            {/* Create new circle button in the list */}
            <button 
                onClick={() => { hapticFeedback('medium'); onCreate(); }}
                className="w-full py-3.5 px-4 flex items-center gap-3 active:bg-black/5 dark:active:bg-white/5 transition-colors ios-spring ios-hairline-bottom"
            >
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground shrink-0">
                  <Plus size={20} strokeWidth={2} />
              </div>
              <span className="body font-semibold text-foreground tracking-tight">Start new Tribe</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { hapticFeedback('success'); onCreate(); }}
            className="w-full bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[32px] p-8 text-left relative overflow-hidden shadow-sm active:scale-[0.98] transition-all ios-spring"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-[3px] border-indigo-500 overflow-hidden bg-indigo-400">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-white/20 border-[3px] border-indigo-500 flex items-center justify-center text-white backdrop-blur-sm">
                  <Plus size={18} strokeWidth={2} />
                </div>
              </div>
              <div>
                <h5 className="title-2 font-bold text-white tracking-tight">Start your Tribe</h5>
                <p className="caption-1 font-medium text-white/80 mt-1">Create a Circle/Ajo/Esusu for your friends</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Marketing Section */}
      <div className="bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 dark:border-emerald-500/10 rounded-[28px] p-5 shadow-sm relative overflow-hidden mx-1">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="caption-1 font-bold text-emerald-800 dark:text-emerald-300">Titan Guard™ Active</p>
            <p className="caption-2 text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed mt-0.5">
              All community Ajo deposits are kept in locked decentralized multi-signature protection smart contracts on the blockchain ledger.
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-24" />
    </div>
  );
};

export default CirclesScreen;