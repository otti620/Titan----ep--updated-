"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback, cn } from '../../../lib/utils';
import AdminHome from './screens/AdminHome';
import AdminPL from './screens/AdminPL';
import AdminUsers from './screens/AdminUsers';
import AdminTransactions from './screens/AdminTransactions';
import AdminControls from './screens/AdminControls';
import AdminSettings from './screens/AdminSettings';
import HelpDesk from './screens/HelpDesk';
import EmergencyCenter from './screens/EmergencyCenter';
import FintechPartnersHub from './screens/FintechPartnersHub';
import { LayoutDashboard, Users, Activity, Settings2, ShieldCheck, ChevronLeft, AlertOctagon, TrendingUp, LifeBuoy, Network } from 'lucide-react';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('home');
  const [emergencyMode, setEmergencyMode] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'pl', label: 'P&L', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Ledger', icon: Activity },
    { id: 'integrations', label: 'Partners', icon: Network },
    { id: 'tickets', label: 'Help Desk', icon: LifeBuoy },
    { id: 'controls', label: 'Controls', icon: Settings2 },
    { id: 'settings', label: 'System', icon: ShieldCheck },
  ];

  if (emergencyMode) {
    return <EmergencyCenter onBack={() => setEmergencyMode(false)} />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative">
      {/* iOS Navigation Bar */}
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        "ios-glass ios-hairline-bottom"
      )}>
        <div className="w-20 text-left">
          <button
            onClick={onBack}
            className="text-indigo-500 active:opacity-60 transition-opacity subheadline font-semibold pt-[2px] flex items-center"
          >
            <ChevronLeft size={20} className="-ml-1" /> Back
          </button>
        </div>
        
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none opacity-100"
        )}>
           <span className="headline text-foreground">Mission Control</span>
        </div>

        <div className="w-20 flex justify-end z-10">
          <button
            onClick={() => { hapticFeedback('heavy'); setEmergencyMode(true); }}
            className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:scale-95 transition-transform"
          >
            <AlertOctagon size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
           <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full overflow-y-auto no-scrollbar pb-32"
          >
             {activeTab === 'home' && <AdminHome />}
             {activeTab === 'pl' && <AdminPL />}
             {activeTab === 'users' && <AdminUsers />}
             {activeTab === 'transactions' && <AdminTransactions />}
             {activeTab === 'integrations' && <FintechPartnersHub />}
             {activeTab === 'tickets' && <HelpDesk />}
             {activeTab === 'controls' && <AdminControls />}
             {activeTab === 'settings' && <AdminSettings />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Admin Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-xl border-t border-border pt-2"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="w-full max-w-md flex justify-around items-center px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button 
                key={tab.id} 
                onClick={() => { hapticFeedback('light'); setActiveTab(tab.id); }} 
                className={cn(
                  "flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200",
                  isActive ? "text-indigo-500" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                <div className={cn("transition-transform duration-200", isActive ? "scale-110" : "scale-100")}>
                  <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className={cn("text-[10px] font-medium tracking-wide mt-0.5", isActive && "font-bold")}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
