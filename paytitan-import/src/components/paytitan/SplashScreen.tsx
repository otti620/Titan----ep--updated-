"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PayTitanLogo from './PayTitanLogo';
import { cn } from '../../lib/utils';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [typedText, setTypedText] = useState('');
  const fullText = "PayTitan";

  useEffect(() => {
    let currentText = '';
    let index = 0;
    
    // Start typing after a short delay
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText.charAt(index);
          setTypedText(currentText);
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 100); // Faster typing speed
    }, 400);

    return () => {
      clearTimeout(startDelay);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-background flex flex-col items-center justify-center overflow-hidden text-foreground">
      {/* Dynamic Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="absolute top-[30%] -left-10 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" 
      />
      
      <div className="flex flex-col items-center z-10 w-full max-w-sm">
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.8 }}
          className="relative mb-8"
        >
          <div className="w-28 h-28 rounded-[38px] bg-card border border-border flex items-center justify-center shadow-2xl relative overflow-hidden">
             {/* Shimmer effect inside logo */}
             <motion.div 
               animate={{ x: ['-100%', '200%'] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
               className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
             />
             <PayTitanLogo size={60} className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)] z-10" />
          </div>
          
          {/* Ripples */}
          <motion.div 
             animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
             className="absolute inset-0 rounded-[38px] border border-indigo-500/30 -z-10"
          />
        </motion.div>

        {/* Typing Text container */}
        <div className="h-14 flex items-center justify-center mb-10 text-center">
           <h1 className="title-1 font-black tracking-tight text-foreground flex items-center gap-1">
             {typedText}
             <motion.span 
               animate={{ opacity: [1, 0] }}
               transition={{ duration: 0.5, repeat: Infinity }}
               className="w-1.5 h-8 bg-indigo-500 rounded-full inline-block"
             />
           </h1>
        </div>

        {/* Loading Bar */}
        <div className="w-56 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: [0.45, 0.05, 0.55, 0.95] }}
            onAnimationComplete={onComplete}
          />
        </div>
        
        <p className="caption-2 text-muted-foreground/90 mt-8 text-center max-w-[300px] leading-relaxed">
          Our partner banks are licensed by the CBN and deposits insured by the NDIC
        </p>

        <p className="text-[10px] text-muted-foreground/50 mt-4 text-center max-w-[280px] leading-normal font-sans tracking-wide">
          PayTitan is not a bank but a payment processor powered by regulated banks with deposits fully insured by NDIC
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;