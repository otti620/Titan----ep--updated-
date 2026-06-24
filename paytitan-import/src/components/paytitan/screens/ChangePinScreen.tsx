"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Shield, Eye, EyeOff, ArrowRight, CheckCircle2, Delete } from 'lucide-react';
import { supabase } from '../../../integrations/supabase/client';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../../lib/utils';

const ChangePinScreen = ({ onBack }: { onBack: () => void }) => {
  const { setPin } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Password, 2: New PIN
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleVerifyPassword = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Verify password by attempting a re-authentication
    const { error } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: password,
    });

    if (error) {
      hapticFeedback('error');
      toast.error("Incorrect password. Please try again.");
    } else {
      hapticFeedback('success');
      setStep(2);
    }
    setIsLoading(false);
  };

  const handlePinPress = (num: string) => {
    if (newPin.length < 4) {
      hapticFeedback('light');
      const updatedPin = newPin + num;
      setNewPin(updatedPin);
      
      if (updatedPin.length === 4) {
        handleUpdatePin(updatedPin);
      }
    }
  };

  const handleUpdatePin = async (pinToSet: string) => {
    setIsLoading(true);
    const success = await setPin(pinToSet);
    if (success) {
      hapticFeedback('success');
      setStep(3); // Success step
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={onBack} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Cancel</span>
        </button>
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline tracking-tight">Security PIN</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h2 className="large-title tracking-tight text-foreground">Confirm Identity</h2>
                  <p className="caption-1 text-muted-foreground">Enter your account password to change your transaction PIN.</p>
                </div>

                <div className="space-y-2">
                  <label className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2">Password</label>
                  <div className="relative ios-list-group px-4 py-2 flex items-center">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Required" 
                      className="w-full bg-transparent border-none p-0 body text-foreground font-medium focus:ring-0 placeholder:text-muted-foreground/40"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-indigo-500 p-2 -mr-2 active:opacity-60 transition-opacity"
                    >
                      {showPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleVerifyPassword}
                  disabled={isLoading || !password}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 transition-transform ios-spring"
                >
                  {isLoading ? "Verifying..." : "Continue"}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center space-y-12"
              >
                <div className="text-center space-y-1">
                  <h2 className="large-title tracking-tight text-foreground">New PIN</h2>
                  <p className="caption-1 text-muted-foreground">Set a new 4-digit transaction PIN.</p>
                </div>

                <div className="flex justify-center gap-6 mt-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={cn("w-3.5 h-3.5 rounded-full border transition-all duration-200 ios-spring", newPin.length >= i ? 'bg-indigo-500 border-indigo-500 scale-110' : 'border-border bg-transparent')} 
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-x-12 gap-y-6 max-w-xs mx-auto mt-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button 
                      key={num}
                      onClick={() => handlePinPress(num.toString())}
                      className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center title-1 font-bold text-foreground active:bg-black/10 dark:active:bg-white/20 transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <div className="w-20 h-20" />
                  <button 
                    onClick={() => handlePinPress('0')}
                    className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center title-1 font-bold text-foreground active:bg-black/10 dark:active:bg-white/20 transition-colors"
                  >
                    0
                  </button>
                  <button 
                    onClick={() => { hapticFeedback('light'); setNewPin(newPin.slice(0, -1)); }}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-muted-foreground active:bg-black/5 dark:active:bg-white/5 transition-colors"
                  >
                    <Delete size={28} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8 pt-20"
              >
                <div className="w-[84px] h-[84px] bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="title-2 font-semibold tracking-tight text-foreground">PIN Updated</h2>
                  <p className="subheadline text-muted-foreground px-8">Your transaction PIN has been changed successfully. Use it for your next transaction.</p>
                </div>
                <div className="w-full pt-8">
                  <button
                    onClick={onBack}
                    className="w-full bg-card border border-border text-foreground py-3.5 rounded-full headline active:scale-95 transition-transform ios-spring"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChangePinScreen;