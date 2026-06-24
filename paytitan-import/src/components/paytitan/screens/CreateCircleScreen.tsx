"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Target, ShieldCheck, Plus, X, Calendar, Zap, Clock, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan } from '../../../context/PayTitanContext';
import { cn, hapticFeedback } from '../../../lib/utils';

const CreateCircleScreen = ({ onBack }: { onBack: () => void }) => {
  const { createCircle } = usePayTitan();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [duration, setDuration] = useState('12'); // Default 12 months/weeks/days
  const [contributionAmount, setContributionAmount] = useState(0);

  // Auto-calculate contribution whenever goal, frequency, or duration changes
  useEffect(() => {
    const goal = parseFloat(goalAmount.replace(/,/g, '')) || 0;
    const dur = parseInt(duration) || 1;
    if (goal > 0) {
      setContributionAmount(Math.ceil(goal / dur));
    } else {
      setContributionAmount(0);
    }
  }, [goalAmount, duration]);

  const handleCreate = async () => {
    hapticFeedback('success');
    if (!title) return toast.error("Please name your circle");
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      toast.error("Please enter a valid goal amount");
      return;
    }

    // Calculate expiration date based on duration and frequency
    const expiresAt = new Date();
    const dur = parseInt(duration) || 1;
    if (frequency === 'daily') expiresAt.setDate(expiresAt.getDate() + dur);
    else if (frequency === 'weekly') expiresAt.setDate(expiresAt.getDate() + (dur * 7));
    else if (frequency === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + dur);

    await createCircle({
      title,
      description: `Social wallet for ${title}`,
      goal_amount: parseFloat(goalAmount.replace(/,/g, '')),
      expires_at: expiresAt.toISOString(),
      auto_deduct_amount: contributionAmount,
      auto_deduct_frequency: frequency
    });
    onBack();
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      {/* Header */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center bg-background/80 backdrop-blur-xl z-30 ios-hairline-bottom">
        <button 
          onClick={() => { 
            hapticFeedback('light'); 
            if (step === 1) {
              onBack();
            } else {
              setStep(step - 1);
            }
          }} 
          className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity"
        >
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
           <span className="headline tracking-tight">New Circle</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-5 pt-6 pb-6 space-y-8">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-8 bg-indigo-500" : "w-4 bg-indigo-500/20"
                )} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 pt-4"
              >
                <div className="space-y-2">
                  <h2 className="large-title tracking-tight text-foreground">Name your Circle.</h2>
                  <p className="subheadline text-muted-foreground">Give your group a unique identity.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[28px] flex items-center justify-center text-indigo-500 shadow-sm border border-border">
                      <Users size={40} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="ios-list-group px-4 py-1">
                    <input 
                      type="text" 
                      placeholder="e.g. Bali Trip 2026" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-transparent border-none py-4 outline-none body text-foreground placeholder:text-muted-foreground/50 transition-colors text-center font-bold text-xl"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    hapticFeedback('medium');
                    if (!title) return toast.error("Please name your circle");
                    setStep(2);
                  }}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring mt-4"
                >
                  Next Step
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 pt-4"
              >
                <div className="space-y-2">
                  <h2 className="large-title tracking-tight text-foreground">Set the Goal.</h2>
                  <p className="subheadline text-muted-foreground">Define the target and frequency.</p>
                </div>

                <div className="ios-list-group space-y-0 relative">
                  <div className="px-4 py-3 ios-hairline-bottom">
                    <p className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 pt-1">TARGET AMOUNT</p>
                    <div className="flex items-center gap-2">
                      <span className="title-2 font-bold text-indigo-500">₦</span>
                      <input 
                        type="number" 
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        placeholder="0.00"
                        className="title-1 font-bold text-foreground border-none p-0 focus:ring-0 w-full bg-transparent outline-none placeholder:text-muted-foreground/30" 
                      />
                    </div>
                  </div>

                  <div className="px-4 py-4 ios-hairline-bottom">
                    <p className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mb-3 pt-1">FREQUENCY</p>
                    <div className="bg-black/5 dark:bg-white/10 p-1 rounded-md flex gap-1">
                      {['daily', 'weekly', 'monthly'].map((f) => (
                        <button
                          key={f}
                          onClick={() => { hapticFeedback('light'); setFrequency(f); }}
                          className={cn(
                            "flex-1 py-[6px] rounded-sm subheadline font-semibold transition-all ios-spring capitalize",
                            frequency === f 
                              ? "bg-card text-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-3 pb-4">
                    <p className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mb-2 pt-1">DURATION ({frequency === 'daily' ? 'DAYS' : frequency === 'weekly' ? 'WEEKS' : 'MONTHS'})</p>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-transparent border-none body font-semibold text-foreground focus:ring-0 outline-none"
                      placeholder="e.g. 12"
                    />
                  </div>
                </div>

                {contributionAmount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-500/10 p-5 rounded-[24px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                        <Calculator size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">EST. CONTRIBUTION</p>
                        <p className="headline text-foreground tracking-tight">₦{contributionAmount.toLocaleString()} <span className="caption-1 text-muted-foreground font-medium">/ {frequency}</span></p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={() => { hapticFeedback('medium'); setStep(3); }}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring mt-4"
                >
                  Next Step
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 pt-4"
              >
                <div className="space-y-2">
                  <h2 className="large-title tracking-tight text-foreground">Final Review.</h2>
                  <p className="subheadline text-muted-foreground">Confirm your architectural commitment.</p>
                </div>

                <div className="ios-list-group px-0 space-y-0">
                  <div className="flex justify-between items-center py-3.5 px-4 ios-hairline-bottom">
                    <span className="body text-foreground">Circle Name</span>
                    <span className="body font-semibold text-muted-foreground">{title}</span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 px-4 ios-hairline-bottom">
                    <span className="body text-foreground">Target Goal</span>
                    <span className="body font-semibold text-muted-foreground">₦{parseFloat(goalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 px-4 ios-hairline-bottom">
                    <span className="body text-foreground">Contribution</span>
                    <span className="body font-bold text-indigo-500">₦{contributionAmount.toLocaleString()} / {frequency}</span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 px-4">
                    <span className="body text-foreground">Duration</span>
                    <span className="body font-semibold text-muted-foreground">{duration} {frequency === 'daily' ? 'Days' : frequency === 'weekly' ? 'Weeks' : 'Months'}</span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 p-5 rounded-[24px] flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                    <ShieldCheck size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="caption-1 font-semibold text-foreground">Titan Guard™ Active</p>
                    <p className="caption-2 text-muted-foreground mt-0.5 leading-relaxed">
                      Withdrawals require multi-sig approval. Contributions are automated for your convenience.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleCreate}
                    className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
                  >
                    Create Circle
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

export default CreateCircleScreen;