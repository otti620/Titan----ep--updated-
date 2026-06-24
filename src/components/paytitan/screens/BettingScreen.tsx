"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle2, ArrowRight, Loader2, Landmark, Trophy, AlertTriangle } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn, cleanNumericalInput } from '../../../lib/utils';
import SecurityPinScreen from './SecurityPinScreen';
import SuccessScreen from './SuccessScreen';

const BETTING_PLATFORMS = [
  { id: '1', name: 'Bet9ja', code: 'bet9ja', logo: 'https://logo.clearbit.com/bet9ja.com', color: 'bg-green-600', text: 'text-green-600', brandColor: '#00843D', placeholderId: 'e.g. 1293844' },
  { id: '2', name: 'BetKing', code: 'betking', logo: 'https://logo.clearbit.com/betking.com', color: 'bg-blue-600', text: 'text-blue-600', brandColor: '#0033A0', placeholderId: 'e.g. 984022' },
  { id: '3', name: 'SportyBet', code: 'sportybet', logo: 'https://logo.clearbit.com/sportybet.com', color: 'bg-red-600', text: 'text-red-600', brandColor: '#E4002B', placeholderId: 'e.g. 830492' },
  { id: '4', name: '1xBet', code: '1xbet', logo: 'https://logo.clearbit.com/1xbet.com', color: 'bg-sky-600', text: 'text-sky-600', brandColor: '#007CBE', placeholderId: 'e.g. 483011' },
  { id: '5', name: 'Merrybet', code: 'merrybet', logo: 'https://logo.clearbit.com/merrybet.com', color: 'bg-amber-500', text: 'text-amber-500', brandColor: '#FF7A00', placeholderId: 'e.g. 509211' },
  { id: '6', name: 'Betway', code: 'betway', logo: 'https://logo.clearbit.com/betway.com', color: 'bg-zinc-800', text: 'text-zinc-800', brandColor: '#000000', placeholderId: 'e.g. 293844' },
  { id: '7', name: 'NairaBet', code: 'nairabet', logo: 'https://logo.clearbit.com/nairabet.com', color: 'bg-green-800', text: 'text-green-800', brandColor: '#004400', placeholderId: 'e.g. 384022' },
  { id: '8', name: 'MSport', code: 'msport', logo: 'https://logo.clearbit.com/msport.com', color: 'bg-yellow-600', text: 'text-yellow-600', brandColor: '#FFCC00', placeholderId: 'e.g. 830492' }
];

