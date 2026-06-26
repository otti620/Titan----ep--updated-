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
           <h1 className="large-title text-foreground mb-4">PayTitan</h1>
        </div>

        <div className="px-5 space-y-8">
          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="footnote text-muted-foreground uppercase tracking-widest pl-1">Payment</h3>
            <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[28px] p-5 text-foreground shadow-sm">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                <GridItem icon={<Send className="text-blue-500" />} label="Transfer" onClick={() => onNavigate('bank-transfer')} />
                <GridItem icon={<Users2 className="text-pink-500" />} label="Contacts" onClick={() => onNavigate('contacts')} />
                <GridItem icon={<Wallet className="text-orange-500" />} label="Wallets" onClick={() => onNavigate('topup')} />
                <GridItem icon={<RefreshCw className="text-yellow-500" />} label="Convert" onClick={() => {
                  hapticFeedback('medium');
                  toast.info("Convert & Swap Under Review", {
                    description: "Multi-currency swap is currently undergoing FX regulatory clearance with our BaaS partner."
                  });
                }} />
                <GridItem icon={<HandCoins className="text-emerald-500" />} label="Request" onClick={() => onNavigate('request-money')} />
                
                <GridItem icon={<AtSign className="text-blue-400" />} label="Pay Tag" onClick={() => onNavigate('transfer')} />
                <GridItem icon={<Phone className="text-purple-600" />} label="Airtime" onClick={() => onNavigate('airtime')} />
                <GridItem icon={<Rss className="text-yellow-500" />} label="Data" onClick={() => onNavigate('data')} />
                <GridItem icon={<FileText className="text-indigo-500" />} label="Bills" onClick={() => onNavigate('bills')} />
                
                <GridItem icon={<Calendar className="text-slate-500" />} label="History" onClick={() => onNavigate('history')} />
                <GridItem icon={<Sparkles className="text-indigo-500" />} label="OTC Nearby" onClick={() => onNavigate('titan-nearby')} />
                <GridItem icon={<FileCheck className="text-emerald-600" />} label="Invoice" onClick={() => {
                  hapticFeedback('medium');
                  toast.info("Invoice System Coming Soon", {
                    description: "Merchant invoicing rails are undergoing corporate compliance underwriting and will launch soon."
                  });
                }} />
                <GridItem icon={<Megaphone className="text-red-500" />} label="Referral" onClick={() => onNavigate('referral')} />
              </div>
            </div>
          </div>

          {/* Others Section */}
          <div className="space-y-4">
            <h3 className="footnote text-muted-foreground uppercase tracking-widest pl-1">Others</h3>
            <div className="flex gap-3">
              <div className="w-1/4">
                <GridItem standalone icon={<Link2 className="text-blue-500" />} label="BioHub" onClick={() => {
                  hapticFeedback('medium');
                  toast.info("BioHub Identity Coming Soon", {
                    description: "Decentralized digital profile verification is pending technical partner clearance."
                  });
                }} />
              </div>
              <div className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[22px] p-5 flex items-center justify-between relative overflow-hidden shadow-sm active:scale-[0.97] transition-transform ios-spring">
                <div className="relative z-10">
                  <p className="text-white subheadline font-semibold leading-tight mb-1">PayTitan has more<br />in store for you</p>
                  <p className="text-white/80 caption-1">More features coming soon!</p>
                </div>
                <Rocket className="text-white/20 absolute -right-2 -bottom-2 w-16 h-16 rotate-12" strokeWidth={1.5} />
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