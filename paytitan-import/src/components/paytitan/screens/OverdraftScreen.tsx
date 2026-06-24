"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, ShieldCheck, TrendingUp, Info, ArrowRight, Lock, CheckCircle2, Landmark, Sparkles } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { supabase } from '../../../integrations/supabase/client';

const OverdraftScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, transactions, activateOverdraft, updateOverdraftLimit, fundUserWallet } = usePayTitan();
  const [isActivating, setIsActivating] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState(50000);
  const [isRepaying, setIsRepaying] = useState(false);

  // Calculate real spending progress
  const totalSpent = transactions
    .filter(t => t.type === 'out')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const targetSpending = 50000;
  const spendingProgress = Math.min(100, Math.round((totalSpent / targetSpending) * 100));
  
  const isEnabled = profile?.overdraft_enabled;
  const currentLimit = profile?.overdraft_limit || 0;
  const overdraftUsed = profile?.overdraft_balance || 0;

  const handleActivate = async () => {
    setIsActivating(true);
    hapticFeedback('heavy');
    await activateOverdraft(selectedLimit);
    setIsActivating(false);
    hapticFeedback('success');
  };

  const handleUpdateLimit = async (limit: number) => {
    hapticFeedback('medium');
    await updateOverdraftLimit(limit);
  };

  const handleRepay = async () => {
    if (overdraftUsed >= 0) return;
    setIsRepaying(true);
    hapticFeedback('medium');
    
    // In a real app, this would deduct from balance and add to overdraft_balance
    // For this demo/trigger-usage app, we'll just simulate it
    const repayAmount = Math.abs(overdraftUsed);
    await fundUserWallet(profile?.id || '', -repayAmount); // Deduct from wallet
    
    // Update overdraft balance (simulated update)
    const { error } = await supabase.from('profiles').update({ overdraft_balance: 0 } as any).eq('id', profile?.id);
    
    setIsRepaying(false);
    hapticFeedback('success');
  };

  const limits = [10000, 50000, 100000, 250000, 500000];

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Overdraft</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-8 no-scrollbar">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold text-[#1A2130] dark:text-white tracking-tight">Liquidity.</h2>
          <p className="text-sm text-gray-400">Spend beyond zero. Repay on deposit.</p>
        </div>

        {isEnabled ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#1A2130] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-10 blur-[60px] rounded-full -mr-10 -mt-10" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">CURRENT FACILITY</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Active</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-3xl">
                    <p className="text-white/40 text-[9px] font-bold uppercase mb-1">Limit</p>
                    <p className="text-lg font-bold text-white">₦{currentLimit.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl">
                    <p className="text-white/40 text-[9px] font-bold uppercase mb-1">Used</p>
                    <p className={cn("text-lg font-bold", overdraftUsed < 0 ? "text-red-400" : "text-white")}>
                      ₦{Math.abs(overdraftUsed).toLocaleString()}
                    </p>
                  </div>
                </div>

                {overdraftUsed < 0 && (
                  <button 
                    onClick={handleRepay}
                    disabled={isRepaying}
                    className="w-full bg-white text-[#1A2130] py-4 rounded-3xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {isRepaying ? "Processing..." : "Repay Overdraft"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">Adjust Limit</h3>
              <div className="flex flex-wrap gap-2">
                {limits.map((l) => (
                  <button
                    key={l}
                    onClick={() => handleUpdateLimit(l)}
                    className={cn(
                      "px-5 py-3 rounded-2xl text-xs font-bold transition-all",
                      currentLimit === l 
                        ? "bg-[#FF4D1C] text-white" 
                        : "bg-white dark:bg-[#1A2130] text-gray-400 border border-gray-100 dark:border-white/5"
                    )}
                  >
                    ₦{(l/1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="bg-[#1A2130] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-10 blur-[60px] rounded-full -mr-10 -mt-10" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">QUALIFICATION STATUS</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {spendingProgress >= 100 ? 'Qualified' : 'Building Trust'}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-[#FF4D1C]" size={24} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
                    <span>Spending Loop</span>
                    <span>{spendingProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${spendingProgress}%` }}
                      className="h-full bg-[#FF4D1C]"
                    />
                  </div>
                  {spendingProgress < 100 && (
                    <p className="text-[10px] text-white/40">Spend ₦{(targetSpending - totalSpent).toLocaleString()} more to unlock your first ₦10,000 limit.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">Select Initial Limit</h3>
              <div className="flex flex-wrap gap-2">
                {limits.slice(0, 3).map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLimit(l)}
                    className={cn(
                      "px-5 py-3 rounded-2xl text-xs font-bold transition-all",
                      selectedLimit === l 
                        ? "bg-[#FF4D1C] text-white" 
                        : "bg-white dark:bg-[#1A2130] text-gray-400 border border-gray-100 dark:border-white/5"
                    )}
                  >
                    ₦{(l/1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">The Spending Loop</h3>
          <div className="space-y-3">
            <LoopStep 
              icon={<Sparkles className="text-[#FF4D1C]" />} 
              title="Use PayTitan Daily" 
              desc="Pay for airtime, data, and bills. Every transaction builds your Titan Score." 
            />
            <LoopStep 
              icon={<Landmark className="text-blue-500" />} 
              title="Unlock Overdraft" 
              desc="Once qualified, access up to ₦500,000 in instant liquidity." 
            />
            <LoopStep 
              icon={<ShieldCheck className="text-green-500" />} 
              title="Automatic Repayment" 
              desc="Used overdraft is settled automatically from your next wallet top-up." 
            />
          </div>
        </div>

        {!isEnabled && (
          <button
            onClick={handleActivate}
            disabled={isActivating || (spendingProgress < 100)}
            className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
          >
            {isActivating ? "Activating..." : spendingProgress < 100 ? <><Lock size={20} /> Not Yet Qualified</> : <>Activate Overdraft <ArrowRight size={20} /></>}
          </button>
        )}

        <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-[40px] flex items-center gap-4 border border-blue-100 dark:border-blue-500/20">
          <Info className="text-blue-600" size={24} />
          <p className="text-[10px] text-blue-800 dark:text-blue-400 leading-relaxed">
            Overdraft limits are architected based on your monthly transaction volume and KYC level. Keep the loop active to grow.
          </p>
        </div>
      </div>
    </div>
  );
};

const LoopStep = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white dark:bg-[#1A2130] p-5 rounded-[32px] flex items-start gap-4 shadow-sm border border-gray-50 dark:border-white/5">
    <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">{icon}</div>
    <div>
      <h4 className="text-sm font-bold text-[#1A2130] dark:text-white">{title}</h4>
      <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{desc}</p>
    </div>
  </div>
);

export default OverdraftScreen;