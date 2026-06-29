"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  AtSign,
  Loader2,
  XCircle,
  History,
  Star,
  ShieldCheck
} from 'lucide-react';
import { usePayTitan, Profile } from '../../../context/PayTitanContext';
import { hapticFeedback, cn, cleanNumericalInput } from '../../../lib/utils';
import { toast } from 'sonner';
import SecurityPinScreen from './SecurityPinScreen';
import SuccessScreen from '../SuccessScreen';
import BiometricPrompt from '../BiometricPrompt';

interface TransferScreenProps {
  onBack: () => void;
  initialHandle?: string;
}

export default function TransferScreen({ onBack, initialHandle }: TransferScreenProps) {
  const { balance, transferFunds, getUserByUsername, contacts } = usePayTitan();
  const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Biometric, 4: PIN, 5: Success
  const [amount, setAmount] = useState('');
  const [handle, setHandle] = useState(initialHandle || '');
  const [note, setNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGift, setIsGift] = useState(false);

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

  const [frequentUsers] = useState([
    { handle: "gospel", name: "Gospel Otti", label: "Developer" },
    { handle: "titan.user", name: "Titan Example", label: "Test Account" },
  ]);

  // Real-time Identity Verification
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (handle.length >= 3) {
        setIsVerifying(true);
        const user = await getUserByUsername(handle);
        setRecipient(user);
        setIsVerifying(false);
        if (user) hapticFeedback('light');
      } else {
        setRecipient(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handle, getUserByUsername]);

  // Filter contacts based on handle input
  const filteredContacts = contacts.filter(c => 
    ((c.first_name || '') + ' ' + (c.last_name || '')).toLowerCase().includes((handle || '').toLowerCase()) || 
    (c.username || '').toLowerCase().includes((handle || '').toLowerCase())
  );

  const handleNext = () => {
    if (isProcessing) return;
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    if (parseFloat(amount) > balance) return toast.error("Insufficient balance");
    if (!recipient) return toast.error("Enter a valid Titan handle");
    
    hapticFeedback('medium');
    setStep(2);
  };

  const handleConfirmTransfer = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const finalNote = isGift ? `🎁 Gift: ${note ? note : 'A surprise for you!'}` : note;
    const result = await transferFunds(handle, parseFloat(amount), finalNote);
    setIsProcessing(false);

    if (result.success) {
      import('../../../lib/audio').then(m => m.playSuccessSound());
      import('../../../lib/notifications').then(module => {
        module.sendAppNotification(
          isGift ? "Gift Sent Successfully!" : "Transfer Successful", 
          `₦${parseFloat(amount).toLocaleString()} sent to @${handle}`, 
          "💸"
        );
      });
      setStep(5);
    } else {
      toast.error(result.message);
      setStep(2);
    }
  };

  const selectRecent = (h: string) => {
    hapticFeedback('light');
    setHandle(h);
  };

  const handleContactSync = async () => {
    hapticFeedback('medium');
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const contacts = await (navigator as any).contacts.select(props, { multiple: false });
        if (contacts.length > 0 && contacts[0].name.length > 0) {
          // Just mock assigning the first contact name as a handle snippet
          setHandle(contacts[0].name[0].toLowerCase().replace(/\s/g, ''));
        }
      } catch (ex) {
        toast.error("Contact selection cancelled or failed");
      }
    } else {
      toast.error("Device Contact Sync not supported on this device/browser.");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background pb-32">
      {step < 3 && (
        <div className={cn(
          "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
          isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
        )}>
          <div className="w-20">
            <button onClick={step === 1 ? onBack : () => setStep(1)} className="text-indigo-500 flex items-center gap-1 active:opacity-60 transition-opacity">
              <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
            </button>
          </div>
          
          <div className={cn(
             "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
             isCollapsed ? "opacity-100" : "opacity-0"
          )}>
             <span className="headline text-foreground">{isGift ? 'Send a Gift' : 'Transfer'}</span>
          </div>

          <div className="w-20 flex justify-end">
            {step === 1 && (
              <button onClick={handleContactSync} className="text-indigo-500 active:opacity-60 transition-opacity" title="Sync Contacts">
                <User size={22} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 px-5 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pt-2">
              <div ref={sentinelRef} className="h-1 w-full" />
              <h1 className="large-title text-foreground mb-4">{isGift ? 'Send a Gift' : 'Transfer'}</h1>
              
              <div className="py-6 flex flex-col items-center justify-center">
                <span className="caption-1 text-muted-foreground uppercase tracking-widest mb-2">Amount to Send</span>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-semibold text-foreground mr-1">₦</span>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(cleanNumericalInput(e.target.value))}
                    placeholder="0"
                    className="text-[56px] leading-tight font-bold bg-transparent border-none text-center focus:ring-0 w-full max-w-[300px] placeholder:text-muted-foreground/30 tabular-nums focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="mt-5 px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full flex gap-3 items-center ios-spring">
                  <p className="caption-1 font-medium text-foreground">Balance: ₦{balance.toLocaleString()}</p>
                  <div className="w-px h-3 bg-border" />
                  <button 
                    onClick={() => { hapticFeedback('light'); setIsGift(!isGift); }}
                    className={cn("caption-1 font-semibold transition-colors uppercase tracking-widest", isGift ? 'text-indigo-500' : 'text-muted-foreground')}
                  >
                    {isGift ? 'Sent as gift' : 'Send as gift'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="px-4 footnote text-muted-foreground uppercase tracking-widest pl-1">Recipient Handle</p>
                  <div className="ios-list-group p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <AtSign size={18} strokeWidth={2} />
                      </div>
                      <input 
                        placeholder="titan.handle" 
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 font-medium body text-foreground placeholder:text-muted-foreground/40"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase())}
                      />
                      {isVerifying && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
                      {recipient && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {!recipient && handle.length >= 3 && !isVerifying && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                </div>

                {recipient && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="ios-list-group p-4 border border-green-500/30 flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipient.first_name}`} className="w-full h-full object-cover" alt={recipient.first_name} />
                    </div>
                    <div className="flex-1">
                      <p className="subheadline font-semibold text-foreground">
                        {recipient.first_name} {recipient.last_name}
                      </p>
                      <div className="flex items-center gap-1 text-green-500 mt-0.5">
                        <ShieldCheck size={14} strokeWidth={1.5} />
                        <p className="caption-1">Verified User</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center bg-green-500/10 rounded-full">
                      <CheckCircle2 size={18} strokeWidth={2} className="text-green-500" />
                    </div>
                  </motion.div>
                )}

                {/* Frequent Internal Recipients (Smart Suggestions) */}
                {!recipient && handle.length === 0 && frequentUsers.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest pl-1 border-b border-border pb-2">Smart Suggestions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {frequentUsers.map((u, i) => (
                        <button
                          key={i}
                          onClick={() => selectRecent(u.handle)}
                          className="p-3 bg-card border border-border rounded-2xl flex items-center gap-3 active:scale-95 transition-transform text-left shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-white/10 text-indigo-500 overflow-hidden shrink-0 border border-border">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[12px] font-bold text-foreground truncate">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{u.label} • @{u.handle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contacts Search Results */}
                {!recipient && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="footnote text-muted-foreground uppercase tracking-widest">
                        {handle.length > 0 ? 'Search Results' : 'Recent Titans'}
                      </h3>
                      {handle.length === 0 && <Star size={14} className="text-yellow-500" />}
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                      {filteredContacts.slice(0, 8).map((contact) => (
                        <button 
                          key={contact.id}
                          onClick={() => selectRecent(contact.username)}
                          className="flex flex-col items-center gap-2 min-w-[72px] active:scale-90 transition-transform ios-spring"
                        >
                          <div className="w-14 h-14 rounded-full p-0.5 border border-border shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.first_name}`} className="w-full h-full rounded-full bg-black/5 dark:bg-white/5" alt={contact.first_name} />
                          </div>
                          <span className="caption-1 font-semibold text-muted-foreground truncate w-[64px]">@{contact.username}</span>
                        </button>
                      ))}
                      {filteredContacts.length === 0 && handle.length > 0 && (
                        <div className="py-4 px-2 italic caption-1 text-muted-foreground">No matching Titans found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <motion.button 
                  onClick={handleNext}
                  disabled={!amount || !recipient}
                  className="w-full bg-indigo-500 py-3.5 rounded-full headline text-white shadow-sm active:scale-95 transition-transform ios-spring disabled:opacity-50 disabled:active:scale-100"
                >
                  Review Transfer
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="space-y-6 pt-6">
              <div className="ios-list-group p-8 text-center bg-card">
                <p className="caption-1 text-muted-foreground uppercase tracking-widest mb-1.5">You are sending</p>
                <h2 className="text-[40px] font-semibold text-foreground tracking-tight mb-8 tabular-nums">₦{parseFloat(amount).toLocaleString()}</h2>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="subheadline text-muted-foreground">Recipient</span>
                    <div className="text-right">
                      <p className="subheadline font-semibold text-foreground">@{handle}</p>
                      <p className="caption-1 text-muted-foreground mt-0.5">{recipient?.first_name} {recipient?.last_name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="subheadline text-muted-foreground">Fee</span>
                    <span className="subheadline font-semibold text-green-500">Free</span>
                  </div>
                </div>
              </div>

              <div className="ios-list-group p-4">
                <textarea 
                  placeholder="Add a note (optional)"
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 body resize-none text-foreground placeholder:text-muted-foreground/40"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full bg-indigo-500 py-3.5 rounded-full headline text-white active:scale-95 transition-transform ios-spring shadow-sm border border-indigo-600/20"
              >
                Confirm & Authorize
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <BiometricPrompt 
              isOpen={true}
              onSuccess={() => setStep(4)}
              onCancel={() => setStep(2)}
              title="Authorize Transfer"
            />
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              <SecurityPinScreen 
                onComplete={handleConfirmTransfer}
                onBack={() => setStep(2)}
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
              <SuccessScreen 
                title="Transfer Sent!"
                subtitle={`You successfully sent ₦${parseFloat(amount).toLocaleString()} to @${handle}`}
                amount={parseFloat(amount).toLocaleString()}
                onDone={onBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-12">
             <div className="w-24 h-24 rounded-[32px] bg-indigo-500/10 flex items-center justify-center relative z-10">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" strokeWidth={2.5} />
             </div>
             {/* Fueling Glows */}
             <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full fueling-animation" />
             <div className="absolute inset-[-20px] border border-indigo-500/10 rounded-[40px] animate-pulse" />
          </div>
          
          <div className="space-y-4 max-w-xs">
            <h2 className="text-[28px] font-black text-white italic tracking-tighter leading-none italic uppercase">Fueling Node...</h2>
            <p className="text-[14px] font-medium text-white/60 leading-relaxed">
               Establishing cryptographic consensus across 124 Titan architectural nodes.
            </p>
          </div>

          <div className="absolute bottom-12 left-12 right-12">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Protocol Progress</span>
                <span className="text-[10px] font-mono text-indigo-400">0x74...f92</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}