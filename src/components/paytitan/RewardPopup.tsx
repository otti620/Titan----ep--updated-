"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PartyPopper, X, ArrowRight, ShieldCheck, Hand } from 'lucide-react';
import { hapticFeedback } from '../../lib/utils';

// We import canvas confetti if we had it, but we use a simpler animation.

interface RewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  description: string;
}

const RewardPopup = ({ isOpen, onClose, amount, title, description }: RewardPopupProps) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRevealed(false);
      hapticFeedback('medium');
    }
  }, [isOpen]);

  const handleReveal = () => {
    if (revealed) return;
    hapticFeedback('success');
    import('../../lib/audio').then(m => m.playSuccessSound());
    setRevealed(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (revealed) onClose(); }}
            className="absolute inset-0 bg-[#1A2130]/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            className="relative w-full max-w-xs bg-white dark:bg-[#1A2130] rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
          >
            {/* The Scratch Card Surface */}
            <AnimatePresence>
              {!revealed && (
                <motion.div 
                  initial={{ opacity: 1 }} 
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  onClick={handleReveal}
                  className="absolute inset-0 z-50 bg-gradient-to-br from-indigo-500 via-purple-500 to-[#FF4D1C] flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 2, repeat: Infinity, type: 'tween' }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30"
                  >
                    <Hand className="text-white" size={32} />
                  </motion.div>
                  <h3 className="text-white font-bold text-xl uppercase tracking-widest text-shadow-sm mb-2">Daily Reward</h3>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wider backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/20">
                    Tap to Scratch
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Revealed Content */}
            <div className="relative z-10 flex flex-col items-center text-center p-8 pt-12">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-10 blur-3xl rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 opacity-10 blur-3xl rounded-full -ml-10 -mb-10" />

              <motion.div 
                initial={{ scale: 0 }}
                animate={revealed ? { scale: 1, rotate: [-10, 10, 0] } : { scale: 0 }}
                transition={{ 
                  scale: { type: 'spring', bounce: 0.6 },
                  rotate: { type: 'tween', duration: 0.5, ease: 'easeOut' }
                }}
                className="w-20 h-20 bg-[#FF4D1C] rounded-[24px] flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6"
              >
                <PartyPopper className="text-white w-10 h-10" />
              </motion.div>

              <div className="space-y-1 mb-6">
                <div className="flex items-center justify-center gap-2 text-[#FF4D1C]">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{title}</span>
                  <Sparkles size={14} />
                </div>
                <h2 className="text-4xl font-bold text-[#1A2130] dark:text-white tracking-tighter">
                  +₦{amount.toLocaleString()}
                </h2>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 px-2 font-medium">
                {description}
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={onClose}
                  className="w-full bg-[#1A2130] dark:bg-white text-white dark:text-[#1A2130] py-4 rounded-[20px] font-bold text-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  Collect Cash <ArrowRight size={20} />
                </button>
                
                <div className="flex items-center justify-center gap-2 py-2">
                  <ShieldCheck size={12} className="text-green-500" />
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Added to Wallet</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-transform z-20"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RewardPopup;