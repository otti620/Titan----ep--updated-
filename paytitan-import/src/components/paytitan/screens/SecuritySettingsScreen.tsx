"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Fingerprint, Smartphone, Lock, Eye, ShieldCheck, ChevronRight } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../../lib/utils';

const SecuritySettingsScreen = ({ onBack, onChangePin }: { onBack: () => void, onChangePin: () => void }) => {
  const { privacy, updatePrivacy } = usePayTitan();
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
           <span className="headline tracking-tight">Security</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          <div className="space-y-1">
            <h2 className="large-title tracking-tight text-foreground">TitanShield™</h2>
            <p className="subheadline text-muted-foreground">Advanced protection for your digital assets.</p>
          </div>

          <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] dark:from-[#1c1c1e] dark:to-[#222224] p-6 rounded-[28px] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-20 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-[18px] flex items-center justify-center text-green-500 border border-green-500/20 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="title-3 font-semibold text-white tracking-tight">System Secure</p>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                   <p className="caption-2 font-bold text-white/50 uppercase tracking-widest">Last Scan: Just Now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="px-4 footnote font-semibold text-muted-foreground uppercase tracking-widest pb-1">AUTHENTICATION</h3>
            <div className="ios-list-group px-0">
              <SecurityToggle icon={<Fingerprint />} label="Biometric Login" active={true} hasBorder />
              <SecurityToggle icon={<Smartphone />} label="Two-Factor Auth" active={true} hasBorder />
              <button 
                onClick={() => { hapticFeedback('medium'); onChangePin(); }}
                className="w-full flex items-center justify-between py-3 px-4 active:bg-black/5 dark:active:bg-white/5 transition-colors ios-spring relative"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                    <Lock size={18} strokeWidth={2} />
                  </div>
                  <span className="body font-semibold text-foreground tracking-tight">Transaction PIN</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="subheadline text-muted-foreground">Enabled</span>
                  <ChevronRight size={20} className="text-muted-foreground/50" />
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="px-4 footnote font-semibold text-muted-foreground uppercase tracking-widest pb-1">PRIVACY</h3>
            <div className="ios-list-group px-0">
              <SecurityToggle 
                icon={<Eye />} 
                label="Hide Balance on Home" 
                active={privacy.hideBalance} 
                onToggle={(v) => updatePrivacy('hideBalance', v)}
                hasBorder
              />
              <SecurityToggle 
                icon={<Shield />} 
                label="Incognito Mode" 
                active={privacy.incognito} 
                onToggle={(v) => updatePrivacy('incognito', v)}
                hasBorder={false}
              />
            </div>
          </div>

          <div className="bg-emerald-500/10 p-5 rounded-[24px] flex items-start gap-4 mx-2">
             <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} strokeWidth={2} />
             <p className="caption-1 text-foreground leading-relaxed">
               PayTitan uses bank-grade <span className="font-semibold text-emerald-500">AES-256</span> encryption to secure your data. Your private keys never leave your device.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityToggle = ({ icon, label, active, onToggle, hasBorder }: { icon: React.ReactNode, label: string, active: boolean, onToggle?: (v: boolean) => void, hasBorder?: boolean }) => (
  <div className={cn("flex items-center justify-between py-3 px-4", hasBorder && "ios-hairline-bottom")}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-foreground shrink-0">
        {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 18, strokeWidth: 2 })}
      </div>
      <span className="body font-semibold text-foreground tracking-tight">{label}</span>
    </div>
    <button 
      onClick={() => { hapticFeedback('light'); onToggle?.(!active); }}
      className={cn(
        "w-[51px] h-[31px] rounded-full relative transition-colors duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] shrink-0",
        active ? "bg-[#34C759]" : "bg-[#E9E9EB] dark:bg-[#39393D]"
      )}
    >
      <div className={cn(
        "absolute top-[1.5px] w-7 h-7 bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out",
        active ? "left-[19px]" : "left-[1.5px]"
      )} />
    </button>
  </div>
);

export default SecuritySettingsScreen;