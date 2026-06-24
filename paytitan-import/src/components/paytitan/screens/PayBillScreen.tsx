"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Smartphone, Zap, Tv, Globe, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cleanNumericalInput } from '../../../lib/utils';

const PayBillScreen = ({ category, onBack, onConfirm }: { category: string, onBack: () => void, onConfirm: (amount: string, provider: string) => void }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('MTN Nigeria');

  const handleNext = () => {
    if (step === 1) {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      setStep(2);
    } else onConfirm(amount, provider);
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
          <ArrowLeft className="w-5 h-5 text-[#1A2130]" />
        </button>
        <span className="text-xl font-bold text-[#1A2130]">Pay {category}</span>
        <div className="w-10 h-10" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-8 space-y-8 overflow-y-auto pb-8"
          >
            <div className="space-y-1">
              <h2 className="text-4xl font-bold text-[#1A2130]">Utility Pay.</h2>
              <p className="text-sm text-[#1A2130]/60">Instant settlement for your essential services.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SELECT PROVIDER</h3>
              <div className="grid grid-cols-2 gap-4">
                {['MTN Nigeria', 'Airtel', 'Glo', '9mobile'].map((p) => (
                  <button 
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`p-6 rounded-[32px] border transition-all text-left space-y-2 ${provider === p ? 'bg-white border-[#FF4D1C] shadow-md' : 'bg-white/50 border-gray-50'}`}
                  >
                    <div className="w-10 h-10 bg-[#F8F9FC] rounded-2xl flex items-center justify-center">
                      <Smartphone className={provider === p ? 'text-[#FF4D1C]' : 'text-gray-300'} />
                    </div>
                    <p className="text-xs font-bold text-[#1A2130]">{p}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 flex flex-col items-center space-y-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AMOUNT TO PAY</p>
              <div className="flex items-start gap-1">
                <span className="text-[#FF4D1C] font-bold text-2xl mt-2">₦</span>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(cleanNumericalInput(e.target.value))}
                  placeholder="0.00"
                  className="text-5xl font-bold text-[#1A2130] w-full text-center border-none focus:ring-0 p-0"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,77,28,0.3)]"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-8 space-y-8 overflow-y-auto pb-8"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-[#F8F9FC] rounded-[32px] flex items-center justify-center text-[#FF4D1C]">
                  <Smartphone size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1A2130]">{provider}</h3>
                  <p className="text-[#FF4D1C] font-bold text-sm">{category}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Amount</span>
                  <span className="text-lg font-bold text-[#1A2130]">₦{amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Service Fee</span>
                  <span className="text-xs font-bold text-green-500">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-sm font-bold text-[#1A2130]">Total to Pay</span>
                  <span className="text-2xl font-bold text-[#FF4D1C]">₦{amount}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A2130] p-6 rounded-[40px] flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">TitanShield™ Active</p>
                <p className="text-white/40 text-[10px] leading-relaxed">
                  Utility payments are processed through encrypted gateways with instant receipt generation.
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20"
            >
              Confirm Payment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayBillScreen;