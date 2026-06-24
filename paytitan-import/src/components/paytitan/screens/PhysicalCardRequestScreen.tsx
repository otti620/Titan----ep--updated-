"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Truck, ShieldCheck, CheckCircle2, ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { hapticFeedback } from '../../../lib/utils';
import SuccessScreen from './SuccessScreen';

const PhysicalCardRequestScreen = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Success
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRequest = () => {
    if (!address || !city) return toast.error("Please enter your delivery details");
    setStep(2);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    hapticFeedback('heavy');
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Titan Metal</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="px-8 space-y-8 pt-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Delivery.</h2>
                <p className="text-sm text-gray-400">Where should we send your Titan Black card?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4">Street Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white dark:bg-[#1A2130] border-none rounded-[24px] py-5 px-8 text-sm font-bold text-[#1A2130] dark:text-white shadow-sm focus:ring-2 focus:ring-[#FF4D1C]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4">City / State</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lagos" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white dark:bg-[#1A2130] border-none rounded-[24px] py-5 px-8 text-sm font-bold text-[#1A2130] dark:text-white shadow-sm focus:ring-2 focus:ring-[#FF4D1C]"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-[40px] flex items-center gap-4 border border-blue-100 dark:border-blue-500/20">
                <Truck className="text-blue-600" size={24} />
                <p className="text-[10px] text-blue-800 dark:text-blue-400 leading-relaxed">
                  Delivery is free for Titan Pro members. Standard delivery time is 3-5 business days.
                </p>
              </div>

              <button
                onClick={handleRequest}
                className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20"
              >
                Review Order <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-8 space-y-8 pt-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Confirm.</h2>
                <p className="text-sm text-gray-400">Review your physical card order.</p>
              </div>

              <div className="bg-white dark:bg-[#1A2130] rounded-[40px] p-8 shadow-sm border border-gray-50 dark:border-white/5 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-gray-50 dark:border-white/5">
                  <div className="w-20 h-12 bg-[#1A2130] rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="text-white/20" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A2130] dark:text-white">Titan Black Edition</h3>
                    <p className="text-sm text-gray-400">Premium Metal Card</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Delivery To</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1A2130] dark:text-white">{address}</p>
                      <p className="text-xs text-gray-400">{city}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Issuance Fee</span>
                    <span className="text-sm font-bold text-green-500">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-[#1A2130] dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-[#FF4D1C]">₦0.00</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full bg-[#1A2130] text-white py-5 rounded-[32px] font-bold text-lg shadow-xl disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm Order"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
              <SuccessScreen 
                title="Order Placed!" 
                subtitle="Your Titan Metal card is being architected and will be delivered soon." 
                amount="0.00" 
                recipient={city} 
                onClose={onBack} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhysicalCardRequestScreen;