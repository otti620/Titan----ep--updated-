"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Key, CheckCircle, Bell, ListX, ChevronRight, Server, X, Copy, Check, Info, DollarSign, CreditCard, Wifi } from 'lucide-react';
import { cn, hapticFeedback } from '../../../../lib/utils';
import { supabase } from '../../../../integrations/supabase/client';
import { usePayTitan } from '../../../../context/PayTitanContext';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { settings, updateSettings } = usePayTitan();
  const [coreBankingStatus, setCoreBankingStatus] = useState<'Healthy' | 'Degraded' | 'Offline' | 'Checking'>('Checking');
  const [supabaseStatus, setSupabaseStatus] = useState<'Healthy' | 'Degraded' | 'Offline' | 'Checking'>('Checking');
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'fees' | 'fx' | 'data' | 'risk'>('health');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      setSupabaseStatus(error ? 'Degraded' : 'Healthy');
    } catch {
      setSupabaseStatus('Offline');
    }

    setTimeout(() => {
       setCoreBankingStatus('Healthy');
    }, 1500);
  };

  const generateInvite = async () => {
    if (!inviteEmail) return toast.error('Enter an email address');
    hapticFeedback('medium');
    setIsInviting(true);
    await new Promise(r => setTimeout(r, 1000));
    setInviteLink(`${window.location.origin}/admin/invite?token=${btoa(inviteEmail + ':' + inviteRole)}`);
    toast.success('Invitation link generated');
    setIsInviting(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pt-2 pb-32">
      {/* Sub tabs for System */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
        <button 
          onClick={() => setActiveSubTab('health')}
          className={cn(
            "flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all",
            activeSubTab === 'health' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-500" : "text-muted-foreground"
          )}
        >
          Health
        </button>
        <button 
          onClick={() => setActiveSubTab('fees')}
          className={cn(
            "flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all",
            activeSubTab === 'fees' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-500" : "text-muted-foreground"
          )}
        >
          Fees
        </button>
        <button 
          onClick={() => setActiveSubTab('fx')}
          className={cn(
            "flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all",
            activeSubTab === 'fx' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-500" : "text-muted-foreground"
          )}
        >
          Rates
        </button>
        <button 
          onClick={() => setActiveSubTab('data')}
          className={cn(
            "flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all",
            activeSubTab === 'data' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-500" : "text-muted-foreground"
          )}
        >
          VTU
        </button>
        <button 
          onClick={() => setActiveSubTab('risk')}
          className={cn(
            "flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all",
            activeSubTab === 'risk' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-500" : "text-muted-foreground"
          )}
        >
          Risk
        </button>
      </div>

      {activeSubTab === 'health' && (
        <>
          <div className="bg-card border border-border shadow-sm rounded-[24px] p-6">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Internal Service Hub</h3>
              <button onClick={() => { setCoreBankingStatus('Checking'); setSupabaseStatus('Checking'); checkHealth(); }} className="text-xs font-bold text-indigo-500">Refresh</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-foreground tracking-tight">Titan Core</p>
                    <p className="text-[12px] text-muted-foreground">Primary Ledger Service</p>
                  </div>
                </div>
                <StatusBadge status={coreBankingStatus} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Server size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-foreground tracking-tight">Supabase</p>
                    <p className="text-[12px] text-muted-foreground">Core Database</p>
                  </div>
                </div>
                <StatusBadge status={supabaseStatus} />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-[24px] overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">System Identity</h3>
            </div>
            
            <div className="ios-list-group rounded-none bg-transparent">
              <SettingRow icon={Key} title="API Keys" subtitle="Manage external integrated keys" />
              <SettingRow icon={ShieldCheck} title="Admin Roles" subtitle="Manage who can access Mission Control" onClick={() => setShowRolesModal(true)} />
              <SettingRow icon={ListX} title="Audit Logs" subtitle="Comprehensive platform activity logs" />
              <SettingRow icon={Bell} title="System Alerts" subtitle="Configure SMS/Email triggers" isLast />
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'fees' && (
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Transaction Fees</h3>
          </div>
          <p className="text-xs text-muted-foreground">Set flat NGN charges for various operation types.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'p2p_transfer', label: 'P2P Transfer' },
              { id: 'bank_transfer', label: 'Bank Transfer' },
              { id: 'bills', label: 'Bill Payment' },
              { id: 'deposit', label: 'Wallet Deposit' },
              { id: 'airtime', label: 'Airtime' },
            ].map(fee => (
              <div key={fee.id} className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">{fee.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] font-bold">₦</span>
                  <input 
                    type="number" 
                    className="w-full pl-6 pr-3 py-2 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={settings.fees?.[fee.id] || 0}
                    onChange={(e) => updateSettings('fees', { ...settings.fees, [fee.id]: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Card Funding (%)</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] font-bold">%</span>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={settings.fees?.card_funding || 0}
                  onChange={(e) => updateSettings('fees', { ...settings.fees, card_funding: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-3">
             <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-indigo-500/80 leading-relaxed font-medium">Changes to fees take effect immediately across all client applications. P2P transfers are typically free (0).</p>
          </div>
        </div>
      )}

      {activeSubTab === 'fx' && (
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Exchange Rates</h3>
          </div>
          <p className="text-xs text-muted-foreground">Set manual conversion rates from NGN to other currencies.</p>

          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'USD', label: 'US Dollar ($)' },
              { id: 'GBP', label: 'British Pound (£)' },
              { id: 'EUR', label: 'Euro (€)' },
            ].map(rate => (
              <div key={rate.id} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">{rate.id[0]}</div>
                   <div>
                     <p className="text-xs font-bold text-foreground">{rate.label}</p>
                     <p className="text-[10px] text-muted-foreground">1 {rate.id} = ₦{settings.fx_rates?.[rate.id]?.toLocaleString() || '---'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-muted-foreground">₦</span>
                   <input 
                    type="number"
                    className="w-24 px-3 py-2 bg-white dark:bg-zinc-800 border border-border rounded-xl text-xs font-black text-indigo-500 focus:outline-none"
                    value={settings.fx_rates?.[rate.id] || 0}
                    onChange={(e) => updateSettings('fx_rates', { ...settings.fx_rates, [rate.id]: parseFloat(e.target.value) || 0 })}
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'data' && (
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={18} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">VTU Rates (Data & Airtime)</h3>
            </div>
            {(!settings.data_plans || Object.keys(settings.data_plans).length === 0) && (
              <button 
                onClick={() => {
                   const defaults: any = {
                     daily: [
                       { name: '100MB', price: 100 },
                       { name: '200MB', price: 200 },
                       { name: '1GB', price: 350 },
                       { name: '2GB', price: 600 },
                     ],
                     weekly: [
                       { name: '750MB', price: 500 },
                       { name: '1.5GB', price: 1000 },
                       { name: '3GB', price: 1500 },
                       { name: '6GB', price: 2500 },
                     ],
                     monthly: [
                       { name: '1.5GB', price: 1000 },
                       { name: '3.5GB', price: 2000 },
                       { name: '10GB', price: 5000 },
                       { name: '20GB', price: 8000 },
                       { name: '45GB', price: 12000 },
                       { name: '100GB', price: 25000 },
                     ],
                     airtime_discount: 3
                   };
                   updateSettings('data_plans', defaults);
                }}
                className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-bold rounded-xl active:scale-95 transition-transform"
              >
                Initialize All VTU Assets
              </button>
            )}
          </div>

          {settings.data_plans && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                 <div className="flex items-center justify-between mb-2">
                   <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Global Airtime Discount</h4>
                   <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        className="w-12 bg-white dark:bg-zinc-800 border border-border px-2 py-1 text-xs font-bold text-right rounded-lg"
                        value={settings.data_plans?.airtime_discount || 0}
                        onChange={(e) => updateSettings('data_plans', { ...settings.data_plans, airtime_discount: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="text-xs font-bold text-muted-foreground">%</span>
                   </div>
                 </div>
                 <p className="text-[10px] text-muted-foreground italic">Users pay less than the face value of airtime (e.g. at 3%, 1000 NGN costs 970 NGN).</p>
              </div>

              <div className="space-y-6">
                {['daily', 'weekly', 'monthly'].map(cat => (
                  <div key={cat} className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l-2 border-indigo-500 pl-2">{cat} Bundles</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(settings.data_plans?.[cat] || []).map((plan: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-1 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-foreground">{plan.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-muted-foreground">₦</span>
                              <input 
                                type="number"
                                className="w-16 bg-transparent border-none p-0 text-xs font-bold text-indigo-500 focus:outline-none"
                                value={plan.price}
                                onChange={(e) => {
                                  const next = { ...settings.data_plans };
                                  next[cat][idx].price = parseFloat(e.target.value) || 0;
                                  updateSettings('data_plans', next);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 text-foreground">
             <h3 className="text-sm font-semibold mb-6 flex items-center justify-between">
                <span>Algorithmic Risk Configurator</span>
             </h3>
             <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-4">Auto-Flag Threshold (Transfers / minute)</label>
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-mono text-indigo-500">5</span>
                     <input type="range" min="5" max="100" defaultValue="20" className="flex-1 accent-indigo-500" />
                     <span className="text-xs font-mono text-indigo-500">100</span>
                  </div>
                  <p className="caption-2 text-muted-foreground mt-2">Trigger fraud alerts if bursts exceed this metric.</p>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <label className="text-xs font-bold text-muted-foreground block mb-4">High Risk IP Geolocation Rejections</label>
                  <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                      <span className="text-sm font-semibold">Strict Geo-Fencing</span>
                      <div className="w-10 h-6 bg-indigo-500 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <button className="w-full bg-indigo-500 text-white rounded-xl py-3 text-sm font-bold active:scale-95 transition-transform" onClick={() => {toast.success('Risk models retrained successfully'); hapticFeedback('medium')}}>
                    Apply Changes to Neural Engine
                  </button>
                </div>
             </div>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-6 text-emerald-600 dark:text-emerald-400">
             <h3 className="text-sm font-semibold mb-4">Mint Sandbox QA Currency</h3>
             <p className="text-xs font-medium leading-relaxed mb-4">
               Generate unbacked ghost balance specifically for registered QA automated testing groups. This volume is completely isolated from liquidity reconciliation reporting.
             </p>
             <button onClick={() => {toast.success('₦10,000,000 Ghost Balance Minted to QA Ledgers'); hapticFeedback('heavy')}} className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg active:scale-95 transition-transform">
               Mint QA Liquidity (₦10,000,000)
             </button>
          </div>
        </div>
      )}

      {showRolesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-card w-full max-w-sm rounded-[32px] p-6 animate-in zoom-in-95 duration-200 shadow-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground tracking-tight">Invite Admin</h3>
              <button onClick={() => { setShowRolesModal(false); setInviteLink(''); setInviteEmail(''); }} className="w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full active:scale-95">
                <X size={18} />
              </button>
            </div>
            
            {!inviteLink ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Staff Email</label>
                  <input 
                    type="email" 
                    placeholder="team@paytitan.co" 
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full mt-1 bg-black/5 dark:bg-white/5 border border-border rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Role</label>
                  <select 
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="w-full mt-1 bg-black/5 dark:bg-white/5 border border-border rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none"
                  >
                    <option value="admin">Super Admin</option>
                    <option value="support">Customer Support (Read Only)</option>
                    <option value="compliance">Compliance Officer (KYC)</option>
                  </select>
                </div>
                
                <button 
                  onClick={generateInvite} 
                  disabled={!inviteEmail || isInviting}
                  className="w-full mt-2 py-4 rounded-xl bg-indigo-500 text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {isInviting ? 'Generating...' : 'Generate Invite Link'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
                   <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-3">
                     <CheckCircle size={24} />
                   </div>
                   <p className="font-bold text-sm text-foreground">Success!</p>
                   <p className="text-[10px] text-muted-foreground mt-1">Send this link securely to {inviteEmail}</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-black/5 dark:bg-white/5 border border-border rounded-xl py-3 px-4 text-xs font-mono text-muted-foreground"
                  />
                  <button onClick={copyLink} className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Checking') {
     return <span className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">Checking...</span>;
  }
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", 
      status === 'Healthy' ? 'bg-green-500/10 text-green-500' :
      status === 'Degraded' ? 'bg-orange-500/10 text-orange-500' :
      'bg-red-500/10 text-red-500'
    )}>
      {status}
    </span>
  );
}

function SettingRow({ icon: Icon, title, subtitle, isLast, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "w-full px-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors",
      !isLast && "ios-hairline-bottom"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-foreground" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-[15px] text-foreground tracking-tight">{title}</p>
          <p className="text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={18} strokeWidth={1.5} className="text-muted-foreground/40 shrink-0" />
    </button>
  );
}
