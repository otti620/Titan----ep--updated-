"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Plus, TrendingUp, ShieldCheck, Wallet, Loader2, ArrowDownCircle } from 'lucide-react';
import { usePayTitan, Vault } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { cn, hapticFeedback } from '../../../lib/utils';

const VaultDetailsScreen = ({ vault, onBack }: { vault: Vault, onBack: () => void }) => {
  const { addFundsToVault, withdrawFromVault, balance } = usePayTitan();
  const [isProcessing, setIsProcessing] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-70px 0px 0px 0px" }
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleAddFunds = async () => {
    if (isProcessing) return;
    hapticFeedback('medium');
    const amountStr = prompt(`Enter amount to add to ${vault.title} (Max: ₦${balance.toLocaleString()}):`);
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance in main wallet");
      return;
    }

    setIsProcessing(true);
    await addFundsToVault(vault.id, amount);
    setIsProcessing(false);
  };

  const handleWithdraw = async () => {
    if (isProcessing) return;
    hapticFeedback('medium');
    const amountStr = prompt(`Enter amount to withdraw from ${vault.title} (Max: ₦${vault.saved_amount.toLocaleString()}):`);
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > vault.saved_amount) {
      toast.error("Insufficient balance in vault");
      return;
    }

    setIsProcessing(true);
    await withdrawFromVault(vault.id, amount);
    setIsProcessing(false);
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={onBack} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline tracking-tight">Vault Details</span>
        </div>
        <div className="w-20 flex justify-end">
          <button className="text-indigo-500 active:opacity-60 transition-opacity">
            <Settings size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="w-20 h-20 bg-card rounded-[22px] flex items-center justify-center shadow-sm border border-border">
              <Wallet size={36} strokeWidth={1.5} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="large-title tracking-tight text-foreground">{vault.title}</h2>
              <p className="subheadline text-muted-foreground mt-1">Target: {vault.target_date}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] dark:from-[#1c1c1e] dark:to-[#222224] p-6 rounded-[28px] shadow-md relative overflow-hidden ios-spring">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 blur-[50px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="caption-1 text-white/50 font-semibold uppercase tracking-widest mb-1">SAVED AMOUNT</p>
                  <p className="text-[32px] font-bold text-white tracking-tight tabular-nums pb-1">₦{vault.saved_amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="caption-1 text-white/50 font-semibold uppercase tracking-widest mb-1">TARGET</p>
                  <p className="title-3 font-semibold text-white/70 tabular-nums">₦{vault.goal_amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${vault.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-indigo-500 rounded-full" 
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="caption-1 font-semibold text-indigo-400">{vault.progress}% Completed</span>
                  <div className="flex items-center gap-1.5 text-green-400">
                    <TrendingUp size={14} strokeWidth={2} />
                    <span className="caption-2 font-bold uppercase tracking-widest">On Track</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-[24px] shadow-sm border border-border">
              <p className="caption-2 text-muted-foreground font-semibold uppercase tracking-widest mb-2">INTEREST EARNED</p>
              <p className="title-3 font-bold text-green-500 tracking-tight">+₦{(vault.saved_amount * 0.01).toFixed(2)}</p>
              <p className="caption-2 text-muted-foreground font-medium mt-1">12% APY Active</p>
            </div>
            <div className="bg-card p-4 rounded-[24px] shadow-sm border border-border">
              <p className="caption-2 text-muted-foreground font-semibold uppercase tracking-widest mb-2">AUTO-SAVE</p>
              <p className="title-3 font-bold text-foreground tracking-tight">OFF</p>
              <p className="caption-2 text-muted-foreground font-medium mt-1 text-indigo-500">Tap to enable</p>
            </div>
          </div>

          <div className="bg-emerald-500/10 p-5 rounded-[24px] flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="caption-1 font-semibold text-foreground">TitanShield™ Protected</p>
              <p className="caption-2 text-muted-foreground mt-0.5 leading-relaxed">
                Vault funds are isolated from your main wallet and protected by multi-layer encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/80 backdrop-blur-xl border-t border-border flex gap-3 pb-[env(safe-area-inset-bottom,20px)]">
        <button 
          onClick={handleWithdraw}
          disabled={isProcessing || vault.saved_amount <= 0}
          className="flex-1 bg-card text-foreground py-3.5 rounded-full headline border border-border flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform ios-spring"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownCircle size={20} />} Withdraw
        </button>
        <button 
          onClick={handleAddFunds}
          disabled={isProcessing}
          className="flex-[1.5] bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />} Add Funds
        </button>
      </div>
    </div>
  );
};

export default VaultDetailsScreen;