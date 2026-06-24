"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../integrations/supabase/client';
import { Settings, ShieldOff, Zap, Users, ShieldAlert, CreditCard, X } from 'lucide-react';
import { cn, hapticFeedback } from '../../../../lib/utils';
import { toast } from 'sonner';
import { usePayTitan } from '../../../../context/PayTitanContext';

export default function AdminControls() {
  const { settings, updateSettings, isAdmin } = usePayTitan();
  
  const toggleFeature = (key: string) => {
    hapticFeedback('medium');
    const features = settings.features || {
      p2p: true,
      bank: true,
      vtu: true,
      cards: true,
      vaults: true,
      circles: true
    };
    updateSettings('features', { ...features, [key]: !features[key] });
    toast.success(`${key.toUpperCase()} feature updated.`);
  };

  const toggleMaintenance = () => {
    hapticFeedback('warning');
    updateSettings('maintenance_mode', !settings.maintenance_mode);
    toast.success(settings.maintenance_mode ? "Platform is now LIVE" : "Platform is now in MAINTENANCE");
  };

  return (
    <div className="space-y-6 pt-2 pb-32">
       
       <div className="bg-card border border-border shadow-sm rounded-[24px] p-6">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
             <Zap size={16} /> Platform Status
           </h3>
           <StatusBadge status={settings.maintenance_mode ? 'Maintenance' : 'Live'} />
         </div>

         <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">Maintenance Mode</p>
                <p className="text-[10px] text-muted-foreground">Blocks all non-admin access to the app.</p>
              </div>
              <button 
                onClick={toggleMaintenance}
                className={cn(
                  "w-[42px] h-[24px] rounded-full transition-colors relative shadow-inner",
                  settings.maintenance_mode ? 'bg-orange-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'
                )}
              >
                <div className={cn(
                  "absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out",
                  settings.maintenance_mode ? 'translate-x-[18px]' : 'translate-x-0'
                )} />
              </button>
            </div>
         </div>

         <div className="space-y-1.5 mb-6">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Platform Announcement Message</label>
            <textarea 
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
              placeholder="e.g. Scheduled maintenance tonight at 10 PM CAT..."
              value={settings.announcement || ''}
              onChange={(e) => updateSettings('announcement', e.target.value)}
            />
         </div>
       </div>

       <div className="bg-card border border-border shadow-sm rounded-[24px] p-6">
         <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
           <Settings size={16} /> Module Toggles
         </h3>
         
         <div className="space-y-6">
           <ToggleRow 
             title="P2P Transfers" 
             desc="Internal wallet-to-wallet transactions" 
             active={settings.features?.p2p !== false}
             onToggle={() => toggleFeature('p2p')} 
           />
           <ToggleRow 
             title="Bank Outflows" 
             desc="Withdrawals to NIP external banks" 
             active={settings.features?.bank !== false}
             onToggle={() => toggleFeature('bank')} 
           />
           <ToggleRow 
             title="Bills & VTU" 
             desc="Airtime, Data, and Utility payments" 
             active={settings.features?.vtu !== false}
             onToggle={() => toggleFeature('vtu')} 
           />
           <ToggleRow 
             title="Virtual Cards" 
             desc="Mastercard/Visa issuance for users" 
             active={settings.features?.cards !== false}
             onToggle={() => toggleFeature('cards')} 
           />
           <ToggleRow 
             title="Savings & Circles" 
             desc="Vaults and Ajo Tribes modules" 
             active={settings.features?.vaults !== false}
             onToggle={() => toggleFeature('vaults')} 
           />
         </div>
       </div>

       <div className="bg-card border border-border shadow-sm rounded-[24px] p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
             <ShieldAlert size={16} className="text-orange-500" /> Compliance & Limits
          </h3>
          <div className="space-y-4">
             {[1, 2, 3].map(level => (
               <div key={level} className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">T{level}</div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Tier {level} Daily Limit</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-bold text-foreground">₦</span>
                       <input 
                        type="number"
                        className="bg-transparent border-none p-0 text-sm font-black text-indigo-500 focus:outline-none w-full"
                        value={settings.kyc_limits?.[level] || (level === 1 ? 50000 : level === 2 ? 500000 : 5000000)}
                        onChange={(e) => {
                          const limits = settings.kyc_limits || { 1: 50000, 2: 500000, 3: 5000000 };
                          updateSettings('kyc_limits', { ...limits, [level]: parseFloat(e.target.value) || 0 });
                        }}
                       />
                    </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6">
           <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldOff size={16} className="text-red-500" /> Ajo/Tribe Oversight
           </h3>
           <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                 <ShieldOff className="text-red-500 mt-1 shrink-0" size={20} />
                 <div>
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Emergency Dissolution</h4>
                    <p className="text-[11px] text-red-500/80 leading-relaxed mt-1 mb-3">
                       Forcefully dissolve a stagnant savings circle, expel members, and trigger immediate refunds of locked funds to members.
                    </p>
                    <button onClick={() => { hapticFeedback('heavy'); toast.success('Smart Contract Override Initiated. Funds unlocking.'); }} className="w-full bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform">
                       Trigger Force Refund Array
                    </button>
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
      status === 'Live' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
    )}>
      {status}
    </span>
  );
}

function ToggleRow({ title, desc, active, onToggle }: { title: string, desc: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-sm text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-[42px] h-[24px] rounded-full transition-colors relative shadow-inner",
          active ? 'bg-indigo-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'
        )}
      >
         <div className={cn(
           "absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out",
           active ? 'translate-x-[18px]' : 'translate-x-0'
         )} />
      </button>
    </div>
  );
}
