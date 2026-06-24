"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gift, Copy, Share2, Users, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan } from '../../../context/PayTitanContext';
import { safeShare } from '../../../lib/utils';

const ReferralScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile } = usePayTitan();
  const referralCode = profile?.referral_code || profile?.username?.toUpperCase() || "TITAN-USER";
  const earnings = profile?.referral_earnings || 0;
  const count = profile?.referral_count || 0;

  const handleShare = async () => {
    const text = `Join me on PayTitan! Use my code ${referralCode} to get a ₦500 welcome bonus upon your first transaction. Download here: https://paytitan.com/join`;
    const result = await safeShare({
      title: 'Join PayTitan',
      text,
      url: 'https://paytitan.com/join'
    }, text);
    
    if (result === 'copied') {
      toast.success("Invite link copied!");
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Refer & Earn</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-8 no-scrollbar">
        <div className="relative w-full aspect-square max-w-[280px] mx-auto">
          <div className="absolute inset-0 bg-[#FF4D1C] opacity-10 blur-[60px] rounded-full" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", type: 'tween' }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <div className="w-48 h-48 bg-[#1A2130] rounded-[48px] flex items-center justify-center shadow-2xl border border-white/10">
              <Gift size={80} className="text-[#FF4D1C]" />
            </div>
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Invite a Titan.</h2>
          <p className="text-sm text-[#1A2130]/60 px-8">Earn ₦500 for every friend who joins and completes their first transaction.</p>
        </div>

        <div className="bg-white dark:bg-[#1A2130] p-8 rounded-[40px] shadow-sm border border-gray-50 dark:border-white/5 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">YOUR REFERRAL CODE</p>
            <div className="flex items-center justify-center gap-4 bg-[#F8F9FC] dark:bg-white/5 py-4 px-6 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
              <span className="text-xl font-bold text-[#1A2130] dark:text-white tracking-widest">{referralCode}</span>
              <button onClick={() => { navigator.clipboard.writeText(referralCode); toast.success("Code copied!"); }}>
                <Copy size={20} className="text-[#FF4D1C]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">TOTAL EARNED</p>
              <p className="text-xl font-bold text-[#1A2130] dark:text-white">₦{earnings.toLocaleString()}</p>
            </div>
            <div className="text-center border-l border-gray-100 dark:border-white/5">
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">FRIENDS JOINED</p>
              <p className="text-xl font-bold text-[#1A2130] dark:text-white">{count}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">HOW IT WORKS</h3>
          <div className="space-y-4">
            <StepItem number="1" text="Share your unique referral code with friends." />
            <StepItem number="2" text="They sign up and verify their identity." />
            <StepItem number="3" text="You both get rewarded instantly!" />
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D1C]/20"
        >
          Share Invite Link <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

const StepItem = ({ number, text }: { number: string, text: string }) => (
  <div className="flex items-center gap-4">
    <div className="w-8 h-8 bg-[#FF4D1C] rounded-full flex items-center justify-center text-white font-bold text-xs">
      {number}
    </div>
    <p className="text-sm text-[#1A2130]/60 dark:text-white/60 font-medium">{text}</p>
  </div>
);

export default ReferralScreen;