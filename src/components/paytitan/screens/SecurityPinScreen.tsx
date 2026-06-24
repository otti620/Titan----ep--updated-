"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Delete, AlertCircle } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

interface SecurityPinScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const SecurityPinScreen = ({ onComplete, onBack }: SecurityPinScreenProps) => {
  const { validatePin } = usePayTitan();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handlePress = async (num: string) => {
    if (pin.length < 4 && !isValidating) {
      hapticFeedback('light');
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        setIsValidating(true);
        const result = await validatePin(newPin);
        
        if (result.success) {
          hapticFeedback('success');
          onComplete(); // Fire immediately, no wait!
        } else {
          hapticFeedback('error');
          setError(true);
          setErrorMessage(result.message || "Incorrect Transaction PIN.");
          setIsValidating(false);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (isValidating) return;
    hapticFeedback('light');
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="h-full w-full bg-background flex flex-col pt-16 pb-8 px-6">
      <div className="flex justify-center mb-8">
        <div className={cn("w-16 h-16 rounded-[20px] flex items-center justify-center shadow-sm transition-colors", error ? "bg-red-500" : "bg-indigo-50 dark:bg-indigo-500/10")}>
          {error ? <AlertCircle className="text-white" size={32} /> : <Shield className="text-indigo-500" size={32} />}
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="large-title text-foreground mb-2">Authorize Pay</h2>
        <p className={cn("subheadline", error ? "text-red-500 font-bold" : "text-muted-foreground")}>
          {error ? errorMessage : 'Enter your 4-digit transaction PIN.'}
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-auto">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i} 
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ type: 'tween', duration: 0.5 }}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              pin.length >= i ? "bg-indigo-500 border-indigo-500 scale-110" : "border-border bg-transparent"
            )} 
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-y-6 gap-x-8 max-w-[280px] mx-auto w-full mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num}
            onClick={() => handlePress(num.toString())}
            disabled={isValidating}
            className="h-16 rounded-full flex items-center justify-center title-1 font-bold text-foreground active:bg-black/5 dark:active:bg-white/10 transition-colors"
          >
            {num}
          </button>
        ))}
        <div /> {/* Empty space for alignment */}
        <button 
          onClick={() => handlePress('0')}
          disabled={isValidating}
          className="h-16 rounded-full flex items-center justify-center title-1 font-bold text-foreground active:bg-black/5 dark:active:bg-white/10 transition-colors"
        >
          0
        </button>
        <button 
          onClick={handleDelete}
          disabled={isValidating}
          className="h-16 rounded-full flex items-center justify-center text-muted-foreground active:text-foreground active:bg-black/5 dark:active:bg-white/10 transition-colors"
        >
          <Delete size={28} />
        </button>
      </div>

      <button 
        onClick={onBack}
        disabled={isValidating}
        className="mt-auto text-muted-foreground font-bold text-sm uppercase tracking-widest active:opacity-60"
      >
        Cancel Transaction
      </button>
    </div>
  );
};

export default SecurityPinScreen;