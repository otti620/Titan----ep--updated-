"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Globe, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback } from '../../../lib/utils';

export default function CardCreationScreen({ onBack }: { onBack: () => void }) {
  const { createCard, balance } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Selection, 2: Animation, 3: Success

  const handleCreate = async () => {
    if (balance < 8000) {
      return; // Context will show toast
    }
    
    hapticFeedback('heavy');
    setStep(2);
    
    // Simulate "Printing" the card
    setTimeout(async () => {
      await createCard();
      setStep(3);
      hapticFeedback('success');
    }, 3500);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FC] dark:bg-[#000000] px-6 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Virtual Cards</h1>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="relative aspect-[1.586/1] w-full rounded-[24px] bg-gradient-to-br from-[#1A2130] to-[#000000] p-8 overflow-hidden shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D1C] rounded-full blur-[100px] opacity-20" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-10 bg-yellow-500/20 rounded-md border border-yellow-500/30" />
                  <span className="text-white/40 font-bold italic text-xl">TITAN</span>
                </div>
                <div className="space-y-1">
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Virtual Dollar Card</p>
                  <p className="text-white text-2xl font-mono tracking-widest">•••• •••• •••• ••••</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF4D1C]">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Global Spending</p>
                  <p className="text-xs text-gray-400">Pay on Netflix, Amazon, Apple, and more.</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Secure & Private</p>
                  <p className="text-xs text-gray-400">Freeze and unfreeze your card instantly.</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                onClick={handleCreate}
                className="w-full bg-[#FF4D1C] py-5 rounded-[24px] text-white font-bold text-lg shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                Create Virtual Card (₦8,000)
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">One-time issuance fee applies</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-12"
          >
            <div className="relative">
              <motion.div 
                animate={{ 
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", type: 'tween' }}
                className="w-64 h-40 bg-gradient-to-br from-[#FF4D1C] to-[#FF8E1C] rounded-2xl shadow-2xl flex items-center justify-center"
              >
                <CreditCard size={48} className="text-white" />
              </motion.div>
              <motion.div 
                animate={{ opacity: [0, 1, 0], y: [-20, 20] }}
                transition={{ duration: 1.5, repeat: Infinity, type: 'tween' }}
                className="absolute -inset-4 border-2 border-[#FF4D1C] rounded-3xl"
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Architecting Card...</h2>
              <p className="text-gray-400">Securing your virtual credentials</p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-8 text-center"
          >
            <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Card Ready!</h2>
              <p className="text-gray-400 px-8">Your Titan Virtual Dollar card has been issued and is ready for use.</p>
            </div>
            <button 
              onClick={onBack}
              className="w-full bg-[#1C1C1E] dark:bg-white dark:text-[#1C1C1E] py-5 rounded-[24px] text-white font-bold"
            >
              View My Cards
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}