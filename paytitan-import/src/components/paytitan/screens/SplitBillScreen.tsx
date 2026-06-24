"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Plus, X, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

const SplitBillScreen = ({ transaction, onBack }: { transaction: any, onBack: () => void }) => {
  const { contacts, sendSplitRequest } = usePayTitan();
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const splitAmount = transaction?.amount ? transaction.amount / (selectedContacts.length + 1) : 0;

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

  const toggleContact = (contact: any) => {
    hapticFeedback('light');
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleSplit = async () => {
    setIsSending(true);
    await sendSplitRequest(
      transaction.title,
      splitAmount,
      selectedContacts.map(c => c.id)
    );
    setIsSending(false);
    hapticFeedback('success');
    onBack();
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={onBack} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Cancel</span>
        </button>
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline tracking-tight">Split Bill</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-6">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title tracking-tight text-foreground">Split Bill</h1>

          <div className="ios-list-group p-8 text-center mt-6">
            <p className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest mb-2">TOTAL TO SPLIT</p>
            <h3 className="title-1 font-bold text-foreground tabular-nums tracking-tight">₦{transaction?.amount?.toLocaleString() || '0'}</h3>
            <p className="subheadline text-muted-foreground mt-2">{transaction?.title}</p>
          </div>

          <div className="space-y-2 mt-8">
            <h3 className="px-2 caption-1 text-muted-foreground font-semibold uppercase tracking-widest pl-2 mb-4">SELECT TITANS</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
              {contacts.map((contact) => {
                const isSelected = selectedContacts.find(c => c.id === contact.id);
                return (
                  <button 
                    key={contact.id} 
                    onClick={() => toggleContact(contact)}
                    className="flex flex-col items-center gap-2 min-w-[64px] active:scale-95 transition-transform ios-spring"
                  >
                    <div className={cn("relative w-[60px] h-[60px] rounded-full p-0.5 border shadow-sm transition-all ios-spring", isSelected ? 'border-indigo-500 shadow-indigo-500/20' : 'border-border bg-card')}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.first_name}`} className="w-full h-full rounded-full bg-black/5 dark:bg-white/5" alt={contact.first_name} />
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full"
                          >
                            <CheckCircle2 className="w-6 h-6 text-indigo-500" strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <span className="caption-1 font-medium text-foreground">{contact.first_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {selectedContacts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="ios-list-group p-6 mt-4 border border-indigo-500/20 bg-indigo-500/5 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="caption-1 font-semibold uppercase tracking-widest text-indigo-500">EACH PERSON PAYS</span>
                  <span className="title-2 font-bold text-foreground tabular-nums tracking-tight">₦{splitAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-indigo-500/10 my-4" />
                <div className="flex items-center justify-center gap-2">
                  <Users className="text-indigo-500 w-4 h-4" strokeWidth={2} />
                  <p className="text-indigo-500/80 subheadline font-medium">Splitting with {selectedContacts.length} friends + You</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 pb-8">
            <button
              onClick={handleSplit}
              disabled={selectedContacts.length === 0 || isSending}
              className="w-full py-3.5 bg-indigo-500 text-white rounded-full headline flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 transition-transform ios-spring"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Requests"} 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBillScreen;