"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Wallet, RefreshCw, HandCoins, AtSign, Phone, Rss, 
  FileText, Calendar, FileSearch, FileCheck, Megaphone, 
  Link2, QrCode, ChevronRight, Rocket, Sparkles, Users2
} from 'lucide-react';
import { hapticFeedback, cn } from '../../../lib/utils';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';

interface PaymentsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const PaymentsScreen = ({ onBack, onNavigate }: PaymentsScreenProps) => {
  const { profile } = usePayTitan();

  // Navigation bar large title collapse state
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
      {/* iOS Navigation Bar */}
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        {/* Placeholder for left items if needed, or keeping spacing */}
        <div className="w-20" />
        
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline text-foreground">PayTitan</span>
        </div>

        <div className="flex items-center gap-3 w-20 justify-end flex-shrink-0 z-10">
          <button 
            onClick={() => onNavigate('qr-code')}
            className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-foreground active:scale-90 transition-transform ios-spring"
          >
            <QrCode size={20} strokeWidth={1.5} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.first_name || 'Titan'}`} className="w-full h-full object-cover" alt="Avatar" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-5 pt-2 pb-2">
           <div ref={sentinelRef} className="h-1 w-full" />
           <h1 className="text-[32px] font-black text-foreground tracking-tighter leading-none italic mb-1">Titan Protocol</h1>
           <p className="text-[14px] text-muted-foreground font-medium mb-6">Financial orchestration nodes.</p>
        </div>

        <div className="px-5 space-y-10">
          {/* Payment Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transaction Nodes</h3>
               <div className="flex gap-1 opacity-20">
                 {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-foreground" />)}
               </div>
            </div>
            
            <div className="glass-card rounded-[40px] p-8">
              <div className="grid grid-cols-4 gap-y-10 gap-x-2">
                <GridItem icon={<Send className="text-indigo-500" />} label="Transfer" onClick={() => onNavigate('bank-transfer')} />
                <GridItem icon={<Users2 className="text-foreground" />} label="Contacts" onClick={() => onNavigate('contacts')} />
                <GridItem icon={<Wallet className="text-foreground" />} label="Wallets" onClick={() => onNavigate('topup')} />
                <GridItem icon={<RefreshCw className="text-indigo-500" />} label="Convert" onClick={() => {
                  hapticFeedback('medium');
                  toast.info("Convert Node Under Audit", {
                    description: "Multi-currency swap protocols are currently undergoing FX architectural verification."
                  });
                }} />
                <GridItem icon={<HandCoins className="text-emerald-500" />} label="Request" onClick={() => onNavigate('request-money')} />
                
                <GridItem icon={<AtSign className="text-indigo-400" />} label="Pay Tag" onClick={() => onNavigate('transfer')} />
                <GridItem icon={<Phone className="text-foreground" />} label="Mobile" onClick={() => onNavigate('airtime')} />
                <GridItem icon={<Rss className="text-foreground" />} label="Data" onClick={() => onNavigate('data')} />
                <GridItem icon={<FileText className="text-foreground" />} label="Bills" onClick={() => onNavigate('bills')} />
                
                <GridItem icon={<Calendar className="text-muted-foreground" />} label="Ledger" onClick={() => onNavigate('history')} />
                <GridItem icon={<Sparkles className="text-amber-500" />} label="Nearby" onClick={() => onNavigate('titan-nearby')} />
                <GridItem icon={<FileCheck className="text-emerald-600" />} label="Invoice" onClick={() => {
                  hapticFeedback('medium');
                  toast.info("Invoicing Under Synthesis", {
                    description: "Merchant invoicing protocols are being synthesized and will launch in the next cycle."
                  });
                }} />
                <GridItem icon={<Megaphone className="text-red-500" />} label="Referral" onClick={() => onNavigate('referral')} />
              </div>
            </div>
          </div>

          {/* Social Engineering Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Social Engineering</h3>
            <div className="flex gap-4">
              <div className="w-1/4">
                <GridItem standalone icon={<Link2 className="text-indigo-500" />} label="BioHub" onClick={() => {
                  hapticFeedback('medium');
                  toast.info("BioHub Verification Pending", {
                    description: "Decentralized identity verification is pending partner node clearance."
                  });
                }} />
              </div>
              <div className="flex-1 glass-card rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden group active:scale-[0.98] transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Rocket size={80} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <p className="text-foreground text-[16px] font-black italic uppercase leading-tight mb-1">Architect<br />Your Wealth</p>
                  <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">Protocol v2.4 Active</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                   <ChevronRight size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Banner */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[28px] p-6 relative overflow-hidden shadow-sm active:scale-[0.97] transition-transform ios-spring">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h4 className="text-white headline leading-tight">Simplify your online<br />presence in one link.</h4>
                <p className="text-white/80 subheadline">Keep your links organized and accessible with BioHub.</p>
              </div>
              <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-full subheadline font-semibold active:scale-95 transition-all ios-spring">
                Organize Now
              </button>
            </div>
            
            {/* Floating Social Icons Mockup */}
            <div className="absolute right-4 bottom-4 flex flex-wrap gap-2 w-24 opacity-40">
              <div className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full" />
              <div className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full" />
              <div className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GridItem = ({ icon, label, onClick, standalone = false }: { icon: React.ReactNode, label: string, onClick: () => void, standalone?: boolean }) => (
  <button 
    onClick={() => { hapticFeedback('light'); onClick(); }}
    className="flex flex-col items-center gap-2 group mx-auto"
  >
    <div className={cn(
      "w-[60px] h-[60px] bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 flex items-center justify-center group-active:scale-90 transition-transform ios-spring",
      standalone ? "rounded-[22px] shadow-sm bg-white/40 dark:bg-white/10" : "rounded-[18px]"
    )}>
      {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 24, strokeWidth: 1.5 })}
    </div>
    <span className="caption-1 text-foreground text-center font-semibold">
      {label}
    </span>
  </button>
);

export default PaymentsScreen;