"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint, Delete } from 'lucide-react';
import { usePayTitan } from '../../context/PayTitanContext';
import { promptBiometric } from '../../lib/biometrics';
import { hapticFeedback } from '../../lib/utils';
import { supabase } from '../../integrations/supabase/client';

export default function AppLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { profile, setPin } = usePayTitan();
  const [pin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [showBiometricBtn, setShowBiometricBtn] = useState(false);
  
  const [biometricPending, setBiometricPending] = useState(false);
  
  const targetPin = profile?.pin || '1234'; // fallback if not set

  useEffect(() => {
    // Check if biometric is supported
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      if (navigator.credentials) {
        setShowBiometricBtn(true);
      }
    }
  }, []);

  const handleBiometric = async () => {
    setBiometricPending(false);
    hapticFeedback('medium');
    const success = await promptBiometric();
    if (success) {
      hapticFeedback('success');
      onUnlock();
    }
  };

  const handleKeyPress = (num: number) => {
    hapticFeedback('light');
    if (pin.length < 4) {
      const newPin = pin + num;
      setEnteredPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    hapticFeedback('light');
    setEnteredPin((p) => p.slice(0, -1));
    setError(false);
  };

  const handleLogout = async () => {
    hapticFeedback('medium');
    await supabase.auth.signOut();
    window.location.reload();
  };

  const verifyPin = (currentPin: string) => {
    if (currentPin === targetPin) {
      hapticFeedback('success');
      onUnlock();
    } else {
      hapticFeedback('error');
      setError(true);
      setTimeout(() => {
        setEnteredPin('');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-[#0A0C10] flex flex-col justify-between overflow-hidden z-50 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/50 to-black/80 pointer-events-none" />
      
      {/* Biometric Link Branded Overlay */}
      <AnimatePresence>
        {biometricPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A0C10]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-24 h-24 bg-indigo-500/20 rounded-[40px] flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
            >
              <Fingerprint size={48} className="text-indigo-400" strokeWidth={1.5} />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Check</h3>
            <p className="text-sm text-gray-400 max-w-[240px] leading-relaxed">
              Verifying your identity via secure biometric link...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        <motion.div
           initial={{ opacity: 0, scale: 0.8, y: -20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ type: "spring", damping: 20 }}
           className="w-20 h-20 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[30px] flex items-center justify-center mb-10 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-indigo-500/10 rounded-[30px] animate-pulse" />
          <ShieldCheck size={40} className="text-indigo-400 relative z-10" strokeWidth={1.5} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-white/40 text-lg font-medium">
            @{profile?.username || 'user'}
          </p>
        </motion.div>

        {/* PIN Dots */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center items-center gap-6 mt-12 mb-2 h-10"
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4, type: 'tween' }}
              className={`w-[14px] h-[14px] rounded-full transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] scale-110' 
                  : 'bg-white/10'
              } ${error ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : ''}`}
            />
          ))}
        </motion.div>
        <div className="h-6 mt-2">
          {error && <p className="text-red-400 text-sm font-medium animate-pulse text-center">Incorrect PIN</p>}
        </div>
      </div>

      {/* Numpad Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-[320px] mx-auto pb-12 relative z-10"
      >
        <div className="grid grid-cols-3 gap-y-6 gap-x-6 w-full px-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-[72px] h-[72px] mx-auto rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 flex flex-col items-center justify-center transition-all border border-white/[0.02] backdrop-blur-md"
            >
              <span className="text-3xl font-light text-white tracking-widest">{num}</span>
            </button>
          ))}
          
          <button
            onClick={showBiometricBtn ? handleBiometric : () => {}}
            className="w-[72px] h-[72px] mx-auto rounded-full flex flex-col items-center justify-center text-white/40 hover:text-white/80 active:bg-white/10 transition-colors active:scale-95"
          >
            {showBiometricBtn && <Fingerprint size={32} strokeWidth={1.5} />}
          </button>
          
          <button
            onClick={() => handleKeyPress(0)}
            className="w-[72px] h-[72px] mx-auto rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 flex flex-col items-center justify-center transition-all border border-white/[0.02] backdrop-blur-md"
          >
            <span className="text-3xl font-light text-white tracking-widest">0</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="w-[72px] h-[72px] mx-auto rounded-full flex flex-col items-center justify-center text-white/40 hover:text-white/80 active:bg-white/10 transition-colors active:scale-95"
          >
            {pin.length > 0 && <Delete size={28} strokeWidth={1.5} />}
          </button>
        </div>

        <div className="mt-12 text-center">
            <button 
                onClick={handleLogout}
                className="text-white/30 hover:text-white/60 focus:outline-none text-[13px] font-medium tracking-wide active:opacity-50 transition-colors"
            >
                Sign In Different Account
            </button>
        </div>
      </motion.div>
    </div>
  );
}
