"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Smartphone, Heart, Umbrella, ArrowRight, TrendingUp, ShieldCheck, Clock } from 'lucide-react';
import { usePayTitan, Vault } from '../../../context/PayTitanContext';
import { cn, hapticFeedback } from '../../../lib/utils';

const VaultsScreen = ({ onCreate, onSelectVault }: { onCreate: () => void, onSelectVault: (v: Vault) => void }) => {
  const { vaults } = usePayTitan();

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics': return <Smartphone className="text-indigo-500" />;
      case 'life event': return <Heart className="text-green-500" />;
      case 'emergency': return <Umbrella className="text-blue-500" />;
      default: return <Smartphone className="text-amber-500" />;
    }
  };

  const totalSaved = vaults.reduce((acc, v) => acc + v.saved_amount, 0);

  return (
    <div className="flex-1 pb-24 w-full relative">
      <div className="px-5 space-y-6 pt-4">
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="title-1 font-black text-foreground tracking-tight">Active Goals</h2>
            <p className="text-muted-foreground text-sm font-medium">Manifest your financial targets.</p>
          </div>
          <button 
            onClick={() => { hapticFeedback('medium'); onCreate(); }} 
            className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-indigo-500/30"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Global Stats Banner */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[32px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="bg-card border border-border shadow-sm rounded-[32px] p-6 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Portfolio Value</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground tabular-nums">₦{totalSaved.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Total</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-500 font-bold justify-end">
                  <TrendingUp size={14} />
                  <span className="text-xs">12.5% APY</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Auto-compounding</p>
              </div>
            </div>
            
            {/* Minimal Progress visualization */}
            <div className="mt-6 flex gap-1 h-1.5 w-full">
              {vaults.length > 0 ? (
                vaults.map((v, i) => (
                  <div 
                    key={v.id} 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      i === 0 ? "bg-indigo-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-emerald-500" : "bg-muted"
                    )}
                    style={{ width: `${(v.saved_amount / (totalSaved || 1)) * 100}%` }}
                  />
                ))
              ) : (
                <div className="w-full h-full bg-muted rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Vault Grid/List */}
        <div className="grid gap-4">
          {vaults.length > 0 ? (
            vaults.map((vault, idx) => (
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={vault.id}
                onClick={() => { hapticFeedback('light'); onSelectVault(vault); }}
                className="w-full bg-card border border-border/50 shadow-sm rounded-[28px] p-5 text-left active:scale-[0.98] transition-all ios-spring group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-[18px] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getIcon(vault.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[16px] text-foreground tracking-tight">{vault.title}</h4>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{vault.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                      vault.progress >= 100 ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'
                    )}>
                      {vault.progress}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-lg font-black text-foreground tracking-tight tabular-nums">
                      ₦{vault.saved_amount.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground mb-1">
                      of ₦{vault.goal_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-border/20">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, vault.progress)}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={cn(
                        "h-full rounded-full",
                        vault.progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-indigo-500 to-blue-500"
                      )} 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Clock size={12} /> Target: {vault.target_date}
                  </p>
                  <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))
          ) : (
            <div className="bg-card border-2 border-dashed border-border rounded-[32px] p-10 flex flex-col items-center justify-center text-center gap-4 mt-2">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center">
                <ShieldCheck size={32} className="text-indigo-500" />
              </div>
              <div className="space-y-1 max-w-[200px]">
                <h4 className="font-bold text-foreground">Secure your future</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Pockets allow you to isolate funds for specific goals with zero withdrawal fees.</p>
              </div>
              <button 
                onClick={() => { hapticFeedback('medium'); onCreate(); }}
                className="mt-2 bg-indigo-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
              >
                Create First Pocket
              </button>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[28px] flex items-center gap-4 mt-8">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
             <ShieldCheck size={20} />
          </div>
          <p className="text-[11px] text-foreground/70 leading-relaxed font-medium">
            Vault assets are strictly segregated from transactional balances and insured under the <span className="font-bold text-emerald-600">TitanShield™</span> protocol.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VaultsScreen;