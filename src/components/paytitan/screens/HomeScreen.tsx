"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Bell, QrCode, Plus, Send, RefreshCw,
  MoreHorizontal, ChevronDown, History, Phone, Rss,
  FileText, HandCoins, LayoutGrid, ShieldCheck, AtSign, PiggyBank, AlertTriangle, WifiOff, X, ArrowDownToLine, Sparkles, Building2, Store, Link2, Receipt, Users, ChevronRight, Brain, TrendingUp, UserCheck, Gift, Target, Zap, Shield, Search, SearchX, Clock
} from 'lucide-react';

import { usePayTitan } from '../../../context/PayTitanContext';
import PayTitanLogo from '../PayTitanLogo';
import { hapticFeedback, cn } from '../../../lib/utils';
import { setupNotifications, sendAppNotification } from '../../../lib/notifications';
import { Skeleton, TransactionSkeleton, BalanceSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedBalance } from '../ui/AnimatedBalance';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { 
    profile, balance, transactions, privacy, updatePrivacy, settings, broadcasts, 
    isMerchantMode, toggleMerchantMode, usdBalance, gbpBalance, isInstallable, 
    installApp, contacts, vaults, isLoading, refreshData, networkStatus, isProcessing 
  } = usePayTitan();
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'GBP'>('NGN');
  const [searchQuery, setSearchQuery] = useState('');

  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');
       setIsStandalone(!!isStandaloneMatch);
    }
  }, []);

  const firstName = profile?.first_name || 'Titan';
  const isMaintenance = settings.maintenance_mode === 'true' || settings.maintenance_mode === true;

  const totalVaultBalance = vaults.reduce((acc, v) => acc + (v.saved_amount || 0), 0);
  const financialScore = (profile?.kyc_level || 1) * 300 + Math.min(50, Math.floor(balance / 50000));
  const dailyYield = Math.floor(totalVaultBalance * 0.0003); // Approx 10% APY daily equivalent

  const togglePrivacy = () => {
    hapticFeedback('medium');
    updatePrivacy('hideBalance', !privacy.hideBalance);
  };

  const getDisplayBalance = () => {
    if (currency === 'USD') return `$${usdBalance.toLocaleString()}`;
    if (currency === 'GBP') return `£${gbpBalance.toLocaleString()}`;
    return `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const nextCurrency = () => {
    hapticFeedback('light');
    if (currency === 'NGN') setCurrency('USD');
    else if (currency === 'USD') setCurrency('GBP');
    else setCurrency('NGN');
  };

  const filteredTransactions = transactions.filter(tx => 
    (tx.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
    (tx.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-32 overflow-y-auto no-scrollbar pt-12">
        <BalanceSkeleton />
        <div className="px-5 mt-10 space-y-9">
           <Skeleton className="w-full h-40 rounded-[24px]" />
           <div className="space-y-4">
              <Skeleton className="w-32 h-6 rounded-full" />
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Immersive Header & Wallet Section */}
      <div className="relative pb-10 overflow-hidden bg-background z-30">
        
        {/* Soft iOS blur background effect */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
           <div className={cn(
             "relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] opacity-20 dark:opacity-10",
             isMerchantMode ? "bg-gradient-to-tr from-indigo-500 to-indigo-800" : "bg-gradient-to-tr from-[#FF4D1C] to-[#FF8C00]"
           )} />
        </div>

        {/* Header Content */}
        <div className="relative z-10 px-6 pt-[env(safe-area-inset-top,14px)] mb-2 flex flex-col gap-4 mt-6">
          {settings.announcement && (
            <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="bg-indigo-500 rounded-[14px] p-4 shadow-lg shadow-indigo-500/20 flex items-start gap-4 mb-2"
            >
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Zap size={18} fill="currentColor" />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Notice from HQ</p>
                  <p className="text-xs font-bold text-white leading-tight mt-0.5">{settings.announcement}</p>
               </div>
            </motion.div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white dark:bg-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-xl border border-border">
                <PayTitanLogo size={26} />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="text-[24px] font-bold text-foreground tracking-[-0.03em]">
                  {isMerchantMode ? "Business Hub" : `Hello, ${firstName}`}
                </span>
                <div className="flex items-center gap-2">
                   {!isMerchantMode && (
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">
                      Tier {profile?.kyc_level || 1}
                    </span>
                  )}
                  {networkStatus !== 'online' && (
                    <span className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px] font-black text-amber-500 uppercase tracking-tighter transition-all animate-pulse">
                      • {networkStatus === 'offline' ? 'Offline' : 'Reconnecting'}
                    </span>
                  )}
                  {isProcessing && (
                    <span className="flex items-center gap-1 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] font-black text-indigo-500 uppercase tracking-tighter transition-all">
                      • Syncing
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={toggleMerchantMode}
                className={cn(
                  "p-2.5 rounded-2xl transition-all border",
                  isMerchantMode 
                    ? "bg-indigo-500 text-white border-indigo-400" 
                    : "bg-background/50 text-muted-foreground border-border"
                )}
              >
                <Store size={20} strokeWidth={2} />
              </button>
              <button 
                onClick={() => onNavigate('notifications')}
                className="p-2.5 rounded-2xl bg-background/50 border border-border text-muted-foreground relative"
              >
                <Bell size={20} strokeWidth={2} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
              </button>
            </div>
          </div>
          
          <p className="text-muted-foreground text-[14px] font-medium leading-relaxed max-w-[85%]">
            {isMerchantMode ? "Manage your business dashboard" : "Your finances at a glance."}
          </p>
        </div>

        {/* Wallet Card Content */}
        <div className="relative z-10 px-5 pt-6 flex flex-col items-center">
          {/* Currency Selector */}
          <div className="w-full flex justify-between items-center mb-4">
             <button 
               onClick={togglePrivacy}
               className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95 duration-150"
             >
               {privacy.hideBalance ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
               <span className="text-[13px] font-semibold uppercase tracking-[0.06em]">
                 {privacy.hideBalance ? "Hidden" : "Visible"}
               </span>
             </button>

            <button 
              onClick={nextCurrency}
              className="bg-black/5 dark:bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-foreground text-[13px] font-semibold active:scale-95 transition-all"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden">
                <img 
                  src={currency === 'NGN' ? "https://flagcdn.com/w40/ng.png" : currency === 'USD' ? "https://flagcdn.com/w40/us.png" : "https://flagcdn.com/w40/gb.png"} 
                  alt={currency} 
                  className="w-full h-full object-cover" 
                />
              </div>
              {currency}
              <ChevronDown size={14} className="text-muted-foreground" strokeWidth={1.5}/>
            </button>
          </div>

          {/* Balance Display */}
          <div className="flex flex-col items-start w-full relative mb-10 overflow-hidden">
            <motion.div 
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (Math.abs(info.offset.x) > 40) {
                  updatePrivacy('hideBalance', !privacy.hideBalance);
                  hapticFeedback('medium');
                }
              }}
              className="h-16 flex items-center justify-start cursor-grab active:cursor-grabbing w-full select-none z-10"
            >
              <motion.div
                animate={{ 
                  filter: privacy.hideBalance ? 'blur(12px)' : 'blur(0px)', 
                  opacity: privacy.hideBalance ? 0.6 : 1,
                  scale: privacy.hideBalance ? 0.95 : 1
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="flex items-center h-full">
                   <AnimatedBalance 
                     value={currency === 'USD' ? usdBalance : currency === 'GBP' ? gbpBalance : balance}
                     currency={currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₦'}
                     fontSize="text-[40px]"
                   />
                </div>
              </motion.div>
            </motion.div>

            {/* Premium trust regulatory indicators */}
            <div className="flex flex-col gap-1.5 mt-3 select-none">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 self-start">
                <ShieldCheck size={11} strokeWidth={2.5} />
                <span className="text-[10px] uppercase font-bold tracking-widest leading-none">CBN Licensed • NDIC Insured</span>
              </div>
              
              {currency !== 'NGN' && (
                <p className="text-[10px] text-muted-foreground leading-normal font-semibold tracking-wide bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg mt-1 max-w-[90%]">
                  * Convert rates represent dynamic index estimations subject to international currency fluctuations.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-4 gap-3">
            <CardAction icon={<Plus />} label="Add" onClick={() => onNavigate('topup')} />
            <CardAction icon={<Send />} label="Transfer" onClick={() => onNavigate('bank-transfer')} />
            <CardAction icon={<QrCode />} label="Scan" onClick={() => onNavigate('qr-code')} />
            <CardAction icon={<MoreHorizontal />} label="More" onClick={() => onNavigate('payments')} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-5 space-y-9 pb-32 relative z-20 bg-background pt-6 no-scrollbar">
        
        {/* Search Bar - Global Search Readiness */}
        {!isMerchantMode && (
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input 
              type="text" 
              placeholder="Search transactions, bills, or help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-muted/20 dark:bg-white/5 rounded-2xl pl-12 pr-4 text-[15px] outline-none focus:ring-2 ring-indigo-500/20 transition-all font-medium"
            />
          </div>
        )}

        {/* 1. Core Utilities Grid - High Priority Shortcuts */}
        {!isMerchantMode && (
          <div className="grid grid-cols-4 gap-3">
             <ShortcutItem 
                label="Airtime" 
                icon={<Phone className="text-foreground" />} 
                onClick={() => onNavigate('airtime')} 
                animateType="bounce"
                badge="HOT"
             />
             <ShortcutItem 
                label="Data" 
                icon={<Rss className="text-foreground" />} 
                onClick={() => onNavigate('airtime')} 
                animateType="pulse"
                badge="HOT"
             />
             <ShortcutItem 
                label="Electricity" 
                icon={<Zap className="text-foreground" />} 
                onClick={() => onNavigate('electricity')} 
                animateType="bounce"
             />
             <ShortcutItem 
                label="Gaming" 
                icon={<Target className="text-foreground" />} 
                onClick={() => onNavigate('betting')} 
                animateType="roll"
                badge="HOT"
             />
             <ShortcutItem 
                label="Electric" 
                icon={<Zap className="text-foreground" />} 
                onClick={() => onNavigate('electricity')} 
                animateType="bounce"
             />
          </div>
        )}

        {/* Insights & Growth Bento Hub */}
        {!isMerchantMode && (
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.06em] px-3">Wealth Discovery</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Wealth Card - Spans 2 cols */}
              <motion.div 
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('savings')}
                className="col-span-2 bg-[#1C1C1E] dark:bg-[#1A1A1C] p-5 rounded-[14px] shadow-sm relative overflow-hidden group ios-ease transition-transform duration-200"
              >
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-white/60 text-[13px] font-medium">Private Reserves</p>
                      <h3 className="title-2 text-white tabular-nums">₦{totalVaultBalance.toLocaleString()}</h3>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
                       <PiggyBank size={20} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-400 font-medium text-[13px]">
                    <TrendingUp size={14} strokeWidth={2} /> Wealth Growth: +₦{dailyYield.toLocaleString()}
                  </div>
                </div>
              </motion.div>

              {/* Success Score widget */}
              <motion.div 
                 whileTap={{ scale: 0.97 }}
                 onClick={() => onNavigate('kyc')}
                 className="ios-list-group p-4 flex flex-col gap-2 ios-ease transition-transform duration-200"
              >
                 <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <ShieldCheck size={16} strokeWidth={2} />
                    </div>
                    <span className="text-[17px] font-semibold text-foreground">{financialScore}</span>
                 </div>
                 <div>
                    <p className="text-[12px] font-medium text-muted-foreground">Financial Standing</p>
                    <p className="text-[13px] text-foreground font-semibold mt-0.5">{profile?.kyc_level === 3 ? 'Elite' : profile?.kyc_level === 2 ? 'Premier' : 'Standard'}</p>
                 </div>
              </motion.div>

              {/* Rewards / Daily Earn */}
              <motion.div 
                whileTap={{ scale: 0.97 }}
                className="ios-list-group p-4 flex flex-col gap-2 ios-ease transition-transform duration-200"
              >
                 <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Gift size={16} strokeWidth={2} />
                    </div>
                    <span className="text-[17px] font-semibold text-foreground">₦{dailyYield}</span>
                 </div>
                 <div>
                    <p className="text-[12px] font-medium text-muted-foreground">Daily Yield</p>
                    <p className="text-[13px] text-foreground font-semibold mt-0.5">{dailyYield > 0 ? 'Accumulating' : 'Start Saving'}</p>
                 </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Dynamic Updates Feed */}
        {!isMerchantMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Ledger Activity</h3>
              <button 
                onClick={() => onNavigate('history')}
                className="text-[15px] font-semibold text-indigo-500"
              >
                Review all
              </button>
            </div>
            
            <div className="ios-list-group p-0">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(0, 4).map((tx, idx) => (
                    <button key={tx.id} onClick={() => onNavigate(`tx-${tx.id}`)} className={cn("flex w-full items-center justify-between p-3 active:bg-black/5 dark:active:bg-white/5 transition-colors", (idx !== filteredTransactions.slice(0, 4).length - 1) && "ios-hairline-bottom")}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground">
                              {tx.type === 'in' ? <ArrowDownToLine size={20} strokeWidth={1.5} /> : <Send size={20} strokeWidth={1.5} />}
                          </div>
                          <div className="text-left">
                              <p className="subheadline font-medium text-foreground">{tx.title}</p>
                              <p className="footnote text-muted-foreground capitalize">{tx.category} • {(tx as any).dateLabel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={cn("callout font-semibold", tx.type === 'in' ? "text-green-500" : "text-foreground")}>
                              {tx.type === 'in' ? '+' : ''}₦{tx.amount.toLocaleString()}
                          </p>
                          <ChevronRight size={16} className="text-muted-foreground/50" />
                        </div>
                    </button>
                  ))
                ) : searchQuery ? (
                  <EmptyState 
                    icon={SearchX}
                    title="No Results"
                    description={`We couldn't find any transaction matching "${searchQuery}"`}
                  />
                ) : (
                  <EmptyState 
                    icon={Clock}
                    title="Immutable Ledger"
                    description="Your financial journey starts now. Fund your wallet to begin architecting wealth."
                    actionLabel="Fund Wallet"
                    onAction={() => onNavigate('topup')}
                  />
                )}
            </div>
          </div>
        )}

        <div className="ios-list-group bg-blue-50 dark:bg-blue-900/20 p-5 flex items-center gap-4">
          <ShieldCheck className="text-blue-500" size={24} strokeWidth={1.5} />
          <p className="footnote text-blue-800 dark:text-blue-300">
            Protected by TitanShield™ bank-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
}

