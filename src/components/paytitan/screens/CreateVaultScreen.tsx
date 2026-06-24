"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wallet, Calendar, ShieldCheck, Smartphone, Heart, Umbrella } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan } from '../../../context/PayTitanContext';
import { cn, hapticFeedback } from '../../../lib/utils';

const CreateVaultScreen = ({ onBack }: { onBack: () => void }) => {
  const { createVault } = usePayTitan();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [targetDate, setTargetDate] = useState('2024-12-31');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const handleCreate = async () => {
    hapticFeedback('success');
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      toast.error("Please enter a valid goal amount");
      return;
    }
    await createVault({
      title,
      category,
      goal_amount: parseFloat(goalAmount.replace(/,/g, '')),
      target_date: targetDate,
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
           <span className="headline tracking-tight">New Vault</span>
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
                  <h2 className="large-title tracking-tight text-foreground">What are we saving for?</h2>
                  <p className="subheadline text-muted-foreground">Choose a category for your new vault.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <IconButton icon={<Smartphone />} active={category === 'Electronics'} onClick={() => { hapticFeedback('light'); setCategory('Electronics'); }} />
                  <IconButton icon={<Heart />} active={category === 'Life Event'} onClick={() => { hapticFeedback('light'); setCategory('Life Event'); }} />
                  <IconButton icon={<Umbrella />} active={category === 'Emergency'} onClick={() => { hapticFeedback('light'); setCategory('Emergency'); }} />
                </div>

                <div className="ios-list-group px-4 py-1">
                  <input 
                    type="text" 
                    placeholder="Vault Name (e.g. New Laptop)" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none py-4 outline-none body text-foreground placeholder:text-muted-foreground/50 transition-colors"
                  />
                </div>

                <button
                  onClick={() => {
                    hapticFeedback('medium');
                    if (!title) return toast.error("Please name your vault");
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
                  <h2 className="large-title tracking-tight text-foreground">Set your Target.</h2>
                  <p className="subheadline text-muted-foreground">How much do you need to reach this goal?</p>
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

                  <div className="px-4 py-3 pb-4">
                    <p className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mb-2 pt-1">TARGET DATE</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Calendar size={18} strokeWidth={2} />
                      </div>
                      <input 
                        type="date" 
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="bg-transparent border-none body font-semibold text-foreground focus:ring-0 w-full outline-none"
                      />
                    </div>
                  </div>
                </div>

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
                  <h2 className="large-title tracking-tight text-foreground">Automation.</h2>
                  <p className="subheadline text-muted-foreground">Let PayTitan handle the heavy lifting.</p>
                </div>

                <div className="space-y-6">
                  <div className="ios-list-group px-0">
                    <div className="flex items-center justify-between py-3 px-4">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                            <Wallet size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="body font-semibold text-foreground tracking-tight">Auto-Save</p>
                            <p className="caption-2 text-muted-foreground">Save ₦5,000 every week</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => { hapticFeedback('light'); setAutoSaveEnabled(!autoSaveEnabled); }}
                         className={cn(
                           "w-[51px] h-[31px] rounded-full relative transition-colors duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]",
                           autoSaveEnabled ? "bg-[#34C759]" : "bg-[#E9E9EB] dark:bg-[#39393D]"
                         )}
                       >
                         <div className={cn(
                           "absolute top-[1.5px] w-7 h-7 bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out",
                           autoSaveEnabled ? "left-[19px]" : "left-[1.5px]"
                         )} />
                       </button>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 p-5 rounded-[24px] flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                      <ShieldCheck size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="caption-1 font-semibold text-foreground">TitanShield™ Protected</p>
                      <p className="caption-2 text-muted-foreground mt-0.5 leading-relaxed">
                        Vault funds are isolated from your main wallet and earn 12% APY.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleCreate}
                    className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
                  >
                    Create Vault
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

const IconButton = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "aspect-square rounded-[24px] flex items-center justify-center transition-all ios-spring",
      active 
        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105" 
        : "bg-card text-muted-foreground border border-border hover:bg-black/5 dark:hover:bg-white/5"
    )}
  >
    {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 28, strokeWidth: active ? 2 : 1.5 })}
  </button>
);

export default CreateVaultScreen;