"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ChevronRight, Search, Zap, Smartphone, Tv, Globe, Trophy } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { cn, hapticFeedback } from '../../../lib/utils';

const BillsScreen = ({ onBack, onSelectCategory }: { onBack: () => void, onSelectCategory: (cat: string) => void }) => {
  const { profile } = usePayTitan();
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
    <div className="h-full w-full bg-background flex flex-col relative">
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={onBack} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
           <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <span className={cn(
           "headline text-foreground tracking-tight absolute left-1/2 -translate-x-1/2 transition-opacity duration-300",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>Services</span>
        <div className="w-20 flex justify-end">
           <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-card">
              <img src={profile?.selected_avatar_memoji || "https://api.dicebear.com/7.x/avataaars/svg?seed=Tolu"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title text-foreground tracking-tight">Services</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/60" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search biller or category..." 
              className="w-full bg-black/5 dark:bg-white/10 border-none rounded-xl py-2 pl-10 pr-4 text-[17px] text-foreground focus:ring-0 outline-none placeholder:text-muted-foreground/60 placeholder:font-normal caret-indigo-500"
            />
          </div>

          {/* Categories Grid */}
          <div>
            <h3 className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2 mb-2">Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              <BillCategory 
                icon={<Smartphone className="text-orange-500" strokeWidth={1.5} size={24} />} 
                label="Airtime & Data" 
                onClick={() => { hapticFeedback('light'); onSelectCategory('Airtime'); }} 
              />
              <BillCategory 
                icon={<Zap className="text-yellow-500" strokeWidth={1.5} size={24} />} 
                label="Electricity" 
                onClick={() => { hapticFeedback('light'); onSelectCategory('Electricity'); }} 
              />
              <BillCategory 
                icon={<Tv className="text-blue-500" strokeWidth={1.5} size={24} />} 
                label="Cable TV" 
                onClick={() => { hapticFeedback('light'); onSelectCategory('Cable TV'); }} 
              />
              <BillCategory 
                icon={<Globe className="text-green-500" strokeWidth={1.5} size={24} />} 
                label="Internet" 
                onClick={() => { hapticFeedback('light'); onSelectCategory('Internet'); }} 
              />
              <BillCategory 
                icon={<Trophy className="text-red-500" strokeWidth={1.5} size={24} />} 
                label="Gaming & Betting" 
                onClick={() => { hapticFeedback('light'); onSelectCategory('Gaming'); }} 
              />
            </div>
          </div>

          {/* Frequent Bills */}
          <div>
            <h3 className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2 mb-2">Recent Payments</h3>
            <div className="ios-list-group px-0">
              <BillItem 
                logo="https://logo.clearbit.com/mtn.com"
                fallbackIcon={<Smartphone className="text-yellow-500" strokeWidth={1.5} size={22} />} 
                title="MTN Nigeria" 
                subtitle="0812 000 0000" 
                lastPaid="₦5,000 • Yesterday" 
                hasBorder
                onClick={() => { hapticFeedback('light'); onSelectCategory('Airtime'); }}
              />
              <BillItem 
                logo="https://logo.clearbit.com/dstv.com"
                fallbackIcon={<Tv className="text-blue-500" strokeWidth={1.5} size={22} />} 
                title="DSTV Compact" 
                subtitle="Smartcard: 1029384756" 
                lastPaid="₦12,500 • 2 weeks ago" 
                hasBorder
                onClick={() => { hapticFeedback('light'); onSelectCategory('Cable TV'); }}
              />
              <BillItem 
                logo="https://logo.clearbit.com/kedcocorp.com"
                fallbackIcon={<Zap className="text-green-500" strokeWidth={1.5} size={22} />} 
                title="Ikeja Electric" 
                subtitle="Meter: 45092238441" 
                lastPaid="₦15,000 • Last month" 
                hasBorder={false}
                onClick={() => { hapticFeedback('light'); onSelectCategory('Electricity'); }}
              />
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-[20px] flex items-center gap-4 shadow-sm border border-gray-800">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-semibold text-[15px]">TitanShield™ Active</p>
              <p className="text-white/60 text-xs leading-snug mt-0.5">
                Your payments are processed instantly over secure banking channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillCategory = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col items-start gap-4 active:scale-95 transition-transform ios-spring">
    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <p className="headline text-foreground text-left">{label}</p>
  </button>
);

const BillItem = ({ logo, fallbackIcon, title, subtitle, lastPaid, onClick, hasBorder }: { logo?: string, fallbackIcon: React.ReactNode, title: string, subtitle: string, lastPaid: string, onClick: () => void, hasBorder: boolean }) => {
  const [imgError, setImgError] = React.useState(false);
  
  return (
    <button onClick={onClick} className={cn(
      "w-full px-4 py-3 flex items-center gap-3 active:bg-black/5 dark:active:bg-white/5 transition-colors text-left",
      hasBorder && "ios-hairline-bottom"
    )}>
      <div className="w-11 h-11 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center overflow-hidden border border-border shrink-0">
        {!imgError && logo ? (
          <img src={logo} alt={title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : fallbackIcon}
      </div>
      <div className="flex-1">
        <h4 className="body font-semibold text-foreground">{title}</h4>
        <p className="subheadline text-muted-foreground">{subtitle}</p>
      </div>
      <div className="text-right flex items-center gap-2">
        <div className="flex flex-col items-end gap-1">
          <p className="caption-2 text-muted-foreground font-semibold uppercase tracking-widest pl-1">Last Paid</p>
          <p className="caption-1 font-semibold text-foreground">{lastPaid}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/40 mt-1" strokeWidth={2} />
      </div>
    </button>
  );
};

export default BillsScreen;