"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { hapticFeedback, cn } from '../../lib/utils';

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
}

export default function ActionDrawer({ isOpen, onClose, children, title, fullScreen }: ActionDrawerProps) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // iOS Spring logic
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => { hapticFeedback('light'); onClose(); }}
            className="fixed inset-0 z-[100] bg-black/40"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300, mass: 0.8 }}
            className={cn(
              "fixed bottom-0 inset-x-0 z-[101] flex flex-col overflow-hidden bg-white/40 dark:bg-black/50 backdrop-blur-3xl border-t border-x border-white/40 dark:border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.15)]",
              fullScreen ? "h-[100dvh]" : "max-h-[92dvh] rounded-t-[32px] p-2"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* iOS Grabber Handle */}
            {!fullScreen && (
              <div className="w-full flex justify-center pt-[10px] pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-[40px] h-[4px] bg-muted-foreground/30 rounded-full" />
              </div>
            )}

            {/* Optional Header */}
            {title && (
              <div className="px-5 py-2 flex justify-between items-center">
                <h3 className="headline">{title}</h3>
                <button 
                  onClick={() => { hapticFeedback('light'); onClose(); }}
                  className="w-[30px] h-[30px] bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative w-full h-full bg-background/50">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}