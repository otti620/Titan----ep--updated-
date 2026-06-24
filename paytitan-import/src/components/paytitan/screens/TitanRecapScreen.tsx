"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Sparkles, TrendingUp, TrendingDown, Wallet, Zap, Award, Star, Download, ChevronRight } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { toast } from 'sonner';

interface TitanRecapScreenProps {
  onBack: () => void;
  type: 'month' | 'year';
}

const TitanRecapScreen = ({ onBack, type }: TitanRecapScreenProps) => {
  const { profile, transactions } = usePayTitan();
  const [step, setStep] = useState(0);

  const stats = useMemo(() => {
    const now = new Date();
    const filteredTxs = transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      if (type === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return txDate.getFullYear() === now.getFullYear();
    });

    const totalIn = filteredTxs.filter(tx => tx.type === 'in').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    const totalOut = filteredTxs.filter(tx => tx.type === 'out').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    const volume = totalIn + totalOut;
    const txCount = filteredTxs.length;

    // WAEC Grading logic
    let grade = 'F9';
    let label = 'Beginner';
    let color = 'from-gray-500 to-slate-700';

    if (volume > 1000000) {
      grade = 'A1';
      label = 'Titan Legend';
      color = 'from-amber-400 via-orange-500 to-red-600';
    } else if (volume > 500000) {
      grade = 'B2';
      label = 'Elite Architect';
      color = 'from-blue-400 via-indigo-500 to-purple-600';
    } else if (volume > 100000) {
      grade = 'C4';
      label = 'Rising Star';
      color = 'from-emerald-400 to-teal-600';
    } else if (volume > 10000) {
      grade = 'D7';
      label = 'Active Titan';
      color = 'from-sky-400 to-blue-600';
    }

    const monthName = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    return { totalIn, totalOut, volume, txCount, grade, label, color, period: type === 'month' ? `${monthName} ${year}` : `${year}` };
  }, [transactions, type]);

  const handleNext = () => {
    if (step < 3) {
      hapticFeedback('light');
      setStep(step + 1);
    }
  };

  const shareCard = () => {
    hapticFeedback('medium');
    // In a real app, this would use the Web Share API or generate an image
    if (navigator.share) {
      navigator.share({
        title: `My ${type === 'month' ? 'Month' : 'Year'} on PayTitan`,
        text: `I scored a ${stats.grade} (${stats.label}) on @PayTitan! Total volume: ₦${stats.volume.toLocaleString()}.`,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  return (
    <div className={cn("h-full w-full flex flex-col overflow-hidden text-white", stats.color, "bg-gradient-to-br")}>
      <div className="px-8 pt-8 pb-4 flex justify-between items-center relative z-20">
        <button onClick={onBack} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-sm font-black uppercase tracking-widest">{type === 'month' ? 'My Month' : 'My Year'} on Titan</span>
        <button onClick={shareCard} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex h-20 w-20 items-center justify-center bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 mb-4">
                <Sparkles size={40} className="text-amber-300 fill-amber-300/20" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none italic">THE RECAP.</h1>
              <p className="text-white/70 text-lg font-medium">Ready to see your performance for {stats.period}?</p>
              <button 
                onClick={handleNext}
                className="mt-8 px-12 py-5 bg-white text-black font-black rounded-full flex items-center gap-2 mx-auto active:scale-95 transition-transform"
              >
                Let's Go <ChevronRight size={24} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="volume"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-12"
            >
              <div className="space-y-2">
                <p className="text-white/60 font-black uppercase tracking-widest text-xs">Total Cashflow</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold opacity-50">₦</span>
                  <h2 className="text-6xl font-black tracking-tighter">
                    {stats.volume.toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={20} className="text-green-400" />
                    </div>
                    <span className="font-bold">Titan Inflow</span>
                  </div>
                  <p className="text-3xl font-black">₦{stats.totalIn.toLocaleString()}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center">
                      <TrendingDown size={20} className="text-red-400" />
                    </div>
                    <span className="font-bold">Titan Outflow</span>
                  </div>
                  <p className="text-3xl font-black">₦{stats.totalOut.toLocaleString()}</p>
                </div>
              </div>
              
              <button onClick={handleNext} className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} onAnimationComplete={handleNext} className="h-full bg-white" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="grade"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-8">Your Titan Score</p>
              <div className="relative inline-block">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    repeatType: 'reverse',
                    type: 'tween',
                    ease: 'easeInOut'
                  }}
                  className="text-[12rem] font-black tracking-tighter leading-none italic drop-shadow-2xl"
                >
                  {stats.grade}
                </motion.div>
                <div className="absolute -top-4 -right-10 px-6 py-2 bg-white text-black font-black rounded-full rotate-12 shadow-xl">
                  {stats.label}
                </div>
              </div>
              <p className="mt-12 text-xl font-medium max-w-xs mx-auto opacity-80 italic">
                "{stats.volume > 100000 ? "You're not just using Titan, you're architecting it." : "Building the foundation of a Titan legend."}"
              </p>
              <button onClick={handleNext} className="mt-12 px-12 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black rounded-full active:scale-95 transition-transform">
                Generate Card
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="share"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* THE FLYER */}
              <div id="titan-flyer" className={cn("w-full aspect-[4/5] bg-gradient-to-br p-8 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between border-4 border-white/20", stats.color)}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 blur-[80px] rounded-full -ml-10 -mb-10" />
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-widest uppercase opacity-60">Titan ID</p>
                    <p className="text-xl font-black italic">@{profile?.username}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black tracking-widest uppercase opacity-60">Period</p>
                    <p className="text-xl font-black">{stats.period}</p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-[10rem] font-black tracking-tighter leading-none italic italic-strong drop-shadow-2xl mb-2">
                    {stats.grade}
                  </div>
                  <p className="text-2xl font-black uppercase tracking-widest tracking-tighter italic scale-125 mb-4">{stats.label}</p>
                  <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-sm font-bold">
                    VOL: ₦{stats.volume.toLocaleString()}
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span className="text-[10px] font-bold opacity-60 uppercase">{stats.txCount} TXS IN THE LOOP</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-8 w-24 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center p-2 border border-white/10">
                      <span className="text-[10px] font-black">PAYTITAN</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4 w-full">
                <button onClick={shareCard} className="flex-1 py-5 bg-white text-black font-black rounded-[32px] flex items-center justify-center gap-3 active:scale-95 transition-transform">
                  <Share2 size={24} /> Share Story
                </button>
                <button onClick={() => { hapticFeedback('success'); toast.success('Flyer saved to gallery!'); }} className="w-20 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center rounded-[32px] active:scale-95 transition-transform">
                  <Download size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Step Indicators */}
      <div className="px-8 pb-12 flex gap-2 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === step ? "w-8 bg-white" : "w-2 bg-white/30")} />
        ))}
      </div>
    </div>
  );
};

export default TitanRecapScreen;
