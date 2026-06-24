"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Tv, ArrowRight, CheckCircle2, ShieldCheck, ChevronRight, Search, Loader2 } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback } from '../../../lib/utils';
import SecurityPinScreen from './SecurityPinScreen';
import SuccessScreen from './SuccessScreen';

const PROVIDERS = [
  { id: 'dstv', name: 'DSTV', color: 'bg-blue-600' },
  { id: 'gotv', name: 'GOTV', color: 'bg-red-600' },
  { id: 'startimes', name: 'StarTimes', color: 'bg-orange-500' },
];

const PACKAGES: Record<string, any[]> = {
  dstv: [
    { id: 'p1', name: 'Premium', price: 29500 },
    { id: 'p2', name: 'Compact Plus', price: 19800 },
    { id: 'p3', name: 'Compact', price: 12500 },
    { id: 'p4', name: 'Confam', price: 7400 },
  ],
  gotv: [
    { id: 'g1', name: 'Supa Plus', price: 12500 },
    { id: 'g2', name: 'Supa', price: 7600 },
    { id: 'g3', name: 'Max', price: 5700 },
    { id: 'g4', name: 'Jolli', price: 39500 },
  ],
  startimes: [
    { id: 's1', name: 'Super', price: 6500 },
    { id: 's2', name: 'Classic', price: 4500 },
    { id: 's3', name: 'Basic', price: 2600 },
  ]
};

const CableTVScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshData } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Provider, 2: Smartcard, 3: Package, 4: Review, 5: PIN, 6: Success
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [smartcard, setSmartcard] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const handleVerify = () => {
    if (smartcard.length < 10) return toast.error("Enter a valid smartcard number");
    setIsVerifying(true);
    setTimeout(() => {
      setCustomerName("CHUKWUMA EZE");
      setIsVerifying(false);
      setStep(3);
      hapticFeedback('success');
    }, 1500);
  };

  const handleProcessPayment = async () => {
    toast.loading("Processing cable subscription via secure bill payment API...", { id: "cable-p" });

    try {
      const res = await fetch('/api/payments/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id,
          amount: selectedPackage.price,
          billerCode: `CABLE_${provider.id.toUpperCase()}_${selectedPackage.name.toUpperCase()}`,
          customerId: smartcard,
          category: 'Cable TV',
          provider: 'payscribe' // Use default payscribe core biller engine
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Subscription paid successfully!", { id: "cable-p" });
        await refreshData();
        setStep(6);
      } else {
        toast.error(resData.message || "Biller transaction declined.", { id: "cable-p" });
        setStep(4);
      }
    } catch (err: any) {
      toast.error("Network gateway connection failed. Please retry.", { id: "cable-p" });
      setStep(4);
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      {step < 5 && (
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
            <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
          </button>
          <span className="text-xl font-bold text-[#1A2130] dark:text-white">Cable TV</span>
          <div className="w-10 h-10" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-8 space-y-6 pt-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Select Provider.</h2>
                <p className="text-sm text-gray-400">Choose your cable television service.</p>
              </div>
              <div className="space-y-3">
                {PROVIDERS.map((p) => (
                  <button key={p.id} onClick={() => { hapticFeedback('light'); setProvider(p); setStep(2); }} className="w-full bg-white dark:bg-[#1A2130] p-5 rounded-[32px] flex items-center justify-between shadow-sm border border-gray-50 dark:border-white/5 active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${p.color} rounded-2xl flex items-center justify-center text-white`}>
                        <Tv size={20} />
                      </div>
                      <span className="text-sm font-bold text-[#1A2130] dark:text-white">{p.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-200" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-8 space-y-8 pt-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Smartcard Number.</h2>
                <p className="text-sm text-gray-400">Enter the ID for your {provider.name} decoder.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4">Smartcard / IUC Number</label>
                <input type="tel" placeholder="e.g. 1023456789" value={smartcard} onChange={(e) => setSmartcard(e.target.value.replace(/\D/g, ''))} className="w-full bg-white dark:bg-[#1A2130] border-none rounded-[24px] py-5 px-8 text-xl font-bold text-[#1A2130] dark:text-white shadow-sm focus:ring-2 focus:ring-[#FF4D1C]" />
              </div>
              <button onClick={handleVerify} disabled={isVerifying || smartcard.length < 10} className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D1C]/20 disabled:opacity-50">
                {isVerifying ? <Loader2 className="animate-spin" /> : "Verify Account"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-8 space-y-6 pt-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Choose Package.</h2>
                <p className="text-sm text-gray-400">Select a plan for {customerName}.</p>
              </div>
              <div className="space-y-3">
                {PACKAGES[provider.id].map((pkg) => (
                  <button key={pkg.id} onClick={() => { hapticFeedback('light'); setSelectedPackage(pkg); setStep(4); }} className="w-full bg-white dark:bg-[#1A2130] p-5 rounded-[32px] flex items-center justify-between shadow-sm border border-gray-50 dark:border-white/5 active:scale-[0.98] transition-all">
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-[#1A2130] dark:text-white">{pkg.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Monthly Subscription</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1A2130] dark:text-white">₦{pkg.price.toLocaleString()}</p>
                      <ChevronRight className="w-4 h-4 text-gray-200 ml-auto mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-8 space-y-8 pt-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Review.</h2>
                <p className="text-sm text-gray-400">Confirm your subscription details.</p>
              </div>
              <div className="bg-white dark:bg-[#1A2130] rounded-[40px] p-8 shadow-sm border border-gray-50 dark:border-white/5 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-gray-50 dark:border-white/5">
                  <div className={`w-16 h-16 rounded-2xl ${provider.color} flex items-center justify-center shadow-lg text-white`}>
                    <Tv size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A2130] dark:text-white">{customerName}</h3>
                    <p className="text-sm text-gray-400">{provider.name} • {smartcard}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Package</span>
                    <span className="text-sm font-bold text-[#1A2130] dark:text-white">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Amount</span>
                    <span className="text-lg font-bold text-[#1A2130] dark:text-white">₦{selectedPackage.price.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-[#1A2130] dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-[#FF4D1C]">₦{selectedPackage.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(5)} className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20">
                Pay Now
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              <SecurityPinScreen onComplete={handleProcessPayment} onBack={() => setStep(4)} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
              <SuccessScreen title="Subscription Active!" subtitle={`Your ${provider.name} ${selectedPackage.name} plan is now active.`} amount={selectedPackage.price.toLocaleString()} recipient={smartcard} onClose={onBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CableTVScreen;