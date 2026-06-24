"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, Search, CheckCircle2, ArrowRight, Loader2, XCircle, Landmark, CreditCard } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn, cleanNumericalInput } from '../../../lib/utils';
import SecurityPinScreen from './SecurityPinScreen';
import SuccessScreen from './SuccessScreen';

const BANKS = [
  // Commercial Banks
  { id: '1', name: 'Access Bank', code: '044', domain: 'accessbankplc.com' },
  { id: '2', name: 'Citibank Nigeria', code: '023', domain: 'citi.com' },
  { id: '3', name: 'Ecobank Nigeria', code: '050', domain: 'ecobank.com' },
  { id: '4', name: 'Fidelity Bank', code: '070', domain: 'fidelitybank.ng' },
  { id: '5', name: 'First Bank of Nigeria', code: '011', domain: 'firstbanknigeria.com' },
  { id: '6', name: 'First City Monument Bank (FCMB)', code: '214', domain: 'fcmb.com' },
  { id: '7', name: 'Globus Bank', code: '100027', domain: 'globusbank.com' },
  { id: '8', name: 'Guaranty Trust Bank', code: '058', domain: 'gtbank.com' },
  { id: '9', name: 'Heritage Bank', code: '030', domain: 'hbng.com' },
  { id: '10', name: 'Keystone Bank', code: '082', domain: 'keystonebankng.com' },
  { id: '11', name: 'Optimus Bank', code: '100036', domain: 'optimusbank.com' },
  { id: '12', name: 'Parallex Bank', code: '100032', domain: 'parallexbank.com' },
  { id: '13', name: 'Polaris Bank', code: '076', domain: 'polarisbanklimited.com' },
  { id: '14', name: 'PremiumTrust Bank', code: '100037', domain: 'premiumtrustbank.com' },
  { id: '15', name: 'Providus Bank', code: '101', domain: 'providusbank.com' },
  { id: '16', name: 'Signature Bank', code: '100034', domain: 'signaturebankng.com' },
  { id: '17', name: 'Stanbic IBTC Bank', code: '221', domain: 'stanbicibtcbank.com' },
  { id: '18', name: 'Standard Chartered Bank', code: '068', domain: 'sc.com' },
  { id: '19', name: 'Sterling Bank', code: '232', domain: 'sterling.ng' },
  { id: '20', name: 'SunTrust Bank', code: '100', domain: 'suntrustbankng.com' },
  { id: '21', name: 'Titan Trust Bank', code: '100039', domain: 'titantrustbank.com' },
  { id: '22', name: 'Union Bank of Nigeria', code: '032', domain: 'unionbankng.com' },
  { id: '23', name: 'United Bank for Africa (UBA)', code: '033', domain: 'ubagroup.com' },
  { id: '24', name: 'Unity Bank', code: '215', domain: 'unitybankng.com' },
  { id: '25', name: 'Wema Bank', code: '035', domain: 'wemabank.com' },
  { id: '26', name: 'Zenith Bank', code: '057', domain: 'zenithbank.com' },

  // Non-Interest Banks
  { id: '27', name: 'Jaiz Bank', code: '301', domain: 'jaizbankplc.com' },
  { id: '28', name: 'Lotus Bank', code: '303', domain: 'lotusbank.com' },
  { id: '29', name: 'TAJBank', code: '302', domain: 'tajbank.com' },

  // Microfinance Banks & Mobile Money Operators (MMOs)
  { id: '30', name: 'Kuda Bank', code: '50211', domain: 'kuda.com' },
  { id: '31', name: 'Moniepoint', code: '50515', domain: 'moniepoint.com' },
  { id: '32', name: 'Opay', code: '999992', domain: 'opayweb.com' },
  { id: '33', name: 'Palmpay', code: '100033', domain: 'palmpay.com' },
  { id: '34', name: 'Paga', code: '100002', domain: 'mypaga.com' },
  { id: '35', name: 'VFD Microfinance Bank', code: '50281', domain: 'vfd-mfb.com' },
  { id: '36', name: 'Piggyvest (Providus)', code: '101', domain: 'piggyvest.com' },
  { id: '37', name: 'Rubies MFB', code: '125', domain: 'rubiesbank.io' },
  { id: '38', name: 'Sparkle Microfinance Bank', code: '50321', domain: 'sparkle.ng' },
  { id: '39', name: 'FairMoney Microfinance Bank', code: '51318', domain: 'fairmoney.io' },
  { id: '40', name: 'Carbon', code: '565', domain: 'getcarbon.co' },
  { id: '41', name: 'Dot Microfinance Bank', code: '50162', domain: 'dotbank.ng' },
  { id: '42', name: 'Mkobo MFB', code: '50300', domain: 'mkobo.bank' },
  { id: '43', name: 'Mint MFB', code: '50304', domain: 'bankwithmint.com' },
  { id: '44', name: 'LAPO Microfinance Bank', code: '50204', domain: 'lapo-nigeria.org' },
  { id: '45', name: 'Hasal Microfinance Bank', code: '50383', domain: 'hasalmfb.com' },
  { id: '46', name: 'Accion Microfinance Bank', code: '50100', domain: 'accionmfb.com' },

  // Primary Mortgage Banks
  { id: '47', name: 'Abbey Mortgage Bank', code: '80201', domain: 'abbeymortgagebank.com' },
  { id: '48', name: 'AG Mortgage Bank', code: '100028', domain: 'agmortgagebankplc.com' },
  { id: '49', name: 'Aso Savings and Loans', code: '090001', domain: 'asosavings.com' },
  { id: '50', name: 'Brent Mortgage Bank', code: '80203', domain: 'brentmortgagebank.com' },
  { id: '51', name: 'FBN Mortgages Limited', code: '090003', domain: 'fbnmortgages.com' },
  { id: '52', name: 'Haggai Mortgage Bank', code: '80206', domain: 'haggaimortgagebank.com' },
  { id: '53', name: 'Imperial Homes Mortgage Bank', code: '100024', domain: 'imperialhomesmortgagebank.com' },
  { id: '54', name: 'Infinity Trust Mortgage Bank', code: '80208', domain: 'infinitytrustmortgagebank.com' },
  { id: '55', name: 'Jubilee-Life Mortgage Bank', code: '80209', domain: 'jubileelifemortgagebank.com' },
  { id: '56', name: 'Lagos Building Investment Co.', code: '090006', domain: 'lbicplc.com' },
  { id: '57', name: 'Mayfresh Mortgage Bank', code: '80211', domain: 'mayfreshmortgage.com' },
  { id: '58', name: 'Platinum Mortgage Bank', code: '090008', domain: 'pmb.ng' },
  { id: '59', name: 'Refuge Mortgage Bank', code: '80214', domain: 'refugehomes.com.ng' },
  { id: '60', name: 'Resort Savings and Loans', code: '090009', domain: 'resortng.com' }
];

