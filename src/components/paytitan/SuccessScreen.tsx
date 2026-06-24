"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Share2, Download, Home, ArrowRight } from 'lucide-react';
import { hapticFeedback, cn } from '../../lib/utils';

interface SuccessScreenProps {
  title: string;
  amount?: string | number;
  subtitle: string;
  onDone: () => void;
  onNavigateHome?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

const SuccessScreen = ({ 
  title, 
  amount, 
  subtitle, 
  onDone, 
  onNavigateHome,
  primaryActionLabel = "Done",
  secondaryActionLabel = "Share Receipt" 
}: SuccessScreenProps) => {
  
  useEffect(() => {
    hapticFeedback('heavy');
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full animate-pulse" />
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl relative z-10 border-4 border-white dark:border-black">
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Check size={48} className="text-white" strokeWidth={4} />
          </motion.div>
        </div>
      </motion.div>

      <div className="text-center space-y-4 max-w-xs mx-auto">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold tracking-tight"
        >
          {title}
        </motion.h2>
        
        {amount && (
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-primary"
          >
            {typeof amount === 'number' ? `₦${amount.toLocaleString()}` : amount}
          </motion.p>
        )}

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[15px] font-medium text-muted-foreground leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="mt-20 w-full space-y-4 max-w-sm">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => { hapticFeedback('medium'); onDone(); }}
          className="w-full bg-[#1A2130] dark:bg-white text-white dark:text-black py-5 rounded-[32px] font-bold text-lg shadow-xl active:scale-95 transition-all"
        >
          {primaryActionLabel}
        </motion.button>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4"
        >
          <button className="flex-1 bg-secondary/50 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all">
            <Share2 size={18} /> {secondaryActionLabel}
          </button>
          <button className="flex-1 bg-secondary/50 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all text-blue-500">
            <Download size={18} /> Receipt
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessScreen;