const HeaderIcon = ({ icon, onClick, badge }: { icon: React.ReactNode, onClick: () => void, badge?: boolean }) => (
  <button 
    onClick={() => { hapticFeedback('light'); onClick(); }}
    className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground active:scale-90 transition-transform relative duration-200 ios-spring"
  >
    {React.cloneElement(icon as React.ReactElement<{ strokeWidth?: number }>, { strokeWidth: 1.5 })}
    {badge && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-background rounded-full" />}
  </button>
);

const CardAction = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={() => { hapticFeedback('medium'); onClick(); }}
    className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-200 ios-spring w-full group"
  >
    <div className="w-[60px] h-[60px] rounded-[18px] bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground transition-colors group-active:bg-black/10 dark:group-active:bg-white/20">
      {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 26, strokeWidth: 1.5 })}
    </div>
    <span className="caption-1 font-medium text-foreground">{label}</span>
  </button>
);

const ShortcutItem = ({ 
  label, 
  icon, 
  onClick, 
  badge, 
  subLabel, 
  animateType = 'none' 
}: { 
  label: string, 
  icon: React.ReactNode, 
  onClick: () => void, 
  badge?: string, 
  subLabel?: string,
  animateType?: 'bounce' | 'roll' | 'pulse' | 'none'
}) => {
  let motionProps = {};
  if (animateType === 'bounce') {
    motionProps = {
      animate: { y: [0, -6, 0] },
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
    };
  } else if (animateType === 'roll') {
    motionProps = {
      animate: { rotate: [0, 8, -8, 0] },
      transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
    };
  } else if (animateType === 'pulse') {
    motionProps = {
      animate: { scale: [1, 1.05, 1] },
      transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
    };
  }

  return (
    <button 
      onClick={() => { hapticFeedback('light'); onClick(); }}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-200 ios-spring relative group w-full"
    >
      {badge && (
        <motion.div 
          animate={badge === 'HOT' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className={cn(
            "absolute -top-1.5 -right-1 z-10 text-white font-extrabold px-1.5 py-0.5 rounded-full shadow-sm text-[8px] uppercase tracking-widest",
            badge === 'HOT' ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-indigo-500"
          )}
        >
          {badge}
        </motion.div>
      )}
      <motion.div 
        {...motionProps}
        className={cn(
          "w-[60px] h-[60px] rounded-[18px] bg-card border flex items-center justify-center shadow-sm relative overflow-hidden transition-all duration-300",
          badge === 'HOT' ? "border-red-500/20" : "border-border group-hover:border-indigo-500"
        )}
      >
        {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 24, strokeWidth: 1.5 })}
      </motion.div>
      <div className="flex flex-col items-center">
        <span className="caption-1 font-semibold text-foreground group-hover:text-indigo-500 transition-colors">{label}</span>
        {subLabel && <span className="caption-2 text-muted-foreground">{subLabel}</span>}
      </div>
    </button>
  );
};