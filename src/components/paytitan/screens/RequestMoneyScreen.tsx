"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AtSign, CheckCircle2, ArrowRight, Loader2, XCircle, Star, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan, Profile } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import SuccessScreen from './SuccessScreen';

const RequestMoneyScreen = ({ onBack }: { onBack: () => void }) => {
  const { requestMoney, getUserByUsername, contacts } = usePayTitan();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [handle, setHandle] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recipient, setRecipient] = useState<Profile | null>(null);

  // Navigation bar large title collapse state
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-70px 0px 0px 0px" }
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [step]);

  // Real-time Identity Verification
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (handle.length >= 3) {
        setIsVerifying(true);
        const user = await getUserByUsername(handle);
        setRecipient(user);
        setIsVerifying(false);
        if (user) hapticFeedback('light');
      } else {
        setRecipient(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handle, getUserByUsername]);

  const handleNext = () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    if (!recipient) return toast.error("Enter a valid Titan handle");
    
    hapticFeedback('medium');
    setStep(2);
  };

  const handleConfirmRequest = async () => {
    setIsLoading(true);
    await requestMoney(handle, parseFloat(amount), note);
    setIsLoading(false);
    hapticFeedback('success');
    setStep(3); // Success step
  };

  const selectRecent = (h: string) => {
    hapticFeedback('light');
    setHandle(h);
  };

  let title = "Request";
  if (step === 2) title = "Review";

  return (
    <div className="flex flex-col min-h-full bg-background pb-32">
      {step < 3 && (
        <div className={cn(
          "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
          isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
        )}>
          <div className="w-20">
            <button onClick={step === 1 ? onBack : () => setStep(1)} className="text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
              <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
            </button>
          </div>
          <div className={cn(
             "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
             isCollapsed ? "opacity-100" : "opacity-0"
          )}>
             <span className="headline text-foreground">{title}</span>
          </div>
          <div className="w-20" />
        </div>
      )}

      <div className="flex-1 px-4 pt-6 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground tracking-tight">Request</h1>
              </div>

              <div className="py-4 flex flex-col items-center justify-center">
                <span className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mb-4">Amount to Request</span>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-semibold text-indigo-500 mr-2 tabular-nums">₦</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="text-7xl font-bold bg-transparent border-none text-center focus:ring-0 w-full max-w-[300px] placeholder:text-muted-foreground/30 text-foreground tabular-nums tracking-tight p-0"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest">Request From</p>
                  <div className="ios-list-group p-0 mt-2">
                    <div className="p-2 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 ml-2">
                        <AtSign size={20} strokeWidth={2} />
                      </div>
                      <input 
                        placeholder="titan.handle" 
                        className="flex-1 bg-transparent border-none focus:ring-0 body font-semibold p-0 h-12"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase())}
                      />
                      <div className="pr-4">
                        {isVerifying && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
                        {recipient && <CheckCircle2 className="w-6 h-6 text-green-500" strokeWidth={1.5} />}
                        {!recipient && handle.length >= 3 && !isVerifying && <XCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />}
                      </div>
                    </div>
                  </div>
                </div>

                {recipient && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="ios-list-group p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipient.first_name}`} className="w-full h-full object-cover bg-black/5 dark:bg-white/5" alt={recipient.first_name} />
                    </div>
                    <div className="flex-1">
                      <p className="body font-semibold text-foreground">
                        {recipient.first_name} {recipient.last_name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={12} className="text-green-500" strokeWidth={2} />
                        <p className="caption-2 text-muted-foreground font-semibold uppercase tracking-widest">Verified Titan</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!recipient && contacts && contacts.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest">Recent Contacts</h3>
                    </div>
                    <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2 px-2">
                      {contacts.slice(0, 5).map((contact) => (
                        <button 
                          key={contact.id}
                          onClick={() => selectRecent(contact.username)}
                          className="flex flex-col items-center gap-2 min-w-[64px] active:scale-95 transition-transform ios-spring"
                        >
                          <div className="w-16 h-16 rounded-full p-0.5 border border-border shadow-sm bg-card">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.first_name}`} className="w-full h-full rounded-full bg-black/5 dark:bg-white/5" alt={contact.first_name} />
                          </div>
                          <span className="caption-1 font-medium text-muted-foreground">@{contact.username}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8">
                <motion.button 
                  onClick={handleNext}
                  disabled={!amount || !recipient}
                  animate={recipient && amount ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, type: 'tween' }}
                  className="w-full bg-indigo-500 py-3.5 rounded-full headline text-white shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 ios-spring"
                >
                  Review Request
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground tracking-tight">Review</h1>
              </div>

              <div className="ios-list-group p-8 text-center mt-6">
                <p className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mb-2">You are requesting</p>
                <h2 className="text-4xl font-bold text-foreground mb-8 tabular-nums tracking-tight">₦{parseFloat(amount).toLocaleString()}</h2>
                
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center py-3 border-t border-border mt-4 pt-6">
                    <span className="subheadline text-muted-foreground font-medium">From</span>
                    <div className="text-right">
                      <p className="body font-semibold">@{handle}</p>
                      <p className="caption-1 text-muted-foreground">{recipient?.first_name} {recipient?.last_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ios-list-group p-1 mt-4">
                <textarea 
                  placeholder="Add a note (optional)"
                  className="w-full bg-transparent border-none focus:ring-0 body p-4 resize-none min-h-[100px]"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="pt-8">
                <button 
                  onClick={handleConfirmRequest}
                  disabled={isLoading}
                  className="w-full bg-indigo-500 py-3.5 rounded-full headline text-white active:scale-95 transition-transform ios-spring disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
              <SuccessScreen 
                title="Request Sent!"
                subtitle={`A request for ₦${parseFloat(amount).toLocaleString()} has been sent to @${handle}`}
                amount={parseFloat(amount).toLocaleString()}
                recipient={`@${handle}`}
                onClose={onBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RequestMoneyScreen;