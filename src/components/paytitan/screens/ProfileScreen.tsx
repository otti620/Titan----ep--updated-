"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  User, Shield, Bell, CreditCard, HelpCircle, LogOut, 
  ChevronRight, Smartphone, Lock, Users, Star, FileText, 
  CheckCircle2, AlertCircle, Settings2, Globe, ShieldAlert, Sparkles, TrendingUp, PieChart
} from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

export default function ProfileScreen({ 
  onLogout, isAdmin, onAdmin, onEdit, onKYC, onSupport, onReferral, onChangePin, onSecurity, onSubscriptions, onNavigate 
}: any) {
  const { profile, deleteAccount } = usePayTitan();
  const { theme, setTheme } = useTheme();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    hapticFeedback('heavy');
    try {
      await deleteAccount();
      onLogout();
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

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
    <div className="flex flex-col min-h-full bg-background relative">
      {/* iOS Navigation Bar */}
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <div className="w-20" /> {/* Spacer for balance */}
        
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline text-foreground">Profile</span>
        </div>

        <div className="w-20 flex justify-end z-10">
           <button 
             onClick={onEdit}
             className="text-indigo-500 active:opacity-60 transition-opacity subheadline font-semibold pt-[2px]"
           >
             Edit
           </button>
        </div>
      </div>

      <div className="px-5 pb-32 space-y-6 overflow-y-auto no-scrollbar pt-2">
         <div ref={sentinelRef} className="h-1 w-full" />
         <h1 className="large-title text-foreground mb-6">Profile</h1>

        {/* Profile Info - iOS grouped style */}
        <div className="ios-list-group">
           <div className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-border shadow-sm bg-black/5 dark:bg-white/5">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.first_name || 'Titan'}`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </div>
                <div className="space-y-0.5">
                  <h2 className="title-3 text-foreground">{profile?.first_name} {profile?.last_name}</h2>
                  <p className="subheadline text-muted-foreground">@{profile?.username}</p>
                </div>
             </div>
           </div>
        </div>

        {/* Premium Achievement / Account Tier Card */}
        <div className="w-full max-w-sm mx-auto bg-black dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-10 blur-[50px] rounded-full -mr-10 -mt-10" />
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="text-left">
              <p className="text-white/60 caption-1 uppercase tracking-widest mb-1.5">Account Status</p>
              <h3 className="text-white headline tracking-tight">Tier {profile?.kyc_level || 1} Member</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-white">
              <span className="text-[18px] font-bold tracking-tight tabular-nums">L{profile?.kyc_level || 1}</span>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center pointer-events-none">
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              <div className="flex justify-between items-center w-full">
                 <span className="text-white/60 caption-1 font-medium">Benefits Level</span>
                 <Sparkles size={12} className="text-[#FF4D1C]" />
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 transition-all duration-500 ease-out" style={{ width: profile?.kyc_level === 3 ? '100%' : profile?.kyc_level === 2 ? '66%' : '33%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="space-y-1">
            <p className="px-4 footnote text-muted-foreground uppercase tracking-widest">Admin</p>
            <div className="ios-list-group">
              <SettingsRow 
                label="Admin Dashboard" 
                icon={ShieldAlert} 
                color="text-[#FF4D1C]" 
                onClick={onAdmin}
                isLast
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <p className="px-4 footnote text-muted-foreground uppercase tracking-widest">Theme Mode</p>
          <div className="ios-list-group px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <Globe size={18} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5">
                <span className="body text-foreground font-semibold">Appearance</span>
                <p className="caption-2 text-muted-foreground">High-Altitude Swiss Canvas</p>
              </div>
            </div>
            <div className="flex bg-[#F2F2F7] dark:bg-[#1E222A] p-0.5 rounded-full border border-border">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { hapticFeedback('light'); setTheme(t); }}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                    theme === t 
                      ? "bg-white dark:bg-black text-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-4 footnote text-muted-foreground uppercase tracking-widest">Insights</p>
          <div className="ios-list-group">
            <SettingsRow 
              label="Monthly Recap" 
              icon={TrendingUp} 
              color="text-emerald-500" 
              value="New"
              onClick={() => onNavigate('month-recap')} 
            />
            <SettingsRow 
              label="Spending Analytics" 
              icon={PieChart} 
              color="text-indigo-500" 
              onClick={() => onNavigate('year-recap')} 
              isLast
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-4 footnote text-muted-foreground uppercase tracking-widest">Account</p>
          <div className="ios-list-group">
            <SettingsRow label="Personal Information" icon={User} color="text-blue-500" onClick={onEdit} />
            <SettingsRow label="Verification Status" icon={CheckCircle2} color="text-emerald-500" value="Verified" onClick={onKYC} />
            <SettingsRow label="Account Limits" icon={CreditCard} color="text-purple-500" onClick={() => onNavigate('limits')} />
            <SettingsRow label="Subscriptions" icon={Star} color="text-amber-500" onClick={onSubscriptions} isLast />
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-4 footnote text-muted-foreground uppercase tracking-widest">Security</p>
          <div className="ios-list-group">
            <SettingsRow label="PayTitan Protection" icon={Shield} color="text-indigo-500" onClick={onSecurity} />
            <SettingsRow label="Transaction PIN" icon={Lock} color="text-slate-500" onClick={onChangePin} isLast />
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-4 footnote text-muted-foreground uppercase tracking-widest">Support</p>
          <div className="ios-list-group">
            <SettingsRow label="Help Center" icon={HelpCircle} color="text-indigo-500" onClick={onSupport} />
            <SettingsRow label="Refer a Friend" icon={Users} color="text-orange-500" onClick={onReferral} isLast />
          </div>
        </div>

        <div className="pt-2 space-y-3">
           <button 
             onClick={() => { hapticFeedback('heavy'); onLogout(); }}
             className="w-full bg-card border border-border py-3.5 rounded-[14px] flex items-center justify-center gap-2 text-[#E53E3E] dark:text-red-400 font-semibold active:opacity-60 duration-150 ios-spring shadow-xs"
           >
             Log Out
           </button>

           {!isConfirmingDelete ? (
             <button 
               onClick={() => { hapticFeedback('medium'); setIsConfirmingDelete(true); }}
               className="w-full py-2 flex items-center justify-center gap-2 text-red-500/80 hover:text-red-500 footnote font-medium active:opacity-60 transition-colors"
             >
               Delete Account (Guideline 5.1.1(v))
             </button>
           ) : (
             <div className="bg-red-500/15 border border-red-500/25 p-4 rounded-xl space-y-3 mt-2 text-center animate-fade-in">
               <p className="footnote font-semibold text-red-500">Are you absolutely sure you want to delete your PayTitan account?</p>
               <p className="caption-2 text-muted-foreground leading-normal">This will immediately soft-delete your database profile record, revoke authorization tokens, and purge local cache credentials. This action is irreversible.</p>
               <div className="flex gap-2 justify-center pt-1.5">
                 <button 
                   onClick={() => { hapticFeedback('light'); setIsConfirmingDelete(false); }}
                   className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-foreground footnote font-semibold active:scale-95 duration-100"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDeleteAccount}
                   disabled={isDeleting}
                   className="px-4 py-2 bg-red-500 text-white rounded-lg footnote font-semibold active:scale-95 duration-100 disabled:opacity-50"
                 >
                   {isDeleting ? "Deleting..." : "Permanently Delete"}
                 </button>
               </div>
             </div>
           )}
        </div>

        {/* Legal Footer */}
        <div className="pt-4 pb-12 text-center space-y-2">
          <p className="caption-1 text-muted-foreground font-medium">
            PayTitan Secure Systems V4.2.0
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => onNavigate('legal')} className="caption-2 text-muted-foreground underline outline-none active:text-indigo-500 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('legal')} className="caption-2 text-muted-foreground underline outline-none active:text-indigo-500 transition-colors">Terms of Service</button>
          </div>
          <p className="caption-2 text-muted-foreground/50 uppercase tracking-widest pt-2">
            © 2026 PayTitan Technologies
          </p>
        </div>
      </div>
    </div>
  );
}

const SettingsRow = ({ label, icon: Icon, color, value, onClick, isLast }: any) => (
  <button 
    onClick={() => { hapticFeedback('light'); onClick?.(); }}
    className={cn(
      "w-full pl-4 pr-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors relative",
      !isLast && "ios-hairline-bottom"
    )}
  >
    <div className="flex items-center gap-3">
      <div className={cn("w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center", color)}>
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <span className="body text-foreground">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="subheadline text-muted-foreground">{value}</span>}
      <ChevronRight size={18} strokeWidth={1.5} className="text-muted-foreground/40" />
    </div>
  </button>
);