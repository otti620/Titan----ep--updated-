"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, ChevronRight } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

const AccountLimitsScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile } = usePayTitan();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-calculate contribution whenever goal, frequency, or duration changes
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-30px 0px 0px 0px" }
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const limits = profile?.limits || {
    daily_transfer: 100000,
    daily_withdrawal: 50000,
    weekly_limit: 500000,
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      {/* Header */}
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={() => { hapticFeedback('light'); onBack(); }} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline tracking-tight">Account Limits</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          <div className="space-y-1">
            <h2 className="large-title tracking-tight text-foreground">Account Limits</h2>
          </div>

          <div className="ios-list-group space-y-0 px-4 py-4 flex flex-row items-center justify-between">
             <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 shrink-0">
                   <ShieldCheck size={26} strokeWidth={1.5} />
                </div>
                <div>
                   <h2 className="title-3 tracking-tight text-foreground">{profile?.user_tier || 'Silver'} Tier</h2>
                   <p className="caption-1 font-medium text-muted-foreground mt-0.5">Status: Active & Secure</p>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <p className="px-4 footnote font-semibold text-muted-foreground uppercase tracking-widest pb-1">TRANSACTION LIMITS</p>
            <div className="ios-list-group px-0 space-y-0">
               <LimitItem 
                  icon={<ArrowUpRight size={18} strokeWidth={2} className="text-blue-500" />} 
                  label="Daily Transfer" 
                  value={limits.daily_transfer} 
                  description="Max sending capacity per 24hrs" 
                  hasBorder
               />
               <LimitItem 
                  icon={<ArrowDownLeft size={18} strokeWidth={2} className="text-emerald-500" />} 
                  label="Daily Withdrawal" 
                  value={limits.daily_withdrawal} 
                  description="ATM & Counter withdrawal capacity" 
                  hasBorder
               />
               <LimitItem 
                  icon={<CreditCard size={18} strokeWidth={2} className="text-orange-500" />} 
                  label="Weekly Spending" 
                  value={limits.weekly_limit} 
                  description="Total platform outflow limit" 
               />
            </div>
          </div>

          <div className="bg-indigo-500/10 p-5 rounded-[24px] space-y-2 shadow-sm mx-2">
             <div className="flex items-center gap-1.5 text-indigo-500">
                <Star size={18} fill="currentColor" />
                <span className="headline tracking-tight">Upgrade to Gold</span>
             </div>
             <p className="caption-1 text-foreground leading-relaxed pt-1">
                Unlock ₦10,000,000 daily limits and physical Titan Black cards by upgrading your verification to Tier 3.
             </p>
             <button onClick={() => hapticFeedback('success')} className="w-full bg-indigo-500 text-white py-3.5 mt-3 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring">
                Upgrade Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LimitItem = ({ icon, label, value, description, hasBorder }: { icon: React.ReactNode, label: string, value: number, description: string, hasBorder?: boolean }) => (
  <div className={cn("p-4 flex flex-col gap-3", hasBorder && "ios-hairline-bottom")}>
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-3 w-full">
          <div className="w-9 h-9 border border-border shadow-sm rounded-full flex items-center justify-center bg-card shrink-0">
             {icon}
          </div>
          <div className="flex-1 min-w-0">
             <h4 className="body font-semibold tracking-tight text-foreground truncate">{label}</h4>
             <p className="caption-1 text-muted-foreground font-medium truncate">{description}</p>
          </div>
       </div>
    </div>
    <div className="space-y-1.5 pl-[48px]">
       <div className="flex justify-between items-end">
          <span className="title-2 font-bold tabular-nums tracking-tight text-foreground">₦{value.toLocaleString()}</span>
       </div>
       <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: '15%' }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="h-full bg-indigo-500 rounded-full" 
          />
       </div>
       <div className="flex justify-between caption-2 font-medium text-muted-foreground">
          <span>₦0 used</span>
          <span>15% limit</span>
       </div>
    </div>
  </div>
);

const Star = ({ size, fill }: { size: number, fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default AccountLimitsScreen;
