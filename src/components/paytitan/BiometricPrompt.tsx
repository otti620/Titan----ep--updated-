"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ScanFace } from 'lucide-react';
import { hapticFeedback } from '../../lib/utils';
import { promptBiometric } from '../../lib/biometrics';

interface BiometricPromptProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  fallbackToPin?: boolean;
}

const BiometricPrompt = ({ isOpen, onSuccess, onCancel, title = "Confirm Identity", fallbackToPin = true }: BiometricPromptProps) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check support on mount
    if (typeof window !== 'undefined') {
      const isMedian = typeof window !== 'undefined' && 
                       (navigator.userAgent.includes('gonative') || navigator.userAgent.includes('median'));
                       
      // If we are in Median webview (and not using the paid Median native biometrics plugin),
      // WebAuthn generally hangs or throws. We skip to PIN instantly. 
      // (If they configure Median specifically for WebAuthn later, they can remove this)
      if (!window.PublicKeyCredential || isMedian) {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (!isSupported && fallbackToPin) {
        // If not supported or inside Median webview lacking native plugin bridge, just move onto PIN.
        onSuccess();
        return;
      }

      setStatus('scanning');
      hapticFeedback('medium');
      
      let isMounted = true;

      const triggerAuth = async () => {
        // give breathing room before native prompt
        await new Promise(r => setTimeout(r, 400));
        
        try {
          const authPromise = promptBiometric();
          // Add a 10s timeout to auto fallback if the OS prompt hangs unnoticed
          const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10000));
          
          const success = await Promise.race([authPromise, timeoutPromise]);
          
          if (!isMounted) return;

          if (success) {
            setStatus('success');
            hapticFeedback('success');
            setTimeout(() => {
              if (isMounted) onSuccess();
            }, 800);
          } else {
            // If biometric failed or user cancelled or timed out
            if (fallbackToPin) {
               onSuccess(); // We will drop into PIN screen if it fails but fallback is true
            } else {
               onCancel();
            }
          }
        } catch (e) {
          if (!isMounted) return;
          if (fallbackToPin) onSuccess(); else onCancel();
        }
      };

      triggerAuth();

      return () => { isMounted = false; };
    } else {
      setStatus('idle');
    }
  }, [isOpen, onSuccess, onCancel, isSupported, fallbackToPin]);

  if (!isSupported) {
    return null; // Skip rendering the UI if returning instantly to PIN
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-xs bg-card rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl border border-border"
          >
            <div className="relative mb-8 mt-4">
              <motion.div 
                animate={status === 'scanning' ? { 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, type: 'tween' }}
                className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center"
              >
                {status === 'success' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <ShieldCheck className="w-12 h-12 text-green-500" />
                  </motion.div>
                ) : (
                  <ScanFace className="w-12 h-12 text-indigo-500" />
                )}
              </motion.div>
              
              {status === 'scanning' && (
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", type: 'tween' }}
                  className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              )}
            </div>

            <h3 className="title-3 font-semibold tracking-tight text-foreground mb-2">{title}</h3>
            <p className="caption-1 text-muted-foreground mb-8">
              {status === 'scanning' ? 'Authenticating with Face ID...' : 'Identity Verified'}
            </p>

            <button 
              onClick={() => {
                hapticFeedback('light');
                if (fallbackToPin) {
                  onSuccess(); // Triggers the PIN fallback explicitly
                } else {
                  onCancel();
                }
              }}
              className="text-sm font-bold text-muted-foreground uppercase tracking-widest active:text-foreground transition-colors"
            >
              {fallbackToPin ? "USE PIN INSTEAD" : "CANCEL"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiometricPrompt;