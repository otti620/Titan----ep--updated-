"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, Brain, MessageSquare, Send, CheckCircle2, 
  Trash2, ShieldCheck, KeyRound, Check, X, CreditCard, 
  Phone, ArrowUpRight, HelpCircle, Download, Share2, AlertCircle
} from 'lucide-react';
import PayTitanLogo from '../PayTitanLogo';
import { usePayTitan } from '../../../context/PayTitanContext';
import { cn, hapticFeedback } from '../../../lib/utils';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'titan';
  text: string;
  pendingTx?: {
    type: 'transfer' | 'topup' | 'airtime' | 'data';
    amount: number;
    recipient: string;
    note?: string;
    extra?: any;
    status: 'pending' | 'verifying' | 'completed' | 'cancelled' | 'failed';
    errorMessage?: string;
  };
  txReceipt?: {
    reference: string;
    amount: number;
    fee: number;
    recipient: string;
    type: string;
    biller?: string;
    category?: string;
    timestamp: string;
    status: string;
  };
}

const TitanAIScreen = ({ onBack }: { onBack: () => void }) => {
  const { 
    profile, 
    balance, 
    executeAiAction, 
    validatePin, 
    transferFunds, 
    fundUserWallet, 
    processPayment,
    generateHistoryPDF
  } = usePayTitan();

  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activePinMsgIndex, setActivePinMsgIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Persistent Chat history from LocalStorage
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`pt_ai_chat_messages_${profile?.id || 'guest'}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    return [
      { 
        role: 'titan', 
        text: `PayTitan Smart Core initialized. I am here to help you manage your money, ${profile?.first_name || 'User'}.\n\nI can execute transactions securely when you type instructions. Try commands like:\n\n• "Send 5,000 to @shade"\n• "Fund my wallet with 10k"\n• "Buy Airtel airtime 1500 for 08123456789"` 
      }
    ];
  });

  // Save chat history to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`pt_ai_chat_messages_${profile?.id || 'guest'}`, JSON.stringify(chatMessages));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [chatMessages, profile?.id]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    const prompt = userInput;
    setUserInput('');
    const newMsg: ChatMessage = { role: 'user', text: prompt };
    setChatMessages(prev => [...prev, newMsg]);
    setIsProcessing(true);
    hapticFeedback('medium');

    try {
      const result = await executeAiAction(prompt, chatMessages);
      
      const responseMsg: ChatMessage = { 
        role: 'titan', 
        text: result.message 
      };

      if (result.pendingTx) {
        responseMsg.pendingTx = {
          ...result.pendingTx,
          status: 'pending'
        };
      }

      setChatMessages(prev => {
        const next = [...prev, responseMsg];
        // If there's a pending transaction, set it as active for PIN entry
        if (result.pendingTx) {
          setActivePinMsgIndex(next.length - 1);
        }
        return next;
      });

      hapticFeedback(result.success ? 'success' : 'error');
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'titan', text: "I apologize, but my proprietary offline core encountered a calculation discrepancy. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    hapticFeedback('heavy');
    if (window.confirm("Are you sure you want to clear your Titan AI chat history?")) {
      const defaultMsg: ChatMessage[] = [
        { 
          role: 'titan', 
          text: `PayTitan Smart Core chat cleared. I am ready for your next smart instructions, ${profile?.first_name || 'User'}!` 
        }
      ];
      setChatMessages(defaultMsg);
      setActivePinMsgIndex(null);
      setPinInput('');
      toast.success("AI chat history cleared");
    }
  };

  // Secure Keypad handlers
  const handleKeypadPress = (digit: string) => {
    hapticFeedback('light');
    if (pinInput.length < 4) {
      setPinInput(prev => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    hapticFeedback('medium');
    setPinInput(prev => prev.slice(0, -1));
  };

  const cancelPendingTransaction = (msgIndex: number) => {
    hapticFeedback('medium');
    setChatMessages(prev => {
      const updated = [...prev];
      if (updated[msgIndex]?.pendingTx) {
        updated[msgIndex].pendingTx!.status = 'cancelled';
      }
      return updated;
    });
    setActivePinMsgIndex(null);
    setPinInput('');
    toast.error("Transaction cancelled");
  };

  // Execute actual transactions after PIN validation
  const executeTransaction = async (msgIndex: number) => {
    const msg = chatMessages[msgIndex];
    if (!msg || !msg.pendingTx) return;

    hapticFeedback('heavy');
    
    // Set verifying state
    setChatMessages(prev => {
      const updated = [...prev];
      if (updated[msgIndex]?.pendingTx) {
        updated[msgIndex].pendingTx!.status = 'verifying';
      }
      return updated;
    });

    const tx = msg.pendingTx;
    const pin = pinInput;
    setPinInput('');

    try {
      // 1. Verify PIN
      const pinResult = await validatePin(pin);
      if (!pinResult.success) {
        throw new Error("Invalid Security PIN. Access unauthorized.");
      }

      // 2. Process based on type
      let txSuccess = false;
      let reference = '';
      let message = '';
      let fee = 0;

      if (tx.type === 'transfer') {
        const res = await transferFunds(tx.recipient, tx.amount, tx.note || "Titan AI Automated Transfer");
        txSuccess = res.success;
        reference = res.reference || `TX-${Math.floor(100000 + Math.random() * 899900)}`;
        message = res.message || '';
      } else if (tx.type === 'topup') {
        const success = await fundUserWallet(profile?.id || 'guest', tx.amount);
        txSuccess = success;
        reference = `DEP-${Math.floor(100000 + Math.random() * 899900)}`;
      } else if (tx.type === 'airtime' || tx.type === 'data') {
        const extra = tx.extra || {};
        const res = await processPayment({
          type: tx.type,
          amount: tx.amount,
          phone: tx.recipient,
          network: extra.network || 'MTN',
          biller: extra.biller || 'VTU',
          category: extra.category || 'VTU'
        });
        txSuccess = res.success;
        reference = res.reference || `PAY-${Math.floor(100000 + Math.random() * 899900)}`;
        message = res.message || '';
      }

      if (txSuccess) {
        // Success: Update state with Completed status & generate Receipt
        const receipt = {
          reference,
          amount: tx.amount,
          fee,
          recipient: tx.recipient,
          type: tx.type,
          biller: tx.extra?.biller,
          category: tx.extra?.category,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' | ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Settled Successfully'
        };

        setChatMessages(prev => {
          const updated = [...prev];
          if (updated[msgIndex]) {
            updated[msgIndex].pendingTx!.status = 'completed';
            updated[msgIndex].txReceipt = receipt;
            // Append a success assistant message
            updated.push({
              role: 'titan',
              text: `Transaction completed successfully! I have structured a dedicated high-end transaction receipt for you below. Let me know if you need any other payment handled.`
            });
          }
          return updated;
        });
        setActivePinMsgIndex(null);
        hapticFeedback('success');
        toast.success("Transaction executed successfully!");
      } else {
        throw new Error(message || "Processor transaction failed. Please retry.");
      }

    } catch (err: any) {
      console.error(err);
      hapticFeedback('error');
      toast.error(err.message || "Transaction error");
      setChatMessages(prev => {
        const updated = [...prev];
        if (updated[msgIndex]?.pendingTx) {
          updated[msgIndex].pendingTx!.status = 'failed';
          updated[msgIndex].pendingTx!.errorMessage = err.message || "Internal transaction dispatch discrepancy.";
        }
        return updated;
      });
      setActivePinMsgIndex(null);
    }
  };

  // Watch PIN length to trigger execution
  useEffect(() => {
    if (pinInput.length === 4 && activePinMsgIndex !== null) {
      executeTransaction(activePinMsgIndex);
    }
  }, [pinInput, activePinMsgIndex]);

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col overflow-hidden">
      {/* AI Assistant Header */}
      <div className="px-6 sm:px-8 pt-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0F172A] z-20 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span className="text-[10px] font-black tracking-[0.4em] text-indigo-500 uppercase italic">TITAN SMART CORE</span>
          </div>
          <h2 className="text-sm font-black text-[#1A2130] dark:text-white mt-0.5">PayTitan Intelligent AI</h2>
        </div>
        <button onClick={clearChat} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 active:text-red-500 transition-colors text-gray-400">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Space */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-white/30 to-transparent dark:from-white/1 dark:to-transparent">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar scroll-smooth"
        >
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            
            return (
              <div key={idx} className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex flex-col max-w-[90%] space-y-1.5",
                    isUser ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-6 py-4 rounded-[28px] shadow-sm relative overflow-hidden",
                    isUser 
                      ? "bg-indigo-600 text-white rounded-tr-none font-semibold text-sm leading-relaxed" 
                      : "bg-white dark:bg-[#1A2130] text-[#1A2130] dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-white/5 text-[13px] font-semibold leading-relaxed"
                  )}>
                    {!isUser && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3">
                    {!isUser && <Brain size={10} className="text-indigo-500" />}
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                      {isUser ? (profile?.first_name || 'MEMBER') : 'TITAN INTELLIGENCE'}
                    </span>
                  </div>
                </motion.div>

                {/* Inline PIN Confirmation Keypad */}
                {msg.pendingTx && msg.pendingTx.status !== 'completed' && msg.pendingTx.status !== 'cancelled' && (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="mx-auto w-full max-w-sm bg-white/60 dark:bg-[#131B2E]/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6"
                    >
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <KeyRound size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">Security Gate</h4>
                            <p className="text-[10px] font-bold text-indigo-500 tracking-wide">Enter PIN to authorize</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => cancelPendingTransaction(idx)}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Summary of what we are paying */}
                      <div className="bg-black/5 dark:bg-white/5 rounded-[22px] p-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value</span>
                        <h2 className="text-2xl font-black text-foreground mt-1">₦{msg.pendingTx.amount.toLocaleString()}</h2>
                        <p className="text-xs font-semibold text-muted-foreground mt-1">
                          {msg.pendingTx.type === 'transfer' ? `Transfer to @${msg.pendingTx.recipient}` : 
                           msg.pendingTx.type === 'topup' ? 'Wallet Deposit' : 
                           `${msg.pendingTx.extra?.network} Airtime VTU Recharge`}
                        </p>
                      </div>

                      {/* Interactive PIN Indicators */}
                      <div className="flex flex-col items-center space-y-3">
                        {msg.pendingTx.status === 'verifying' ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">Securing Node Ledgers...</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-4 justify-center py-2">
                              {[0, 1, 2, 3].map((dot) => (
                                <div 
                                  key={dot} 
                                  className={cn(
                                    "w-3.5 h-3.5 rounded-full transition-all duration-150 border border-indigo-300 dark:border-indigo-800",
                                    pinInput.length > dot 
                                      ? "bg-indigo-600 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
                                      : "bg-gray-100 dark:bg-white/5"
                                  )}
                                />
                              ))}
                            </div>
                            
                            {/* Error Message if failed */}
                            {msg.pendingTx.status === 'failed' && (
                              <div className="flex items-center gap-1.5 text-red-500 bg-red-500/5 px-4 py-2 rounded-xl text-[10px] font-bold text-center">
                                <AlertCircle size={12} />
                                {msg.pendingTx.errorMessage || "Validation discrepancy."}
                              </div>
                            )}

                            {/* SECURE VIRTUAL KEYPAD */}
                            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] pt-4">
                              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                                <button
                                  key={digit}
                                  onClick={() => handleKeypadPress(digit)}
                                  className="w-16 h-12 rounded-[16px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm font-black active:scale-90 transition-transform flex items-center justify-center text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                  {digit}
                                </button>
                              ))}
                              <button
                                onClick={() => cancelPendingTransaction(idx)}
                                className="w-16 h-12 rounded-[16px] text-[10px] font-black text-red-500 active:scale-90 transition-transform flex items-center justify-center"
                              >
                                CANCEL
                              </button>
                              <button
                                onClick={() => handleKeypadPress('0')}
                                className="w-16 h-12 rounded-[16px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm font-black active:scale-90 transition-transform flex items-center justify-center text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                              >
                                0
                              </button>
                              <button
                                onClick={handleKeypadBackspace}
                                className="w-16 h-12 rounded-[16px] text-xs font-black text-gray-500 active:scale-90 transition-transform flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-br-[16px]"
                              >
                                ⌫
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Secure cancelled status or failed status inline tag */}
                {msg.pendingTx && msg.pendingTx.status === 'cancelled' && (
                  <div className="flex justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <X size={12} /> Transaction Cancelled by User
                    </div>
                  </div>
                )}

                {/* GORGEOUS HIGH-END INTERACTIVE TRANSACTION RECEIPT */}
                {msg.txReceipt && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mx-auto w-full max-w-sm bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
                  >
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    
                    {/* Watermark branding */}
                    <div className="absolute -right-8 -bottom-8 opacity-5 text-foreground rotate-12 pointer-events-none">
                      <PayTitanLogo size={140} />
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Success Circle */}
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping" />
                        <CheckCircle2 size={36} strokeWidth={1.5} />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                          {msg.txReceipt.status}
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white pt-2">
                          ₦{msg.txReceipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">PAYTITAN TRANSACTION RECORD</p>
                      </div>

                      {/* Detail Ledger Grid */}
                      <div className="w-full bg-gray-50 dark:bg-black/20 rounded-[24px] p-5 space-y-3.5 text-xs text-left border border-gray-100/50 dark:border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px] tracking-wider">Method</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">Titan AI Smart Pay</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px] tracking-wider">Recipient</span>
                          <span className="font-bold text-indigo-500">
                            {msg.txReceipt.recipient.startsWith('@') ? msg.txReceipt.recipient : `@${msg.txReceipt.recipient}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px] tracking-wider">Payment Category</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                            {msg.txReceipt.category || msg.txReceipt.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px] tracking-wider">Reference Code</span>
                          <span className="font-mono font-bold text-gray-700 dark:text-gray-300 text-[10px] uppercase">
                            {msg.txReceipt.reference}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px] tracking-wider">Settled On</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-[10px]">
                            {msg.txReceipt.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Separator */}
                      <div className="w-full flex items-center gap-1.5 py-1">
                        <div className="w-3 h-3 bg-[#F8F9FC] dark:bg-[#0F172A] rounded-full -ml-7 border-r border-gray-100 dark:border-white/10" />
                        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-white/10" />
                        <div className="w-3 h-3 bg-[#F8F9FC] dark:bg-[#0F172A] rounded-full -mr-7 border-l border-gray-100 dark:border-white/10" />
                      </div>

                      {/* Barcode representation */}
                      <div className="flex flex-col items-center space-y-1.5 w-full pt-1">
                        <div className="flex justify-between w-48 h-6 overflow-hidden select-none opacity-40 dark:opacity-60">
                          {Array.from({ length: 32 }).map((_, bIdx) => (
                            <div 
                              key={bIdx} 
                              className="bg-foreground" 
                              style={{ width: `${(bIdx % 3 === 0 ? 3 : bIdx % 2 === 0 ? 1 : 2)}px`, height: '100%' }} 
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-mono tracking-[0.3em] text-gray-400 dark:text-gray-500 uppercase">
                          *PT-{msg.txReceipt.reference}*
                        </span>
                      </div>

                      {/* Quick Interactive Actions */}
                      <div className="grid grid-cols-2 gap-3 w-full pt-2">
                        <button 
                          onClick={() => generateHistoryPDF(msg.txReceipt?.reference || '')}
                          className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground text-xs font-bold transition-all active:scale-95 border border-gray-100 dark:border-white/5"
                        >
                          <Download size={14} className="text-indigo-500" />
                          Save PDF
                        </button>
                        <button 
                          onClick={() => {
                            hapticFeedback('medium');
                            toast.success("Receipt reference copied securely to sharing tray");
                          }}
                          className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-600/10"
                        >
                          <Share2 size={14} />
                          Share Direct
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex flex-col items-start space-y-2 max-w-[85%]">
              <div className="px-5 py-4 rounded-[28px] rounded-tl-none bg-white dark:bg-[#1A2130] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex gap-1.5 py-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 italic">Thinking...</span>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="px-6 py-8 pb-12 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC] to-transparent dark:from-[#0F172A] dark:via-[#0F172A] z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[32px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
            <div className="relative flex items-center gap-2 bg-white dark:bg-[#1A2130] p-2 rounded-[32px] shadow-xl border border-gray-100 dark:border-white/10">
              <div className="w-10 h-10 hidden sm:flex items-center justify-center text-indigo-500 shrink-0">
                <PayTitanLogo size={20} />
              </div>
              <input 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Ask PayTitan to "transfer", "topup" or "check balance"...'
                className="flex-1 bg-transparent border-none px-4 py-3 text-sm font-bold text-[#1A2130] dark:text-white placeholder:text-gray-400 outline-none"
                disabled={activePinMsgIndex !== null}
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!userInput.trim() || isProcessing || activePinMsgIndex !== null}
                className="w-12 h-12 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-lg disabled:opacity-50 transition-all shrink-0"
              >
                <Send size={20} />
              </motion.button>
            </div>
            <div className="flex justify-center gap-6 mt-4">
               {['Balance', 'History', 'Claim Reward'].map((tag) => (
                 <button 
                  key={tag}
                  onClick={() => setUserInput(tag)}
                  disabled={activePinMsgIndex !== null}
                  className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors disabled:opacity-30"
                 >
                   {tag}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitanAIScreen;
