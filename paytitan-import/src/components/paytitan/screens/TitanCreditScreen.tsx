"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, ShieldCheck, TrendingUp, Info, ArrowRight, Lock, CheckCircle2, CreditCard, Wallet } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback } from '../../../lib/utils';
import { toast } from 'sonner';

const TitanCreditScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, balance, transactions, refreshData } = usePayTitan();
  const [isActivating, setIsActivating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Derive credit metrics from platform activity
  const creditScore = useMemo(() => {
    let score = 350;
    const kyc = profile?.kyc_level || 0;
    if (kyc >= 1) score += 100;
    if (kyc >= 2) score += 200;
    if (kyc >= 3) score += 400;
    score += Math.min(150, Math.floor(balance / 5000));
    score += Math.min(100, transactions.length * 2);
    return Math.min(990, score);
  }, [profile, balance, transactions]);

  const creditLimit = Math.floor((creditScore / 990) * 100000 / 1000) * 1000;
  const creditUsed = 0;

  const handleActivate = () => {
    setIsActivating(true);
    hapticFeedback('heavy');
    
    // Simulate architectural activation
    setTimeout(() => {
      setIsActivating(false);
      setShowSuccess(true);
      hapticFeedback('success');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="h-full w-full bg-[#1A2130] flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center mb-8 shadow-lg shadow-green-500/20"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">Credit Active.</h2>
        <p className="text-white/60 mb-12">Your ₦{creditLimit.toLocaleString()} overdraft facility is now live. Spend with confidence, even at zero balance.</p>
        <button 
          onClick={onBack}
          className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Titan Credit</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold text-[#1A2130] dark:text-white tracking-tight">Liquidity.</h2>
          <p className="text-sm text-gray-400">Instant overdraft for the financial elite.</p>
        </div>

        {/* Credit Score Card */}
        <div className="bg-[#1A2130] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-10 blur-[60px] rounded-full -mr-10 -mt-10" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">TITAN CREDIT SCORE</p>
              <h3 className="text-5xl font-bold text-white tracking-tighter">{creditScore}</h3>
            </div>
            
            <div className="w-full bg-white/5 rounded-2xl p-4 flex justify-between items-center">
              <div className="text-left">
                <p className="text-white/40 text-[8px] font-bold uppercase">AVAILABLE LIMIT</p>
                <p className="text-lg font-bold text-white">₦{creditLimit.toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <p className="text-white/40 text-[8px] font-bold uppercase">INTEREST RATE</p>
                <p className="text-lg font-bold text-green-400">0.1% / Day</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">THE TITAN LOOP</h3>
          <div className="space-y-3">
            <LoopStep 
              icon={<Zap className="text-[#FF4D1C]" />} 
              title="Spend Beyond Zero" 
              desc="Use your credit for bills, airtime, or transfers when your balance is low." 
            />
            <LoopStep 
              icon={<TrendingUp className="text-blue-500" />} 
              title="Build Your Score" 
              desc="Regular usage and timely repayments increase your limit up to ₦500,000." 
            />
            <LoopStep 
              icon={<ShieldCheck className="text-green-500" />} 
              title="Auto-Settlement" 
              desc="Credit is automatically repaid from your next wallet top-up." 
            />
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-[40px] flex items-center gap-4 border border-blue-100 dark:border-blue-500/20">
          <Info className="text-blue-600" size={24} />
          <p className="text-[10px] text-blue-800 dark:text-blue-400 leading-relaxed">
            Titan Credit is an invitation-only facility. Your limit is architected based on your platform activity and KYC level.
          </p>
        </div>

        <button
          onClick={handleActivate}
          disabled={isActivating}
          className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isActivating ? "Architecting..." : "Activate Overdraft"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const LoopStep = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white dark:bg-[#1A2130] p-5 rounded-[32px] flex items-start gap-4 shadow-sm border border-gray-50 dark:border-white/5">
    <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-[#1A2130] dark:text-white">{title}</h4>
      <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{desc}</p>
    </div>
  </div>
);

export default TitanCreditScreen;