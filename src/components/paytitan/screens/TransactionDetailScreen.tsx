"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Download, Copy, CheckCircle2, ShieldCheck, Users, Loader2, Send, X, Repeat, AlertTriangle, Sparkles, XCircle, Clock, QrCode, ArrowRight } from 'lucide-react';
import { Transaction, usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn, safeShare } from '../../../lib/utils';
import { generateReceiptFlyer } from '../../../lib/flyer';
import QRCode from "react-qr-code";

const springConfig: any = { type: "spring", stiffness: 300, damping: 30 };

const TransactionDetailScreen = ({ transaction, onBack, onSplit, onRepeat }: { transaction: Transaction | undefined, onBack: () => void, onSplit?: () => void, onRepeat?: () => void }) => {
  const { profile, reportTransactionIssue } = usePayTitan();
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (transaction?.status === 'successful') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={1.5} />
        <p className="text-muted-foreground font-medium">Retrieving receipt...</p>
      </div>
    );
  }

  const handleReport = async () => {
    hapticFeedback('medium');
    setIsReporting(true);
    const success = await reportTransactionIssue(transaction.id, "User reported issue via receipt screen");
    setIsReporting(false);
    if (success) onBack();
  };

  const handleShare = async () => {
    hapticFeedback('medium');
    setIsGenerating(true);
    try {
      toast.info("Designing your custom luxury transaction flyer...");
      await generateReceiptFlyer(transaction, profile);

      const isIncome = transaction.type === 'in';
      const text = `PayTitan Transaction Receipt\nAmount: ₦${transaction.amount.toLocaleString()}\nRecipient: ${transaction.title}\nReference: ${transaction.reference || transaction.id.slice(0, 8).toUpperCase()}\n\nJoin the titan alliance: paytitan.com 🚀`;
      
      const result = await safeShare({
        title: 'PayTitan Receipt',
        text,
      }, text);

      if (result === 'copied') {
        toast.success("Flyer generated! Receipt text copied as well.");
      } else {
        toast.success("High-end branding flyer generated successfully!");
      }
    } catch (err) {
      console.error("Flyer design error:", err);
      toast.error("Could not construct custom visual assets");
    } finally {
      setIsGenerating(false);
    }
  };

  const isIncome = transaction.type === 'in';
  const statusColor = transaction.status === 'FAILED' ? 'text-red-500' : transaction.status === 'PENDING' ? 'text-amber-500' : 'text-green-500';
  const statusBg = transaction.status === 'FAILED' ? 'bg-red-500/10' : transaction.status === 'PENDING' ? 'bg-amber-500/10' : 'bg-green-500/10';

  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Decorative Titan Pulse Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 400 - 200, rotate: 0 }}
                animate={{ y: 800, x: Math.random() * 400 - 200, rotate: 360 }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  ['bg-indigo-500', 'bg-blue-400', 'bg-purple-500', 'bg-green-400'][i % 4]
                )}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center backdrop-blur-xl border-b border-black/5 dark:border-white/5 sticky top-0 z-40">
        <button onClick={onBack} className="text-foreground/80 font-medium flex items-center gap-1 active:opacity-60 transition-opacity w-20">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="text-[15px] font-bold tracking-tight">Back</span>
        </button>
        <span className="text-[13px] font-black uppercase tracking-[0.2em] text-foreground/40 absolute left-1/2 -translate-x-1/2">Receipt</span>
        <div className="w-20 flex justify-end">
          <button onClick={handleShare} className="text-indigo-500 active:opacity-60 transition-opacity">
            <Share2 size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-8 space-y-8 overflow-y-auto no-scrollbar pb-24 relative z-10">
        {/* Receipt Card - The Digital Trophy */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden"
        >
          {/* Subtle Dot Matrix Overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

          <div className="p-8 text-center space-y-4 relative">
            <div className="flex justify-center mb-4 relative">
              <div className={cn("w-[72px] h-[72px] rounded-full flex items-center justify-center relative z-10", statusBg, statusColor)}>
                {transaction.status === 'FAILED' ? (
                  <XCircle size={40} strokeWidth={1.5} />
                ) : transaction.status === 'PENDING' ? (
                  <Clock size={40} strokeWidth={1.5} />
                ) : (
                  <CheckCircle2 size={40} strokeWidth={1.5} />
                )}
              </div>
              
              {/* Titan Pulse Animated Rings */}
              {transaction.status === 'successful' && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-green-500/30"
                  />
                  <motion.div 
                    animate={{ scale: [1, 2.4], opacity: [0.15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border border-green-500/20"
                  />
                </>
              )}
            </div>
            
            <div className="space-y-1">
              <p className={cn("text-[11px] font-black uppercase tracking-[0.25em]", statusColor)}>
                {transaction.status === 'FAILED' ? "Transaction Failed" :
                 transaction.status === 'PENDING' ? "Transaction Pending" : "Transaction Successful"}
              </p>
              <h2 className="text-[36px] font-black text-foreground tabular-nums tracking-tighter font-mono leading-none pt-2">
                {isIncome ? '+' : '-'}₦{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="px-8 pb-8 space-y-6 relative">
             <div className="h-px w-full bg-black/5 dark:bg-white/5" />
             
             <div className="grid grid-cols-1 gap-6">
               <DetailRow label="Recipient" value={transaction.title} isHeader />
               
               <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                 <DetailRow label="Category" value={transaction.category} />
                 <DetailRow label="Method" value={isIncome ? "Inward Transfer" : "PayTitan Wallet"} />
                 <DetailRow label="Date" value={new Date(transaction.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                 <DetailRow label="Time" value={transaction.time || '--:--'} />
               </div>

               <DetailRow label="Reference ID" value={transaction.reference || transaction.id.slice(0, 12).toUpperCase()} copyable isDot />
             </div>

             <div className="h-px w-full bg-black/5 dark:bg-white/5" />

             {/* Dynamic QR Code */}
             <div className="flex flex-col items-center justify-center pt-2 gap-4">
                <div className="p-3 bg-white rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
                  <QRCode 
                    value={transaction.id} 
                    size={100} 
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    fgColor="#000000"
                    bgColor="transparent"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Verify via Titan Scanner<br/>ID: {transaction.id.slice(0,8)}
                  </p>
                </div>
             </div>
          </div>

          {/* Regulatory Badges - Trust & Transparency */}
          <div className="bg-black/5 dark:bg-white/5 py-4 px-8 flex justify-between items-center">
            <div className="flex items-center gap-1.5 opacity-40">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">TitanShield™</span>
            </div>
            <div className="flex items-center gap-3 opacity-30 grayscale contrast-125">
               <span className="text-[9px] font-black tracking-tighter">CBN LICENSED</span>
               <span className="text-[9px] font-black tracking-tighter">NDIC INSURED</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full py-4.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[22px] flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all group overflow-hidden relative"
          >
            {isGenerating ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <>
                <Sparkles size={18} className="text-white group-hover:rotate-12 transition-transform" />
                <span className="text-[16px]">Share Direct Receipt</span>
                <ArrowRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <motion.div 
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onRepeat}
              className="bg-white dark:bg-white/10 text-foreground py-4 rounded-[20px] flex items-center justify-center gap-2 font-bold text-[15px] border border-black/5 dark:border-white/5 active:scale-95 transition-all shadow-sm"
            >
              <Repeat size={18} /> Repeat
            </button>
            {!isIncome && (
              <button 
                onClick={onSplit}
                className="bg-white dark:bg-white/10 text-foreground py-4 rounded-[20px] flex items-center justify-center gap-2 font-bold text-[15px] border border-black/5 dark:border-white/5 active:scale-95 transition-all shadow-sm"
              >
                <Users size={18} /> Split
              </button>
            )}
          </div>
          
          <button 
            onClick={handleReport}
            disabled={isReporting}
            className="w-full py-4 text-red-500 font-bold text-[14px] uppercase tracking-widest active:opacity-60 transition-opacity flex items-center justify-center gap-2"
          >
            {isReporting ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            Dispute Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, copyable, isHeader, isMono, isDot }: { label: string, value: string, copyable?: boolean, isHeader?: boolean, isMono?: boolean, isDot?: boolean }) => (
  <div className={cn("space-y-1", isHeader && "col-span-full")}>
    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">{label}</p>
    <div className="flex items-center gap-2">
      <p className={cn(
        "text-foreground",
        isHeader ? "text-[20px] font-bold tracking-tight" : "text-[15px] font-bold tracking-tight",
        isMono && "font-mono tracking-tighter uppercase",
        isDot && "dot-matrix"
      )}>
        {value}
      </p>
      {copyable && (
        <button 
          onClick={() => { hapticFeedback('light'); navigator.clipboard.writeText(value); toast.success("Copied to clipboard"); }}
          className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full active:scale-90 transition-transform"
        >
          <Copy size={12} className="text-muted-foreground" />
        </button>
      )}
    </div>
  </div>
);

export default TransactionDetailScreen;