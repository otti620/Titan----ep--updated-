"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, ArrowRight, CheckCircle2, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../../lib/utils';
import SecurityPinScreen from './SecurityPinScreen';
import SuccessScreen from './SuccessScreen';

const NETWORKS = [
  { id: 'mtn', name: 'MTN Nigeria', logo: '/assets/networks/mtn.jpg', pattern: /^(0803|0806|0810|0813|0814|0816|0703|0706|0903|0906|0913|0916)\d{7}$/, expiredPrefixes: ['0903', '0913'] },
  { id: 'airtel', name: 'Airtel', logo: '/assets/networks/airtel.jpg', pattern: /^(0802|0808|0812|0701|0708|0902|0907|0901|0912)\d{7}$/, expiredPrefixes: ['0912'] },
  { id: 'glo', name: 'Glo', logo: '/assets/networks/glo.jpg', pattern: /^(0805|0807|0811|0705|0905|0915)\d{7}$/, expiredPrefixes: [] },
  { id: '9mobile', name: '9mobile', logo: '/assets/networks/9mobile.jpg', pattern: /^(0809|0817|0818|0908|0909)\d{7}$/, expiredPrefixes: ['0809'] },
];

const DEFAULT_BUNDLES = {
  daily: [
    { id: 'd1', name: '100MB', price: 100, duration: '24 Hours' },
    { id: 'd2', name: '200MB', price: 200, duration: '24 Hours' },
    { id: 'd3', name: '1GB', price: 350, duration: '24 Hours' },
    { id: 'd4', name: '2GB', price: 600, duration: '24 Hours' },
  ],
  weekly: [
    { id: 'w1', name: '750MB', price: 500, duration: '7 Days' },
    { id: 'w2', name: '1.5GB', price: 1000, duration: '7 Days' },
    { id: 'w3', name: '3GB', price: 1500, duration: '7 Days' },
    { id: 'w4', name: '6GB', price: 2500, duration: '7 Days' },
  ],
  monthly: [
    { id: 'm1', name: '1.5GB', price: 1000, duration: '30 Days' },
    { id: 'm2', name: '3.5GB', price: 2000, duration: '30 Days' },
    { id: 'm3', name: '10GB', price: 5000, duration: '30 Days' },
    { id: 'm4', name: '20GB', price: 8000, duration: '30 Days' },
    { id: 'm5', name: '45GB', price: 12000, duration: '30 Days' },
    { id: 'm6', name: '100GB', price: 25000, duration: '30 Days' },
  ]
};

