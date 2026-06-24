"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Download, Copy, CheckCircle2, ShieldCheck, Users, Loader2, Send, X, Repeat, AlertTriangle, Sparkles, XCircle, Clock } from 'lucide-react';
import { Transaction, usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn, safeShare } from '../../../lib/utils';
import { generateReceiptFlyer } from '../../../lib/flyer';

const springConfig: any = { type: "spring", stiffness: 300, damping: 30 };

const TransactionDetailScreen = ({ transaction, onBack, onSplit, onRepeat }: { transaction: Transaction | undefined, onBack: () => void, onSplit?: () => void, onRepeat?: () => void }) => {
  const { profile, reportTransactionIssue } = usePayTitan();
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

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
      
      // Auto-generates the advertisement and beautiful high-end flyer receipt, then downloads as a native flyer PNG file
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

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center ios-glass ios-hairline-bottom sticky top-0 z-10">
        <button onClick={onBack} className="text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity w-20">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <span className="headline absolute left-1/2 -translate-x-1/2">Receipt</span>
        <div className="w-20 flex justify-end">
          <button onClick={handleShare} className="text-indigo-500 active:opacity-60 transition-opacity">
            <Share2 size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar pb-12">
        {/* Receipt Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={springConfig}
          className="ios-list-group rounded-[24px]"
        >
          <div className="p-8 text-center space-y-3 border-b border-border">
            <div className="flex justify-center mb-2">
              {transaction.status === 'FAILED' ? (
                <div className="w-[60px] h-[60px] rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <XCircle size={36} strokeWidth={1.5} />
                </div>
              ) : transaction.status === 'PENDING' ? (
                <div className="w-[60px] h-[60px] rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
                  <Clock size={36} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <CheckCircle2 size={36} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className={cn(
                "caption-1 uppercase tracking-widest font-semibold",
                transaction.status === 'FAILED' ? "text-red-500" :
                transaction.status === 'PENDING' ? "text-amber-500" : "text-green-500"
              )}>
                {transaction.status === 'FAILED' ? "Transaction Failed" :
                 transaction.status === 'PENDING' ? "Transaction Pending" : "Transaction Successful"}
              </p>
              <h2 className="title-1 text-foreground tabular-nums">
                {isIncome ? '+' : '-'}₦{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <DetailRow label="Recipient" value={transaction.title} />
            <DetailRow label="Category" value={transaction.category} />
            <DetailRow label="Date" value={new Date(transaction.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            <DetailRow label="Status" value={transaction.status || 'SUCCESS'} />
            <DetailRow label="Reference" value={transaction.reference || transaction.id.slice(0, 8).toUpperCase()} copyable />
          </div>

          <div className="bg-black/5 dark:bg-white/5 p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck size={16} strokeWidth={1.5} />
              <span className="caption-1">TitanShield™ Verified</span>
            </div>
          </div>
        </motion.div>

        {/* Button Hierarchy */}
        <div className="space-y-3">
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold rounded-full flex items-center justify-center gap-2 headline active:scale-[0.98] transition-all duration-150 shadow-md border border-amber-300/30 font-sans"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin text-black" strokeWidth={2.5} />
                <span className="font-bold tracking-tight text-xs uppercase">Compiling Luxury Flyer...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-black fill-current animate-pulse" />
                <span className="font-bold tracking-tight text-xs uppercase">Generate Elegant Share Flyer (Ad)</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onRepeat}
              className="bg-indigo-500 text-white py-3 rounded-full flex items-center justify-center gap-2 headline active:scale-95 duration-150 ios-spring shadow-sm"
            >
              <Repeat size={18} strokeWidth={2} /> Repeat
            </button>
            {!isIncome && (
              <button onClick={onSplit} className="bg-white dark:bg-[#1C1C1E] text-indigo-500 py-3 rounded-full flex items-center justify-center gap-2 headline border border-border active:scale-95 duration-150 ios-spring shadow-sm">
                <Users size={18} strokeWidth={2} /> Split
              </button>
            )}
          </div>
          <button 
            onClick={handleReport}
            disabled={isReporting}
            className={cn(
              "w-full py-3 text-red-500 headline active:opacity-60 transition-opacity flex items-center justify-center gap-2",
              isReporting && "opacity-50"
            )}
          >
            {isReporting && <Loader2 size={16} className="animate-spin" />}
            Report an Issue
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, copyable }: { label: string, value: string, copyable?: boolean }) => (
  <div className="flex justify-between items-center">
    <p className="subheadline text-muted-foreground">{label}</p>
    <div className="flex items-center gap-2">
      <p className="subheadline font-semibold text-foreground text-right">{value}</p>
      {copyable && (
        <button 
          onClick={() => { hapticFeedback('light'); navigator.clipboard.writeText(value); toast.success("Copied"); }}
          className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full active:scale-90 transition-transform ios-spring"
        >
          <Copy size={16} strokeWidth={1.5} className="text-muted-foreground" />
        </button>
      )}
    </div>
  </div>
);

export default TransactionDetailScreen;