"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Users, Search, Globe, ChevronRight } from 'lucide-react';
import PayTitanLogo from './PayTitanLogo';
import { hapticFeedback, cn } from '../../lib/utils';

const slides = [
  {
    title: "Banking that moves at",
    accent: "your speed.",
    description: "Welcome to PayTitan. Send, receive, and manage your money with unparalleled speed and beautiful design.",
    illustration: (
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/10 rounded-[40px] shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", type: 'tween' }}
          className="relative w-48 h-72 bg-card rounded-[32px] shadow-sm flex flex-col overflow-hidden border border-border p-4"
        >
          {/* Mockup UI */}
          <div className="flex justify-between items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10" />
            <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <PayTitanLogo size={12} />
            </div>
          </div>
          <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Balance</p>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="subheadline font-semibold text-muted-foreground">₦</span>
            <span className="title-1 font-bold tracking-tight text-foreground">500,000</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-foreground rounded-xl h-10" />
            <div className="flex-1 bg-black/5 dark:bg-white/10 rounded-xl h-10" />
          </div>
          <div className="mt-8 space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10" />
               <div className="flex-1 space-y-1">
                 <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10" />
                 <div className="w-1/2 h-2 rounded-full bg-black/5 dark:bg-white/5" />
               </div>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10" />
               <div className="flex-1 space-y-1">
                 <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10" />
                 <div className="w-1/2 h-2 rounded-full bg-black/5 dark:bg-white/5" />
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    title: "Split bills, save in",
    accent: "Circles.",
    description: "Group wallets and social banking made simple. Never worry about who paid for what.",
    illustration: (
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10 rounded-[40px] shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]">
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", type: 'tween' }}
          className="relative w-56 bg-card rounded-[32px] shadow-sm p-6 border border-border"
        >
          <div className="flex -space-x-4 justify-center mb-6">
             {[1, 2, 3].map((i) => (
                <div key={i} className={`w-14 h-14 rounded-full border-[3px] border-card bg-black/5 overflow-hidden`}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} className="w-full h-full" alt="avatar" />
                </div>
             ))}
          </div>
          <div className="text-center space-y-1">
            <h3 className="headline tracking-tight text-foreground">Miami Trip</h3>
            <p className="caption-1 text-muted-foreground font-medium">3 Members • ₦150k target</p>
          </div>
          <div className="mt-6">
            <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
               <div className="bg-purple-500 h-full w-[60%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    title: "Bank Grade",
    accent: "Security.",
    description: "End-to-end encryption, fraud detection, and biometric locks to keep your money safe.",
    illustration: (
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 rounded-[40px] shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
        <motion.div 
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-32 h-32 flex items-center justify-center rounded-full bg-card shadow-sm border border-border"
        >
          <ShieldCheck className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="absolute bottom-8 left-1/2 -translate-x-1/2 ios-glass px-4 py-2 rounded-full border border-border shadow-sm flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="caption-2 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Fully Encrypted</span>
        </motion.div>
      </div>
    )
  }
];

export default function OnboardingScreen({ onComplete, onSignup }: { onComplete: () => void, onSignup: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    hapticFeedback('medium');
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative overflow-hidden">
      
      <div className="absolute top-0 inset-x-0 px-5 flex justify-between items-center z-20" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top, 14px))' }}>
        <div className="flex items-center gap-2">
          <PayTitanLogo size={20} className="text-indigo-500" />
          <span className="text-foreground title-3 tracking-tight">PayTitan</span>
        </div>
        <button onClick={() => { hapticFeedback('light'); onComplete(); }} className="text-muted-foreground caption-1 font-semibold uppercase tracking-widest active:opacity-60 transition-opacity p-2">SKIP</button>
      </div>

      <div className="flex-1 flex flex-col pt-24 px-5 relative z-10 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex-1 flex flex-col"
          >
            <div className="w-full aspect-[4/5] max-h-[50vh] mb-8">
              {slides[currentSlide].illustration}
            </div>

            <div className="px-2">
              <h2 className="large-title tracking-tight text-foreground leading-[1.1] mb-3">
                {slides[currentSlide].title} <span className="text-indigo-500">{slides[currentSlide].accent}</span>
              </h2>
              
              <p className="body text-muted-foreground leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto px-5 pb-8 relative z-10 w-full max-w-lg mx-auto" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 20px))' }}>
        <div className="flex gap-2 mb-8 justify-center">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentSlide ? "w-8 bg-foreground" : "w-1.5 bg-black/10 dark:bg-white/20"
              )} 
            />
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={nextSlide}
            className="w-full bg-indigo-500 text-white py-4 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring flex items-center justify-center"
          >
            {currentSlide === slides.length - 1 ? 'Start Banking' : 'Continue'}
          </button>
          
          <button 
            onClick={() => { hapticFeedback('light'); onSignup(); }}
            className="w-full bg-card text-foreground py-4 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring border border-border"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