const DataScreen = ({ onBack }: { onBack: () => void }) => {
  const { balance, settings, profile, refreshData } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Network/Number, 2: Bundle, 3: Review, 4: PIN, 5: Success
  
  // Use settings-driven bundles if available
  const bundles = React.useMemo(() => {
    if (!settings?.data_plans) return DEFAULT_BUNDLES;
    
    // Merge price overrides into default bundle structure
    const merged: any = JSON.parse(JSON.stringify(DEFAULT_BUNDLES));
    ['daily', 'weekly', 'monthly'].forEach(cat => {
      if (settings.data_plans[cat]) {
        settings.data_plans[cat].forEach((override: any) => {
          const mainBundle = merged[cat].find((b: any) => b.name === override.name);
          if (mainBundle) mainBundle.price = override.price;
        });
      }
    });
    return merged;
  }, [settings?.data_plans]);
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedBundle, setSelectedBundle] = useState<any>(null);

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
  }, [step]);

  const handlePhoneChange = (val: string) => {
    const numericPhone = val.replace(/\D/g, '');
    setPhoneNumber(numericPhone);

    if (numericPhone.length >= 4) {
      const matching = NETWORKS.find(n => {
         const prefixList = n.pattern.source.match(/\((.*?)\)/)?.[1].split('|') || [];
         const activePrefixes = prefixList.filter(p => !n.expiredPrefixes.includes(p));
         return activePrefixes?.includes(numericPhone.substring(0, 4));
      });
      if (matching) setNetwork(matching);
    }
  };

  const handleProcessPayment = async () => {
    setStep(4);
  };

  const executeActualPayment = async () => {
    toast.loading("Processing data bundle purchase via secure VTU API...", { id: "data-purchase-p" });

    try {
      const res = await fetch('/api/payments/vtu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: profile?.id,
          amount: selectedBundle.price,
          phone: phoneNumber,
          network: network.name,
          type: 'data',
          provider: 'payscribe' // Select active partner (Payscribe core VTU engine)
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
         toast.success("Data bundle purchased!", { id: "data-purchase-p" });
         await refreshData();
         setStep(5);
      } else {
         toast.error(resData.message || "Processor transaction declined", { id: "data-purchase-p" });
         setStep(3);
      }
    } catch (err: any) {
       toast.error("Network gateway error. Retrying later.", { id: "data-purchase-p" });
       setStep(3);
    }
  };

  let title = "Data";
  if (step === 1) title = "Select Network";
  else if (step === 2) title = "Choose Bundle";
  else if (step === 3) title = "Review";

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {step < 4 && (
        <div className={cn(
          "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
          isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
        )}>
          <div className="w-20">
             <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
              <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
            </button>
          </div>
          
          <div className={cn(
             "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
             isCollapsed ? "opacity-100" : "opacity-0"
          )}>
             <span className="headline text-foreground">{title}</span>
          </div>
          <div className="w-20" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {step === 4 && (
            <div className="h-full bg-background relative z-50">
              <SecurityPinScreen 
                onComplete={executeActualPayment}
                onBack={() => setStep(3)}
              />
            </div>
          )}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-5 space-y-6 pt-2"
            >
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">Select Network</h1>
              </div>

              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {NETWORKS.map((net) => (
                  <button 
                    key={net.id}
                    onClick={() => { hapticFeedback('light'); setNetwork(net); }}
                    className={cn(
                       "flex-shrink-0 w-[100px] h-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform ios-spring border relative overflow-hidden",
                       network.id === net.id ? 'border-indigo-500 bg-indigo-500/5 shadow-sm' : 'border-border bg-card shadow-sm'
                    )}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm">
                      <img src={net.logo} alt={net.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="caption-1 font-medium">{net.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2 mt-4 pt-4">
                <label className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-1">Phone Number</label>
                <div className="ios-list-group p-0">
                  <input 
                    type="tel" 
                    placeholder="0801 234 5678" 
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full bg-transparent border-none py-4 px-6 text-[22px] font-bold tracking-widest tabular-nums text-foreground focus:ring-0"
                  />
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    if (phoneNumber.length < 10) return toast.error("Enter a valid phone number");
                    setStep(2);
                  }}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring disabled:opacity-50 disabled:active:scale-100 shadow-sm"
                >
                  Select Bundle <ArrowRight size={20} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-5 space-y-6 pt-2"
            >
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">Choose Bundle</h1>
                <p className="subheadline text-muted-foreground">Select a data plan for {network.name}.</p>
              </div>

              <div className="flex p-1 bg-black/5 dark:bg-white/10 rounded-xl">
                {(['daily', 'weekly', 'monthly'] as const).map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => { hapticFeedback('light'); setCategory(cat); }}
                    className={cn(
                       "flex-1 py-1.5 rounded-lg caption-1 font-semibold tracking-wide transition-all",
                       category === cat ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    )}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="ios-list-group mt-6">
                {bundles[category].map((bundle: any, idx: number) => (
                  <button 
                    key={bundle.id}
                    onClick={() => { hapticFeedback('light'); setSelectedBundle(bundle); setStep(3); }}
                    className={cn(
                      "w-full px-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors relative",
                      idx !== bundles[category].length -1 && "ios-hairline-bottom"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                        <Zap size={20} strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <h4 className="body font-semibold text-foreground">{bundle.name}</h4>
                        <p className="caption-1 text-muted-foreground mt-0.5">{bundle.duration}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                       <p className="body font-semibold text-foreground tabular-nums">₦{bundle.price.toLocaleString()}</p>
                       <ChevronRight className="w-5 h-5 text-muted-foreground/40" strokeWidth={2} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-5 space-y-6 pt-2"
            >
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">Review</h1>
              </div>

              <div className="ios-list-group p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-border">
                  <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-border">
                    <img src={network.logo} alt={network.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="title-3 text-foreground">{network.name} {selectedBundle.name}</h3>
                    <p className="subheadline text-muted-foreground">{phoneNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Validity</span>
                    <span className="subheadline font-medium text-foreground">{selectedBundle.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Amount</span>
                    <span className="subheadline font-medium text-foreground tabular-nums">₦{selectedBundle.price.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="headline text-foreground">Total</span>
                    <span className="title-2 text-foreground font-bold tracking-tight tabular-nums">₦{selectedBundle.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
                >
                  Pay Now
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <SecurityPinScreen 
                onComplete={handleProcessPayment}
                onBack={() => setStep(3)}
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <SuccessScreen 
                title="Data Active!"
                subtitle={`Your ${network.name} ${selectedBundle.name} bundle is now active.`}
                amount={selectedBundle.price.toLocaleString()}
                recipient={phoneNumber}
                onClose={onBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DataScreen;