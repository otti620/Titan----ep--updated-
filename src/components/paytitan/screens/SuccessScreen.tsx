"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Share2, Download, Copy, ShieldCheck, ArrowRight, Sparkles, Star, QrCode } from 'lucide-react';
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
    const timer = setTimeout(() => setShowConfetti(false), 4000);
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
    <div className="fixed inset-0 z-[100] bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col pt-12 pb-8 px-6 overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-start z-50">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 400 - 200, rotate: 0 }}
                animate={{ y: 800, x: Math.random() * 400 - 200, rotate: 360 }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
                className={cn(
                  "w-2 h-2 rounded-sm",
                  ['bg-indigo-500', 'bg-blue-400', 'bg-emerald-500', 'bg-amber-400'][i % 4]
                )}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-sm mx-auto z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-[88px] h-[88px] bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={2} />
          
          {/* Titan Pulse Success Rings */}
          <motion.div 
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500/20"
          />
          <motion.div 
            animate={{ scale: [1, 2.2], opacity: [0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 rounded-full border border-green-500/10"
          />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-3 mb-10 w-full"
        >
          <h2 className="text-[32px] font-black text-foreground tracking-tighter leading-tight">{title}</h2>
          <div className="flex items-center justify-center gap-2">
             <div className="h-px w-6 bg-foreground/10" />
             <div className="flex items-center gap-1.5 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">+100 TITAN POINTS</span>
             </div>
             <div className="h-px w-6 bg-foreground/10" />
          </div>
        </motion.div>

        {/* Success Card - The Digital Trophy */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", damping: 25 }}
          className="w-full relative"
        >
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 border border-white dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none space-y-8 overflow-hidden relative">
            {/* Dot Matrix Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

            <div className="text-center relative">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-2">Principal Sum</p>
              <h3 className="text-[48px] font-black text-foreground tracking-tighter leading-none font-mono">₦{amount}</h3>
            </div>

            <div className="h-px w-full bg-black/5 dark:bg-white/5" />

            <div className="space-y-5 relative">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Recipient</span>
                <span className="text-[15px] font-bold text-foreground tracking-tight">{recipient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Timestamp</span>
                <span className="text-[15px] font-bold text-foreground tracking-tight">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Tracking ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-mono font-bold text-foreground tracking-tighter uppercase">PT-98234-AX</span>
                  <Copy size={14} className="text-muted-foreground opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
              </div>
            </div>
            
            <div className="h-px w-full bg-black/5 dark:bg-white/5" />
            
            <div className="flex items-center justify-between opacity-50">
               <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">TitanShield Secured</span>
               </div>
               <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-3 w-full max-w-sm mx-auto mt-8 relative z-20"
      >
        <button
          onClick={handleShare}
          className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground py-5 rounded-[24px] font-bold text-[16px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-3 backdrop-blur-md"
        >
          <Share2 size={20} strokeWidth={2.5} /> Export Digital Voucher
        </button>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 dark:bg-white text-white dark:text-black py-5 rounded-[24px] font-black text-[16px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Acknowledge Receipt <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;