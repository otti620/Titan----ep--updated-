"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { Plus, ShieldCheck, Globe, CreditCard, Lock, ArrowLeft } from 'lucide-react';

const CardsScreen = ({ onBack, onRequestPhysical }: { onBack: () => void, onRequestPhysical: () => void }) => {
  const { cards, createCard, profile, toggleCardLock } = usePayTitan();
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

  const handleCreate = () => {
    hapticFeedback('heavy');
    createCard();
  };

  const activeCard = cards[0];

  return (
    <div className="h-full w-full bg-background text-foreground flex flex-col overflow-hidden relative">
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
           <span className="headline text-foreground tracking-tight">Virtual Architect</span>
        </div>
        <div className="w-20 flex justify-end">
          <button 
            onClick={handleCreate}
            className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <Plus size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title text-foreground tracking-tight">Virtual Architect</h1>
          
          {/* Virtual Card Display */}
          <div className="pt-2">
          <AnimatePresence mode="wait">
            {activeCard ? (
              <motion.div 
                key={activeCard.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: activeCard.status === 'frozen' ? 'grayscale(1) opacity(0.5)' : 'grayscale(0) opacity(1)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 overflow-hidden shadow-sm border border-border group cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20" />
                
                {activeCard.status === 'frozen' && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                       <Lock size={32} className="text-white" strokeWidth={1.5} />
                       <span className="text-white caption-1 font-bold uppercase tracking-widest">Frozen</span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-10 bg-yellow-500/20 rounded-md border border-yellow-500/30 flex items-center justify-center">
                       <div className="w-8 h-6 bg-yellow-500/40 rounded-sm" />
                    </div>
                    <span className="text-white/40 font-bold italic text-xl tracking-tighter">TITAN</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-white/90 text-[22px] font-mono tracking-widest">{activeCard.card_number || '•••• •••• •••• 8824'}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-white/40 caption-2 font-bold uppercase tracking-widest">Card Holder</p>
                        <p className="text-white/90 subheadline font-semibold uppercase tracking-tight mt-0.5">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                      </div>
                      <div className="w-16 h-10 flex flex-col items-end justify-end">
                         <div className="flex -space-x-4">
                           <div className="w-8 h-8 rounded-full bg-red-500/80" />
                           <div className="w-8 h-8 rounded-full bg-yellow-500/80" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div 
                onClick={handleCreate}
                className="relative aspect-[1.586/1] w-full rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-4 active:scale-95 transition-all ios-spring bg-card cursor-pointer"
              >
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                   <Plus size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                   <p className="headline text-foreground">Issue Digital Card</p>
                   <p className="caption-1 text-muted-foreground mt-1">₦8,000 one-time architect fee</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-3 gap-3">
          <CardAction 
            icon={<Lock />} 
            label={activeCard?.status === 'frozen' ? "Unfreeze" : "Freeze"} 
            active={activeCard?.status === 'frozen'}
            onClick={() => activeCard && toggleCardLock(activeCard.id)}
            disabled={!activeCard}
          />
          <CardAction 
            icon={<CreditCard />} 
            label="Details" 
            onClick={() => {}}
            disabled={!activeCard}
          />
          <CardAction 
            icon={<Globe />} 
            label="Limits" 
            onClick={() => {}}
            disabled={!activeCard}
          />
        </div>

        {/* Settings List */}
        <div className="space-y-2">
           <p className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2 mb-2">CARD SECURITY</p>
           <div className="ios-list-group px-0">
              <SecurityRow label="Online Payments" active={true} hasBorder />
              <SecurityRow label="International Transactions" active={false} hasBorder />
              <SecurityRow label="ATM Withdrawals" active={true} hasBorder={false} />
           </div>
        </div>

        {/* Physical Card Promo */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 space-y-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <ShieldCheck size={24} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h4 className="title-3 text-white">Titan Heavy Metal</h4>
              <p className="caption-1 text-white/80 leading-snug font-medium mt-1">Order our signature physical metal card. 18g of financial engineering.</p>
            </div>
          </div>
          <button 
            onClick={onRequestPhysical}
            className="w-full py-3.5 bg-white text-indigo-600 rounded-full headline active:scale-95 transition-transform ios-spring shadow-sm"
          >
            Claim Your Metal
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

const CardAction = ({ icon, label, onClick, disabled, active }: { icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean, active?: boolean }) => (
  <button 
    disabled={disabled}
    onClick={() => { hapticFeedback('medium'); onClick?.(); }}
    className={cn(
      "flex flex-col items-center gap-2 transition-all p-3 rounded-2xl bg-card border border-border shadow-sm",
      disabled ? "opacity-30 cursor-not-allowed" : "active:bg-accent ios-spring",
      active ? "bg-red-500/10 border-red-500/20" : ""
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
      active ? "bg-red-500 text-white shadow-sm" : "bg-black/5 dark:bg-white/5 text-foreground"
    )}>
      {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 20, strokeWidth: 1.5 })}
    </div>
    <span className="caption-1 font-semibold text-muted-foreground">{label}</span>
  </button>
);

const SecurityRow = ({ label, active, hasBorder }: { label: string, active: boolean, hasBorder: boolean }) => {
  const [enabled, setEnabled] = React.useState(active);
  return (
    <div className={cn("flex items-center justify-between py-3 px-4", hasBorder && "ios-hairline-bottom")}>
       <span className="body font-semibold text-foreground">{label}</span>
       <button 
         onClick={() => { hapticFeedback('light'); setEnabled(!enabled); }}
         className={cn(
           "w-[51px] h-[31px] rounded-full relative transition-colors duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]",
           enabled ? "bg-[#34C759]" : "bg-[#E9E9EB] dark:bg-[#39393D]"
         )}
       >
         <div className={cn(
           "absolute top-[1.5px] w-7 h-7 bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out",
           enabled ? "left-[19px]" : "left-[1.5px]"
         )} />
       </button>
    </div>
  );
};

export default CardsScreen;
