"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan } from '../../../context/PayTitanContext';

const JoinCircleScreen = ({ onBack }: { onBack: () => void }) => {
  const { joinCircle } = usePayTitan();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (code.length === 6) {
      setIsLoading(true);
      const success = await joinCircle(code);
      setIsLoading(false);
      if (success) onBack();
    } else {
      toast.error("Please enter a valid 6-digit code.");
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Join Circle</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold text-[#1A2130] dark:text-white">Enter Code.</h2>
          <p className="text-sm text-[#1A2130]/60">Join your friends' social wallet instantly.</p>
        </div>

        <div className="bg-white dark:bg-[#1A2130] p-8 rounded-[40px] shadow-sm border border-gray-50 dark:border-white/5 space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#E9EDF7] dark:bg-white/5 rounded-[32px] flex items-center justify-center text-[#FF4D1C]">
              <Users size={40} />
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">6-DIGIT INVITE CODE</p>
            <input 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="1 2 3 4 5 6" 
              className="w-full bg-[#F8F9FC] dark:bg-white/5 border-none rounded-[32px] py-6 px-8 text-center text-3xl font-bold text-[#1A2130] dark:text-white tracking-[0.5em] focus:ring-2 focus:ring-[#FF4D1C] placeholder:text-gray-300 dark:placeholder:text-white/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">OR SCAN QR</span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
        </div>

        <button className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 py-5 rounded-[32px] flex items-center justify-center gap-3 text-[#1A2130] dark:text-white font-bold active:scale-95 transition-transform">
          <QrCode size={24} className="text-[#FF4D1C]" /> Scan Invite QR
        </button>

        <div className="bg-[#1A2130] p-6 rounded-[40px] flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Secure Access</p>
            <p className="text-white/40 text-[10px] leading-relaxed">
              Circle invitations are unique and expire after 24 hours for your security.
            </p>
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={isLoading}
          className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D1C]/20 disabled:opacity-50"
        >
          {isLoading ? "Joining..." : "Join Circle"} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default JoinCircleScreen;