const BettingScreen = ({ onBack }: { onBack: () => void }) => {
  const { balance, processPayment, calculateFee } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Platform Select, 2: Customer ID, 3: Amount, 4: Review, 5: PIN, 6: Success

  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (customerId.length >= 6 && selectedPlatform) {
      handleVerifyCustomer();
    } else {
      setCustomerName('');
    }
  }, [customerId, selectedPlatform]);

  const handleVerifyCustomer = () => {
    setIsVerifying(true);
    // Simulate API lookup from betting platform database
    const timer = setTimeout(() => {
      const names = [
        "AUSTIN JAY-JAY OKOCHA",
        "KANU NWANKWO",
        "VICTOR OSIMHEN",
        "ADEMOLA LOOKMAN",
        "CHIDI BENJAMIN OKEKE"
      ];
      // Deterministic name selection based on customer ID sum
      const sum = customerId.split('').reduce((acc, c) => acc + (parseInt(c) || 0), 0);
      const name = names[sum % names.length];
      
      setCustomerName(name);
      setIsVerifying(false);
      hapticFeedback('success');
    }, 1200);

    return () => clearTimeout(timer);
  };

  const handleProcessFunding = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const numAmount = parseFloat(amount);
      const fee = calculateFee('betting_deposit', numAmount);
      
      const success = await processPayment({
        type: 'out',
        category: 'Betting',
        title: `Gaming funding - ${selectedPlatform.name}`,
        amount: numAmount,
        description: `Wallet top-up for ID: ${customerId} (${customerName})`
      });

      if (success) {
        import('../../../lib/notifications').then(module => {
          module.sendAppNotification(
            "Wallet Funded Successfully", 
            `₦${numAmount.toLocaleString()} paid to ${selectedPlatform.name} account ${customerId}`, 
            "🎮"
          );
        });
        setStep(6);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to route betting wallet deposit.");
      setStep(4);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPlatforms = BETTING_PLATFORMS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentFee = calculateFee('betting_deposit', parseFloat(amount) || 0);
  const totalAmount = (parseFloat(amount) || 0) + currentFee;

  let title = "Gaming Funding";
  if (step === 1) title = "Select Betting Platform";
  else if (step === 2) title = "Customer Account";
  else if (step === 3) title = "Fund Amount";
  else if (step === 4) title = "Review Payment";

  return (
    <div className="h-full w-full bg-background flex flex-col relative">
      {step < 5 && (
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
             "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none w-[60%] truncate",
             isCollapsed ? "opacity-100" : "opacity-0"
          )}>
             <span className="headline text-foreground">{title}</span>
          </div>
          <div className="w-20"></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-6 pt-2">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">Gaming & Sports</h1>
                <p className="subheadline text-muted-foreground">Select your Nigerian sports betting platform to fund wallet instantly.</p>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
                  <Search size={16} strokeWidth={2} className="text-muted-foreground" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search sports platform..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/10 border-none rounded-[10px] py-[7px] px-8 text-foreground subheadline focus:ring-0 transition-all font-medium"
                />
              </div>

              <div className="ios-list-group mt-6">
                {filteredPlatforms.map((platform, idx) => (
                  <button 
                    key={platform.id}
                    onClick={() => { hapticFeedback('light'); setSelectedPlatform(platform); setStep(2); }}
                    className={cn(
                      "w-full px-4 py-4 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors relative",
                      idx !== filteredPlatforms.length -1 && "ios-hairline-bottom"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white relative overflow-hidden bg-neutral-800 border border-white/5">
                        <Trophy size={20} strokeWidth={1.5} className="text-indigo-400" />
                        {platform.logo && (
                          <img 
                            src={platform.logo}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="absolute inset-0 w-full h-full object-cover bg-white"
                            alt={platform.name}
                          />
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="body font-semibold text-foreground">{platform.name}</span>
                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Instant settlement</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/40" strokeWidth={2} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-6 pt-2">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">{selectedPlatform.name}</h1>
                <p className="subheadline text-muted-foreground">Enter your {selectedPlatform.name} Customer Account ID.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 pt-4">
                  <label className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest pl-1">Customer / User ID</label>
                  <div className="relative ios-list-group p-0">
                    <input 
                      type="tel" 
                      placeholder={selectedPlatform.placeholderId} 
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-transparent border-none py-4 px-6 text-[22px] font-bold tracking-widest tabular-nums text-foreground focus:ring-0"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      {isVerifying && <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />}
                      {customerName && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {customerName && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ios-list-group p-5 border border-green-500/20 shadow-sm relative overflow-hidden">
                      <p className="caption-1 text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mb-1 relative z-10">Bettor Profile Found</p>
                      <p className="headline text-foreground relative z-10">{customerName}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setStep(3)}
                  disabled={!customerName}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring disabled:opacity-50 disabled:active:scale-100 shadow-sm"
                >
                  Enter Amount <ArrowRight size={20} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-8 pt-2">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1 mb-8">
                <h1 className="large-title text-foreground">Fund Amount</h1>
                <p className="subheadline text-muted-foreground">To {customerName.split(' ')[0]}'s sports wallet.</p>
              </div>

              <div className="ios-list-group p-8 flex flex-col items-center space-y-4 bg-card shadow-sm border border-border">
                <p className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Amount (₦)</p>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(cleanNumericalInput(e.target.value))}
                  placeholder="0.00"
                  autoFocus
                  className="text-[56px] leading-tight font-bold tracking-tight text-foreground w-full text-center border-none focus:ring-0 p-0 bg-transparent tabular-nums focus:outline-none"
                />
                <div className="px-5 py-2 bg-black/5 dark:bg-white/10 rounded-full mt-4">
                  <p className="caption-1 font-semibold text-foreground">Balance: ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    const numAmount = parseFloat(amount);
                    if (!amount || numAmount <= 0) return toast.error("Enter a valid amount");
                    const fee = calculateFee('betting_deposit', numAmount);
                    if (numAmount + fee > balance) return toast.error(`Insufficient balance. Total needed: ₦${(numAmount + fee).toLocaleString()}`);
                    setStep(4);
                  }}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring shadow-sm"
                >
                  Review Deposit <ArrowRight size={20} className="ml-1" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-6 pt-2">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">Review</h1>
              </div>

              <div className="ios-list-group p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-border">
                  <div className="w-16 h-16 rounded-[20px] bg-neutral-800 flex items-center justify-center text-foreground relative overflow-hidden">
                    <Trophy size={32} strokeWidth={1.5} className="text-indigo-400" />
                    {selectedPlatform.logo && (
                      <img 
                         src={selectedPlatform.logo}
                         onError={(e) => { e.currentTarget.style.display = 'none'; }}
                         className="absolute inset-0 w-full h-full object-cover bg-white"
                         alt={selectedPlatform.name}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="title-3 text-foreground">{customerName}</h3>
                    <p className="subheadline text-muted-foreground">{selectedPlatform.name} • ID: {customerId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Amount</span>
                    <span className="subheadline font-bold text-foreground">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Service Fee</span>
                    <span className={cn("caption-1 font-bold", currentFee === 0 ? "text-green-500" : "text-orange-500")}>
                      {currentFee === 0 ? "FREE" : `₦${currentFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="headline text-foreground">Total Charge</span>
                    <span className="title-2 text-foreground font-bold tracking-tight">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <button
                  onClick={() => setStep(5)}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
                >
                  Confirm & Fund
                </button>
                
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl space-y-1">
                  <p className="caption-1 font-bold text-green-800 dark:text-green-300">Instant Wallet Loading</p>
                  <p className="caption-2 text-green-700/90 dark:text-green-400/90 leading-relaxed font-semibold">
                     Connected to direct API pipelines. Top-up reflects instantly in your {selectedPlatform.name} sports balance.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              <SecurityPinScreen onComplete={handleProcessFunding} onBack={() => setStep(4)} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
              <SuccessScreen 
                title="Wallet Funded!" 
                subtitle={`₦${parseFloat(amount).toLocaleString()} sent successfully to ${selectedPlatform.name} ID ${customerId}.`} 
                amount={parseFloat(amount).toLocaleString()} 
                recipient={`${selectedPlatform.name} (${customerId})`} 
                onClose={onBack} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-[#1A2130]/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" strokeWidth={2.5} />
          <p className="text-white text-lg font-bold tracking-tight">Processing Sports Payment...</p>
          <p className="text-white/40 text-xs font-mono uppercase tracking-wider">DIRECT GATEWAY SETTLEMENT</p>
        </div>
      )}
    </div>
  );
};

export default BettingScreen;
