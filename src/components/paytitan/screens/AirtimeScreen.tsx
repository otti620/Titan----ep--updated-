"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Smartphone, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import SuccessScreen from './SuccessScreen';
import SecurityPinScreen from './SecurityPinScreen';

export default function AirtimeScreen({ onBack }: { onBack: () => void }) {
  const { balance, settings, profile, refreshData } = usePayTitan();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Navigation bar large title collapse state
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-70px 0px 0px 0px" }
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const networks = [
    { id: 'mtn', name: 'MTN', logo: '/assets/networks/mtn.jpg', pattern: /^(0803|0806|0810|0813|0814|0816|0703|0706|0903|0906|0913|0916)\d{7}$/, expiredPrefixes: ['0903', '0913'] },
    { id: 'airtel', name: 'Airtel', logo: '/assets/networks/airtel.jpg', pattern: /^(0802|0808|0812|0701|0708|0902|0907|0901|0912)\d{7}$/, expiredPrefixes: ['0912'] },
    { id: 'glo', name: 'Glo', logo: '/assets/networks/glo.jpg', pattern: /^(0805|0807|0811|0705|0905|0915)\d{7}$/, expiredPrefixes: [] },
    { id: '9mobile', name: '9mobile', logo: '/assets/networks/9mobile.jpg', pattern: /^(0809|0817|0818|0908|0909)\d{7}$/, expiredPrefixes: ['0809'] },
  ];

  const handlePhoneChange = (val: string) => {
    const numericPhone = val.replace(/\D/g, '');
    setPhone(numericPhone);

    if (numericPhone.length >= 4) {
      // Find matching network based on the first 4 characters, excluding expired prefixes
      const matching = networks.find(n => {
         const prefixList = n.pattern.source.match(/\((.*?)\)/)?.[1].split('|') || [];
         const activePrefixes = prefixList.filter(p => !n.expiredPrefixes.includes(p));
         return activePrefixes?.includes(numericPhone.substring(0, 4));
      });
      if (matching) {
          setNetwork(matching.id);
      }
    } else {
        setNetwork('');
    }
  };

  const handlePurchase = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    if (!network) {
      toast.error("Please select a network");
      return;
    }

    const discount = settings.data_plans?.airtime_discount || 0;
    const finalPrice = numAmount * (1 - discount / 100);

    if (balance < finalPrice) {
      toast.error("Insufficient balance");
      return;
    }

    hapticFeedback('medium');
    setIsVerifying(true);
  };

  const executePurchase = async () => {
    const numAmount = parseFloat(amount);
    const selectedNet = networks.find(n => n.id === network);
    const discount = settings.data_plans?.airtime_discount || 0;
    const finalPrice = numAmount * (1 - discount / 100);
    
    toast.loading("Processing airtime purchase via secure VTU API...", { id: "airtime-p" });

    try {
      const res = await fetch('/api/payments/vtu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id,
          amount: finalPrice,
          phone,
          network: selectedNet?.name || network,
          type: 'airtime',
          provider: 'payscribe' // Select active partner (Payscribe core VTU engine)
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Airtime sent successfully!", { id: "airtime-p" });
        await refreshData();
        setIsSuccess(true);
      } else {
        toast.error(resData.message || "Processor transaction declined.", { id: "airtime-p" });
        setIsVerifying(false);
      }
    } catch (err: any) {
      toast.error("Network gateway error. Retrying later.", { id: "airtime-p" });
      setIsVerifying(false);
    }
  };

  if (isSuccess) {
    return (
      <SuccessScreen 
        title="Airtime Sent!"
        subtitle={`₦${parseFloat(amount).toLocaleString()} airtime sent to ${phone}`}
        amount={parseFloat(amount).toLocaleString()}
        recipient={phone}
        onClose={onBack}
      />
    );
  }

  if (isVerifying) {
    return (
      <div className="h-full bg-background relative z-50">
        <SecurityPinScreen 
          onComplete={executePurchase}
          onBack={() => setIsVerifying(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background relative">
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <div className="w-20">
            <button onClick={onBack} className="text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
            <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
          </button>
        </div>
        
        <div className={cn(
            "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
            isCollapsed ? "opacity-100" : "opacity-0"
        )}>
            <span className="headline text-foreground">Airtime</span>
        </div>
        <div className="w-20 flex justify-end"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-6">
          <div ref={sentinelRef} className="h-1 w-full" />
          <div className="space-y-1">
             <h1 className="large-title text-foreground">Airtime</h1>
          </div>

          <div className="space-y-2">
            <p className="px-1 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-1">Select Network</p>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {networks.map((net) => (
                <button
                  key={net.id}
                  onClick={() => { hapticFeedback('light'); setNetwork(net.id); }}
                  className={cn(
                     "flex-shrink-0 w-[100px] h-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform ios-spring border relative overflow-hidden",
                     network === net.id ? 'border-indigo-500 bg-indigo-500/5 shadow-sm' : 'border-border bg-card shadow-sm'
                  )}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm">
                    <img src={net.logo} alt={net.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="caption-1 font-medium">{net.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-1 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-1">Details</p>
            <div className="ios-list-group mt-2">
              <div className="flex items-center gap-4 px-4 py-[10px] ios-hairline-bottom">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Smartphone size={20} strokeWidth={2} />
                </div>
                <input 
                  placeholder="Phone Number" 
                  className="flex-1 bg-transparent border-none focus:ring-0 body text-foreground p-0 focus:outline-none"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  type="tel"
                />
              </div>
              <div className="flex items-center gap-4 px-4 py-[10px]">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <span className="font-semibold text-lg">₦</span>
                </div>
                <div className="flex flex-col flex-1">
                  <input 
                    placeholder="Amount" 
                    className="w-full bg-transparent border-none focus:ring-0 body text-foreground p-0 focus:outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                  />
                  {amount && settings.data_plans?.airtime_discount > 0 && (
                    <p className="text-[10px] text-green-500 font-bold mt-0.5">
                      You pay: ₦{(parseFloat(amount) * (1 - settings.data_plans.airtime_discount / 100)).toLocaleString()} ({settings.data_plans.airtime_discount}% discount)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={handlePurchase}
              className="w-full bg-indigo-500 py-3.5 rounded-full headline text-white active:scale-95 transition-transform ios-spring shadow-sm"
            >
              Buy Airtime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}