const BankTransferScreen = ({ onBack }: { onBack: () => void }) => {
  const { balance, processPayment, calculateFee } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Bank, 2: Account, 3: Amount, 4: Review, 5: PIN, 6: Success

  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Beneficiary Intelligence (Simulated)
  const [frequentBeneficiaries] = useState([
    { name: "Mama (Mom)", account: "0123456789", bankId: "8", label: "Mama" },
    { name: "Chisom (Rent)", account: "0543211234", bankId: "5", label: "Rent" },
    { name: "TechGadgets Vendor", account: "9876543210", bankId: "1", label: "Vendor" }
  ]);

  const selectBeneficiary = (b: any) => {
    hapticFeedback('light');
    const bank = BANKS.find(bk => bk.id === b.bankId);
    if (bank) {
      setSelectedBank(bank);
      setAccountNumber(b.account);
      setAccountName(b.name);
      setStep(3); // skip account verification since it's saved
    }
  };

  const filteredBanks = BANKS.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      handleVerifyAccount();
    } else {
      setAccountName('');
    }
  }, [accountNumber, selectedBank]);

  const handleVerifyAccount = () => {
    setIsVerifying(true);
    // Simulate NIP Name Enquiry
    setTimeout(() => {
      setAccountName("CHIDI BENJAMIN OKEKE");
      setIsVerifying(false);
      hapticFeedback('success');
    }, 1500);
  };

  const handleProcessTransfer = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const numAmount = parseFloat(amount);
      const fee = calculateFee('bank_transfer', numAmount);
      const success = await processPayment({
        type: 'out',
        category: 'Transfer',
        title: `Bank Transfer - ${selectedBank.name}`,
        amount: numAmount,
        description: `Transfer to ${accountName} (${accountNumber})`
      });
      
      if (success) {
        import('../../../lib/notifications').then(module => {
          module.sendAppNotification(
            "Transfer Successful", 
            `₦${numAmount.toLocaleString()} sent to ${accountName}`, 
            "💸"
          );
        });
        setStep(6);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An unexpected error occurred during bank routing.");
      setStep(4);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentFee = calculateFee('bank_transfer', parseFloat(amount) || 0);
  const totalAmount = (parseFloat(amount) || 0) + currentFee;

  let title = "Bank Transfer";
  if (step === 1) title = "Select Bank";
  else if (step === 2) title = "Account Details";
  else if (step === 3) title = "Amount";
  else if (step === 4) title = "Review";

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
             "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
             isCollapsed ? "opacity-100" : "opacity-0"
          )}>
             <span className="headline text-foreground">{title}</span>
          </div>
          <div className="w-20 flex justify-end"></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-6 pt-2">
              <div ref={sentinelRef} className="h-1 w-full" />
              <div className="space-y-1">
                <h1 className="large-title text-foreground">Select Bank</h1>
              </div>

              <div className="relative group">
                <div className={cn(
                  "absolute inset-y-0 flex items-center transition-all duration-300 pointer-events-none left-3"
                )}>
                  <Search size={16} strokeWidth={2} className="text-muted-foreground transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search banks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/10 border-none rounded-[10px] py-[7px] px-8 text-foreground subheadline focus:ring-0 transition-all font-medium"
                />
              </div>

              {!searchQuery && frequentBeneficiaries.length > 0 && (
                <div className="space-y-3 mt-8">
                  <h3 className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest pl-1">Frequent Beneficiaries</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1">
                    {frequentBeneficiaries.map((b, i) => {
                      const bank = BANKS.find(bk => bk.id === b.bankId);
                      return (
                        <button
                          key={i}
                          onClick={() => selectBeneficiary(b)}
                          className="shrink-0 w-28 p-3 rounded-2xl bg-card border border-border flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center relative shadow-inner">
                            <span className="font-bold">{b.label.substring(0, 1).toUpperCase()}</span>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center">
                              {bank?.domain ? (
                                <img 
                                  src={`https://logo.clearbit.com/${bank.domain}?size=40`}
                                  className="w-4 h-4 rounded-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  alt=""
                                />
                              ) : <Landmark size={10} />}
                            </div>
                          </div>
                          <div className="text-center w-full">
                            <p className="text-[11px] font-bold text-foreground truncate">{b.label}</p>
                            <p className="text-[9px] text-muted-foreground truncate font-medium">{bank?.name.split(' ')[0]}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="ios-list-group mt-6">
                {filteredBanks.map((bank, idx) => (
                  <button 
                    key={bank.id}
                    onClick={() => { hapticFeedback('light'); setSelectedBank(bank); setStep(2); }}
                    className={cn(
                      "w-full px-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors relative",
                      idx !== filteredBanks.length -1 && "ios-hairline-bottom"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center text-indigo-500 relative overflow-hidden">
                        <Landmark size={20} strokeWidth={1.5} />
                        {bank.domain && (
                          <img 
                            src={`https://logo.clearbit.com/${bank.domain}?size=80`}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="absolute inset-0 w-full h-full object-cover bg-white"
                            alt={bank.name}
                          />
                        )}
                      </div>
                      <span className="body font-semibold text-foreground">{bank.name}</span>
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
                <h1 className="large-title text-foreground">Account</h1>
                <p className="subheadline text-muted-foreground">Enter 10-digit number for {selectedBank.name}.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 pt-4">
                  <label className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest pl-1">Account Number</label>
                  <div className="relative ios-list-group p-0">
                    <input 
                      type="tel" 
                      maxLength={10}
                      placeholder="0123456789" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-transparent border-none py-4 px-6 text-[22px] font-bold tracking-widest tabular-nums text-foreground focus:ring-0"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      {isVerifying && <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />}
                      {accountName && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {accountName && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ios-list-group p-5 border border-green-500/20 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 blur-[2px]">
                         <Landmark size={80} className="text-green-500" />
                      </div>
                      <p className="caption-1 text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mb-1 relative z-10">Verified Name</p>
                      <p className="headline text-foreground relative z-10">{accountName}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setStep(3)}
                  disabled={!accountName}
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
                <h1 className="large-title text-foreground">Amount</h1>
                <p className="subheadline text-muted-foreground">To {accountName.split(' ')[0]}.</p>
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

              <div className="space-y-2">
                <label className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest pl-1">Note (Optional)</label>
                <div className="ios-list-group p-0">
                  <input 
                    type="text" 
                    placeholder="What's this for?" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-transparent border-none py-4 px-6 body font-medium text-foreground focus:ring-0"
                  />
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    const numAmount = parseFloat(amount);
                    if (!amount || numAmount <= 0) return toast.error("Enter a valid amount");
                    const fee = calculateFee('bank_transfer', numAmount);
                    if (numAmount + fee > balance) return toast.error(`Insufficient balance. Total needed: ₦${(numAmount + fee).toLocaleString()}`);
                    setStep(4);
                  }}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring shadow-sm"
                >
                  Review Transfer <ArrowRight size={20} className="ml-1" strokeWidth={2} />
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
                  <div className="w-16 h-16 rounded-[20px] bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground relative overflow-hidden">
                    <Landmark size={32} strokeWidth={1.5} />
                    {selectedBank.domain && (
                      <img 
                         src={`https://logo.clearbit.com/${selectedBank.domain}?size=120`}
                         onError={(e) => { e.currentTarget.style.display = 'none'; }}
                         className="absolute inset-0 w-full h-full object-cover bg-white"
                         alt={selectedBank.name}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="title-3 text-foreground">{accountName}</h3>
                    <p className="subheadline text-muted-foreground">{selectedBank.name} • {accountNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Amount</span>
                    <span className="subheadline font-bold text-foreground">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">Fee</span>
                    <span className={cn("caption-1 font-bold", currentFee === 0 ? "text-green-500" : "text-orange-500")}>
                      {currentFee === 0 ? "FREE" : `₦${currentFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="headline text-foreground">Total</span>
                    <span className="title-2 text-foreground font-bold tracking-tight">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <button
                  onClick={() => setStep(5)}
                  className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
                >
                  Confirm & Pay
                </button>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-1 select-none">
                  <p className="caption-1 font-bold text-amber-800 dark:text-amber-300">Partner Bank Network Notice</p>
                  <p className="caption-2 text-amber-700/90 dark:text-amber-400/90 leading-relaxed font-semibold">
                     Connected partner bank gateway networks are online. In the event of external partner routing delays, trades are securely buffered into dynamic "Pending" status holds to safeguard balances in accordance with CBN regulations.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              <SecurityPinScreen onComplete={handleProcessTransfer} onBack={() => setStep(4)} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
              <SuccessScreen 
                title="Transfer Successful!" 
                subtitle={`₦${parseFloat(amount).toLocaleString()} has been sent to ${accountName}.`} 
                amount={parseFloat(amount).toLocaleString()} 
                recipient={accountNumber} 
                onClose={onBack} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-[#1A2130]/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" strokeWidth={2.5} />
          <p className="text-white text-lg font-bold tracking-tight">Settle Bank Transfer...</p>
          <p className="text-white/40 text-xs font-mono uppercase tracking-wider">CBN NIP Interbank Settlement Node</p>
        </div>
      )}
    </div>
  );
};

export default BankTransferScreen;