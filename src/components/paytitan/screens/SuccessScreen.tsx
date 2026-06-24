"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Share2, Download, Copy, ShieldCheck, ArrowRight, Sparkles, Star } from 'lucide-react';
import { hapticFeedback, safeShare, cn } from '../../../lib/utils';
import { toast } from 'sonner';

interface SuccessScreenProps {
  title: string;
  subtitle: string;
  amount: string;
  recipient: string;
  onClose: () => void;
}

const SuccessScreen = ({ title, subtitle, amount, recipient, onClose }: SuccessScreenProps) => {
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    hapticFeedback('success');
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    hapticFeedback('light');
    const text = `I have successfully executed a capital transfer of ₦${amount} to ${recipient}. Precision and security via PayTitan. https://paytitan.com`;
    const result = await safeShare({
      title: 'Payment Successful',
      text,
    }, text);

    if (result === 'copied') {
      toast.success("Receipt details copied!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0A0A0A] flex flex-col pt-12 pb-8 px-6 overflow-hidden">
      {/* Decorative Confetti Background */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-start">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 400 - 200, rotate: 0 }}
                animate={{ y: 800, x: Math.random() * 400 - 200, rotate: 360 }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
                className={cn(
                  "w-2 h-2 rounded-sm",
                  ['bg-amber-400', 'bg-indigo-500', 'bg-[#FF4D1C]', 'bg-emerald-500'][i % 4]
                )}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-sm mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="w-20 h-20 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-full flex items-center justify-center mb-6 relative"
        >
          <CheckCircle2 className="w-10 h-10 text-[#10B981]" strokeWidth={2.5} />
          <motion.div 
            animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[#10B981]/20"
          />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center space-y-2 mb-10 w-full"
        >
          <h2 className="text-[28px] font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
          <div className="flex items-center justify-center gap-2">
             <div className="h-px w-8 bg-amber-400/30" />
             <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-400/20">
                <Star size={10} className="text-amber-500 fill-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">+100 Titan Points</span>
             </div>
             <div className="h-px w-8 bg-amber-400/30" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full"
        >
          <div className="bg-gray-50 dark:bg-[#151515] rounded-[32px] p-7 border border-gray-100 dark:border-white/5 shadow-sm space-y-7">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Amount</p>
              <h3 className="text-[44px] font-bold text-gray-900 dark:text-white tracking-tighter leading-none">₦{amount}</h3>
            </div>

            <div className="h-px w-full bg-gray-200 dark:bg-white/5" />

            <div className="space-y-4.5">
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-gray-500 dark:text-gray-400">Recipient</span>
                <span className="text-[15px] font-semibold text-gray-900 dark:text-white">{recipient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-gray-500 dark:text-gray-400">Date</span>
                <span className="text-[15px] font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-gray-500 dark:text-gray-400">Tracking ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-mono font-medium text-gray-900 dark:text-white">PT-98234-AX</span>
                  <Copy className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-200 dark:bg-white/5" />
            
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wide">Secured by TitanShield</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-3 w-full max-w-sm mx-auto mt-6 relative z-10"
      >
        <button
          onClick={handleShare}
          className="w-full bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-[18px] rounded-[24px] font-semibold text-[16px] shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Share2 size={18} strokeWidth={2.5} /> Export Voucher
        </button>
        <button
          onClick={onClose}
          className="w-full bg-[#1A2130] dark:bg-white text-white dark:text-[#1A2130] py-[18px] rounded-[24px] font-bold text-[16px] shadow-md active:scale-[0.98] transition-transform"
        >
          Acknowledge
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;