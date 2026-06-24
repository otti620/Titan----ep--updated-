"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Bell, Fingerprint, Sparkles, X } from 'lucide-react';

interface BrandingShieldProps {
  isOpen: boolean;
  type: 'notifications' | 'biometrics';
  onConfirm: () => void;
  onClose: () => void;
}

export default function SystemBrandedShield({ isOpen, type, onConfirm, onClose }: BrandingShieldProps) {
  const content = {
    notifications: {
      title: "Activate PayTitan Alerts",
      description: "Receive instant updates for transfers, vaults, and account security directly from the PayTitan system.",
      icon: <Bell className="text-indigo-500" size={32} />,
      cta: "Enable Security Alerts",
      shield_msg: "PayTitan Core System"
    },
    biometrics: {
      title: "Establish Identity Link",
      description: "Verify your identity using your device's secure hardware. This links PayTitan directly to your local biometric module.",
      icon: <Fingerprint className="text-indigo-500" size={32} />,
      cta: "Connect PayTitan Shield",
      shield_msg: "PayTitan Shield Layer 7"
    }
  };

  const data = content[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#1A2130] rounded-[40px] p-8 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -mr-16 -mt-16" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-[32px] flex items-center justify-center border border-indigo-500/20 shadow-inner">
                {data.icon}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles size={12} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">{data.shield_msg}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{data.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-[240px] mx-auto">
                  {data.description}
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button
                  onClick={onConfirm}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                >
                  {data.cta}
                </button>
                <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  <ShieldCheck size={10} />
                  PayTitan Secure Systems
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
