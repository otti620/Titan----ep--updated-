"use client";

import React, { useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { hapticFeedback } from '@/lib/utils';

export const BalanceDisplay = ({ amount, isPrivate, symbol = '₦' }: { amount: number, isPrivate: boolean, symbol?: string }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
  const totalLength = (symbol + formattedAmount).length;
  
  // Dynamic font sizing based on length
  const fontSizeClass = totalLength > 15 ? 'text-2xl' : totalLength > 12 ? 'text-3xl' : totalLength > 10 ? 'text-4xl' : 'text-5xl';

  const scale = useSpring(isPressed ? 0.95 : 1, { stiffness: 300, damping: 20 });
  const glow = isPressed ? "0 0 30px rgba(255,255,255,0.3)" : "0 0 0px rgba(255,255,255,0)";

  const handlePressStart = () => {
    if (!isPrivate) {
      setIsPressed(true);
      hapticFeedback('light');
    }
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  return (
    <motion.div 
      style={{ scale, textShadow: glow }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className="cursor-pointer select-none transition-all duration-300"
    >
      <h1 className={`font-bold text-white tracking-tighter transition-all duration-300 ${fontSizeClass} ${isPrivate ? 'blur-xl opacity-50' : ''}`}>
        {symbol}{formattedAmount}
      </h1>
    </motion.div>
  );
};