"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, Send, HelpCircle, ChevronRight, 
  ChevronDown, LifeBuoy, MessageCircle, AlertTriangle, 
  CheckCircle2, Clock, ShieldCheck, HelpCircle as FAQIcon, 
  FileText, ArrowDownRight, ArrowUpRight, ShieldAlert, Coins
} from 'lucide-react';
import { supabase } from '../../../integrations/supabase/client';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../../lib/utils';

// Define TS Interfaces for support records
interface LocalTicket {
  id: string;
  user_id?: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  admin_reply?: string;
  charge_amount?: number;
  created_at: string;
}

interface LocalDispute {
  id: string;
  transaction_id: string;
  user_id?: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  chargeback_fee_applied?: number;
  created_at: string;
  transaction_title?: string;
  transaction_amount?: number;
  transaction_ref?: string;
}

const SupportScreen = ({ onBack }: { onBack: () => void }) => {
  const { transactions, profile } = usePayTitan();
  
  const [activeTab, setActiveTab] = useState<'faq' | 'cases' | 'submit'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Custom Ticket Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSendingTicket, setIsSendingTicket] = useState(false);
  
  // Custom Dispute Form State
  const [selectedTxId, setSelectedTxId] = useState('');
  const [disputeReason, setDisputeReason] = useState('unauthorized');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [isSendingDispute, setIsSendingDispute] = useState(false);
  
  // Local + DB merged states
  const [tickets, setTickets] = useState<LocalTicket[]>([]);
  const [disputes, setDisputes] = useState<LocalDispute[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-30px 0px 0px 0px" }
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Fetch tickets and disputes cleanly
  const loadCases = async () => {
    setIsLoadingCases(true);
    let dbTickets: any[] = [];
    let dbDisputes: any[] = [];

    const userId = profile?.id;

    // 1. Fetch from Supabase
    try {
      if (userId) {
        const { data: tData } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (tData) dbTickets = tData;

        const { data: dData } = await supabase
          .from('transaction_disputes')
          .select('*, transactions(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (dData) {
          dbDisputes = dData.map(d => ({
            id: d.id,
            transaction_id: d.transaction_id,
            user_id: d.user_id,
            reason: d.reason,
            status: d.status,
            resolution_notes: d.resolution_notes,
            chargeback_fee_applied: d.chargeback_fee_applied,
            created_at: d.created_at,
            transaction_title: d.transactions?.title || 'Unknown Transaction',
            transaction_amount: d.transactions?.amount || 0,
            transaction_ref: d.transactions?.reference || d.transaction_id.slice(0, 8).toUpperCase()
          }));
        }
      }
    } catch (e) {
      console.warn("Supabase support pull fallback:", e);
    }

    // 2. Fetch from Local Storage and Merge
    try {
      const localTicketsRaw = localStorage.getItem('paytitan_support_tickets');
      if (localTicketsRaw) {
        const localTickets: LocalTicket[] = JSON.parse(localTicketsRaw);
        localTickets.forEach(lt => {
          if (!dbTickets.some(dt => dt.id === lt.id)) {
            dbTickets.unshift(lt);
          }
        });
      }

      const localDisputesRaw = localStorage.getItem('paytitan_transaction_disputes');
      if (localDisputesRaw) {
        const localDisputes: LocalDispute[] = JSON.parse(localDisputesRaw);
        localDisputes.forEach(ld => {
          if (!dbDisputes.some(dd => dd.id === ld.id)) {
            dbDisputes.unshift(ld);
          }
        });
      }
    } catch (e) {
      console.error("Local load error in Support Center:", e);
    }

    // Sort by Date descending
    dbTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    dbDisputes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setTickets(dbTickets);
    setDisputes(dbDisputes);
    setIsLoadingCases(false);
  };

  useEffect(() => {
    loadCases();
  }, [activeTab]);

  // Submit support ticket
  const handleSendTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please provide both a subject and a description");
      return;
    }

    setIsSendingTicket(true);
    hapticFeedback('medium');

    const newId = `TKT-${Math.floor(100000 + Math.random() * 899900)}`;
    const newTicket: LocalTicket = {
      id: newId,
      user_id: profile?.id,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
      created_at: new Date().toISOString()
    };

    // Attempt DB Insert
    try {
      if (profile?.id) {
        await supabase.from('support_tickets').insert([{
          id: newId,
          user_id: profile.id,
          subject: subject.trim(),
          message: message.trim(),
          status: 'open'
        }]);
      }
    } catch (e) {
      console.warn("DB insert bypassed, relying on front-end storage:", e);
    }

    // Always Save locally for Instant Dev Sync on Frontend Tab
    try {
      const localTicketsRaw = localStorage.getItem('paytitan_support_tickets');
      const localList = localTicketsRaw ? JSON.parse(localTicketsRaw) : [];
      localList.unshift(newTicket);
      localStorage.setItem('paytitan_support_tickets', JSON.stringify(localList));
    } catch (e) {
      console.error(e);
    }

    toast.success("Ticket Submitted Successfully!");
    setSubject('');
    setMessage('');
    setActiveTab('cases');
    setIsSendingTicket(false);
  };

  // Submit direct transaction dispute
  const handleSendDispute = async () => {
    if (!selectedTxId) {
      toast.error("Please select a transaction to dispute");
      return;
    }
    if (!disputeDetails.trim()) {
      toast.error("Please explain the reason for your dispute");
      return;
    }

    setIsSendingDispute(true);
    hapticFeedback('heavy');

    const targetTx = transactions.find(t => t.id === selectedTxId);
    const disputeId = `DSP-${Math.floor(100000 + Math.random() * 899900)}`;

    const newDispute: LocalDispute = {
      id: disputeId,
      transaction_id: selectedTxId,
      user_id: profile?.id,
      reason: `${disputeReason.toUpperCase()}: ${disputeDetails.trim()}`,
      status: 'open',
      created_at: new Date().toISOString(),
      transaction_title: targetTx?.title || "Transaction Charge",
      transaction_amount: targetTx?.amount || 0,
      transaction_ref: targetTx?.reference || selectedTxId.slice(0, 8).toUpperCase()
    };

    // DB Insert
    try {
      if (profile?.id) {
        await supabase.from('transaction_disputes').insert([{
          id: disputeId,
          transaction_id: selectedTxId,
          user_id: profile.id,
          reason: `${disputeReason.toUpperCase()}: ${disputeDetails.trim()}`,
          status: 'open'
        }]);
      }
    } catch (e) {
      console.warn("DB dispute insert bypassed, relying on front-end storage:", e);
    }

    // Local Storage save
    try {
      const localDispsRaw = localStorage.getItem('paytitan_transaction_disputes');
      const localList = localDispsRaw ? JSON.parse(localDispsRaw) : [];
      localList.unshift(newDispute);
      localStorage.setItem('paytitan_transaction_disputes', JSON.stringify(localList));
    } catch (e) {
      console.error(e);
    }

    toast.success("Dispute Logged! Our arbitration board is reviewing.");
    setSelectedTxId('');
    setDisputeDetails('');
    setActiveTab('cases');
    setIsSendingDispute(false);
  };

  // Real-world knowledge FAQ content based on PayTitan Specifications
  const realFaqs = [
    {
      q: "What is the processing fee on Ajo Social Circle payouts?",
      a: "PayTitan social escrow groups apply a microscopic 1.0% escrow allocation cut on each circle payout. This fee maintains the safe multisig pooling smart-contracts without affecting standard P2P transfers."
    },
    {
      q: "Why was I charged a ₦50 Declined Transaction Fee?",
      a: "To preserve network speed and prevent direct-abuse vectors, PayTitan charges a microscopic ₦50 recovery/protection fee when your account triggers 3 or more failed/declined transactions within a single 24-hour window."
    },
    {
      q: "What is the Weekly P2P Super User Fee?",
      a: "Active accounts which exceed 15 peer-to-peer transfers in a single calendar week trigger our Super User policy. A micro-fee of ₦10 is applied to subsequent outgoing transfers during that week to offset network node usage."
    },
    {
      q: "When does the Inactivity dormancy swept maintenance charge apply?",
      a: "If an wallet remains completely dormant (no successful transfers, payments, card activations, or savings) for over 180 consecutive days, an administrative monthly maintenance fee of ₦100 is deducted from the outstanding balance until activity resumes."
    },
    {
      q: "How do I increase my transfer and withdrawal limits?",
      a: "Limits are determined by self-completed KYC identity tiers. KYC Tier 1 (BVN validation) raises standard limits to ₦50,000 daily. Tier 2 (ID Document submission) upgrades constraints to ₦500,000, and Tier 3 (Utility Address Proof) enables unlimited digital financial transactions."
    },
    {
      q: "How does the Transaction Dispute / Chargeback mechanism works?",
      a: "When a transaction dispute is submitted, our arbitration desk immediately opens an investigation. If resolved in user favor, funds are reversed immediately from the recipient's ledger, and the merchant is penalized a ₦1,000 lost dispute administration penalty."
    }
  ];

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      {/* Header */}
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={() => { hapticFeedback('light'); onBack(); }} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
          isCollapsed ? "opacity-100" : "opacity-0"
        )}>
          <span className="headline tracking-tight">Help Center</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-5 pt-2 pb-6 space-y-6">
          <div ref={sentinelRef} className="h-1 w-full" />
          
          <div className="space-y-1">
            <h2 className="large-title tracking-tight text-foreground">Help Desk</h2>
            <p className="subheadline text-muted-foreground">Elite immediate customer grievance, FAQ and dispute resolution portal.</p>
          </div>

          {/* Tab Selection Segments */}
          <div className="p-1 bg-black/5 dark:bg-white/5 rounded-xl flex">
            <button 
              onClick={() => { hapticFeedback('light'); setActiveTab('faq'); }}
              className={cn(
                "flex-1 py-2 text-center footnote font-medium rounded-lg transition-all",
                activeTab === 'faq' ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              FAQ & Policies
            </button>
            <button 
              onClick={() => { hapticFeedback('light'); setActiveTab('cases'); }}
              className={cn(
                "flex-1 py-2 text-center footnote font-medium rounded-lg transition-all relative",
                activeTab === 'cases' ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Your Cases
              {(tickets.length + disputes.length) > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500 text-[10px] text-white font-bold">
                  {tickets.length + disputes.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => { hapticFeedback('light'); setActiveTab('submit'); }}
              className={cn(
                "flex-1 py-2 text-center footnote font-medium rounded-lg transition-all",
                activeTab === 'submit' ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              New Case
            </button>
          </div>

          {/* TAB CONTENT: FAQ & Policies */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/10 rounded-2xl flex gap-3">
                <ShieldCheck className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="headline font-bold text-indigo-500">TitanShield™ Safety</h4>
                  <p className="caption-1 text-muted-foreground mt-0.5">
                    Your transactions are constantly audited and backed by real-time chargeback guarantees and 24/7 security specialist teams.
                  </p>
                </div>
              </div>

              {/* Instant WhatsApp Support */}
              <div 
                className="bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-2xl flex flex-col space-y-3 active:bg-[#25D366]/20 transition-colors cursor-pointer"
                onClick={() => {
                  hapticFeedback('light');
                  const message = encodeURIComponent(`Hi PayTitan Support, I need help with my account (Handle: @${profile?.username || 'user'}).`);
                  if (typeof window !== 'undefined') window.open(`https://wa.me/2347077599057?text=${message}`, '_blank');
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="headline font-bold text-[#25D366]">Fast Track WhatsApp Support</h4>
                      <p className="caption-1 text-muted-foreground mt-0.5 font-medium">Average response time: &lt;5 mins</p>
                    </div>
                  </div>
                  <ArrowUpRight size={18} className="text-[#25D366]" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="px-3 footnote font-semibold text-muted-foreground uppercase tracking-widest pb-1">FREQUENT QUESTIONS</h3>
                <div className="ios-list-group px-0 space-y-0">
                  {realFaqs.map((faq, i) => {
                    const isExpanded = expandedFaq === i;
                    return (
                      <div key={i} className="border-b last:border-0 border-border">
                        <button 
                          onClick={() => { hapticFeedback('light'); setExpandedFaq(isExpanded ? null : i); }}
                          className="w-full py-4 px-4 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors text-left"
                        >
                          <span className="body hover:text-indigo-500 font-medium text-foreground pr-2 leading-tight">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronDown size={18} className="text-indigo-500 shrink-0" />
                          ) : (
                            <ChevronRight size={18} className="text-muted-foreground/40 shrink-0" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-[#F2F2F7] dark:bg-[#1C1C1E] px-4 py-3"
                            >
                              <p className="footnote text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Action Cases Dashboard */}
          {activeTab === 'cases' && (
            <div className="space-y-6">
              {isLoadingCases ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                  <p className="footnote text-muted-foreground mt-2">Loading Support History...</p>
                </div>
              ) : tickets.length === 0 && disputes.length === 0 ? (
                <div className="text-center py-12 px-6 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-3xl space-y-3">
                  <Clock size={40} className="mx-auto text-muted-foreground/40" />
                  <h4 className="headline font-bold">No Active Support Cases</h4>
                  <p className="footnote text-muted-foreground max-w-[240px] mx-auto">
                    Your ledgers are pristine, and you have no lingering inquiries or unresolved transactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Disputes List */}
                  {disputes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="px-3 footnote font-semibold text-muted-foreground uppercase tracking-widest">TRANSACTION DISPUTES</h3>
                      <div className="space-y-3">
                        {disputes.map((d) => (
                          <div 
                            key={d.id} 
                            className="bg-card border border-border p-4 rounded-2xl space-y-3 shadow-xs relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <span className="caption-2 font-black tracking-widest text-[#8E8E93]">{d.id}</span>
                                <h4 className="headline font-bold">{d.transaction_title}</h4>
                                <p className="caption-1 text-muted-foreground">Disputed Reference: <span className="font-mono">{d.transaction_ref}</span></p>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase",
                                  d.status === 'open' && "bg-orange-500/10 text-orange-500",
                                  d.status === 'resolved' && "bg-green-500/10 text-green-500",
                                  d.status === 'dismissed' && "bg-neutral-500/10 text-neutral-500"
                                )}>
                                  {d.status}
                                </span>
                                <span className="footnote font-medium text-red-500">
                                  -₦{Math.abs(d.transaction_amount || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl space-y-1 border border-border/40">
                              <p className="caption-2 font-semibold text-muted-foreground uppercase">CLAIM REASON</p>
                              <p className="caption-1 text-foreground leading-normal">{d.reason}</p>
                            </div>

                            {/* Resolution Details */}
                            {(d.resolution_notes || d.status !== 'open') && (
                              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <ShieldCheck size={16} className="text-indigo-500" />
                                  <span className="footnote font-bold text-indigo-500">Arbitration Resolution Result</span>
                                </div>
                                <p className="footnote italic text-foreground leading-snug">
                                  "{d.resolution_notes || "Case review complete. Settle action registered."}"
                                </p>
                                {d.chargeback_fee_applied ? (
                                  <div className="pt-1.5 flex items-center gap-1 text-[11px] font-black text-red-500 border-t border-indigo-500/10">
                                    <Coins size={12} />
                                    <span>MERCHANT PENALIZED: ₦{d.chargeback_fee_applied} lost chargeback dispute levy applied.</span>
                                  </div>
                                ) : d.status === 'resolved' && (
                                  <div className="pt-1.5 flex items-center gap-1 text-[11px] font-black text-green-500 border-t border-indigo-500/10 flex-wrap">
                                    <CheckCircle2 size={12} />
                                    <span>REVERSAL COMPLETE: ₦{Math.abs(d.transaction_amount || 0).toLocaleString()} credited back.</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tickets List */}
                  {tickets.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="px-3 footnote font-semibold text-muted-foreground uppercase tracking-widest">SUPPORT MESSAGE TICKETS</h3>
                      <div className="space-y-3">
                        {tickets.map((t) => (
                          <div 
                            key={t.id} 
                            className="bg-card border border-border p-4 rounded-2xl space-y-3.5 shadow-xs"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <span className="caption-2 font-bold text-indigo-500 font-mono">{t.id}</span>
                                <h4 className="headline font-bold">{t.subject}</h4>
                                <p className="caption-2 text-muted-foreground">
                                  {new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase",
                                t.status === 'open' ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"
                              )}>
                                {t.status}
                              </span>
                            </div>

                            <div className="body text-muted-foreground/95 bg-[#F2F2F7] dark:bg-[#1C1C1E] p-3 rounded-xl">
                              {t.message}
                            </div>

                            {/* Admin Reply or resolve comments */}
                            {(t.admin_reply || t.status === 'resolved') && (
                              <div className="p-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-2 border border-indigo-500/10">
                                <div className="flex items-center gap-1.5">
                                  <MessageCircle size={16} className="text-indigo-500" />
                                  <span className="footnote font-black text-indigo-500">Official Support Response</span>
                                </div>
                                <p className="footnote text-foreground dark:text-neutral-300 leading-normal">
                                  {t.admin_reply || "Your support inquiry has been reviewed and marked as resolved by PayTitan customer specialists."}
                                </p>
                                {t.charge_amount ? (
                                  <div className="pt-1.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground border-t border-border">
                                    <span>Resolution Processing Fee applied: ₦{t.charge_amount}</span>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: Submit New Inquiry or Dispute */}
          {activeTab === 'submit' && (
            <div className="space-y-6">
              
              {/* Box 1: File Support Ticket */}
              <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="headline font-bold">General Support Ticket</h3>
                    <p className="footnote text-muted-foreground">Ask questions, request limit tier updates or assistance.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="px-2 font-semibold footnote text-muted-foreground uppercase tracking-widest">SUBJECT</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., KYC Level Upgrade Request" 
                      className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl border-none py-3 px-4 body text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="px-2 font-semibold footnote text-muted-foreground uppercase tracking-widest">DESCRIPTION</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you? Be as clear as possible..." 
                      className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl border-none py-3 px-4 body text-foreground placeholder:text-muted-foreground/40 min-h-[100px] resize-none outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>

                  <button
                    onClick={handleSendTicket}
                    disabled={isSendingTicket}
                    className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-all ios-spring disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send size={18} />
                    {isSendingTicket ? "Sending Ticket..." : "Submit Inquiry"}
                  </button>
                </div>
              </div>

              {/* Box 2: Dispute Transaction */}
              <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="headline font-bold">Dispute a Transaction</h3>
                    <p className="footnote text-muted-foreground">Open a formal ledger dispute claim for immediate settlement.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="px-2 font-semibold footnote text-muted-foreground uppercase tracking-widest">SELECT TRANSACTION</label>
                    {transactions.length === 0 ? (
                      <p className="p-3 text-center footnote bg-neutral-100 dark:bg-neutral-800 rounded-xl text-muted-foreground mt-1">
                        No transactions found to dispute.
                      </p>
                    ) : (
                      <select
                        value={selectedTxId}
                        onChange={(e) => setSelectedTxId(e.target.value)}
                        className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl border-none py-3 px-4 body text-foreground mt-1 outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">-- Choose Transaction --</option>
                        {transactions.map(tx => (
                          <option key={tx.id} value={tx.id}>
                            ₦{Math.abs(tx.amount).toLocaleString()} - {tx.title} ({new Date(tx.created_at).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="px-2 font-semibold footnote text-muted-foreground uppercase tracking-widest">DISPUTE REASON</label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl border-none py-3 px-4 body text-foreground mt-1 outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="unauthorized">Unauthorized debit claim</option>
                      <option value="fraudulent">Fraudulent merchant / scammer receiver</option>
                      <option value="failed_credit">Debit occurred but service failed / not credited</option>
                      <option value="double_charged">Double billing error</option>
                      <option value="social_circle">Ajo Social escrow dispute</option>
                    </select>
                  </div>

                  <div>
                    <label className="px-2 font-semibold footnote text-muted-foreground uppercase tracking-widest">STATION REASON DETAILS</label>
                    <textarea 
                      value={disputeDetails}
                      onChange={(e) => setDisputeDetails(e.target.value)}
                      placeholder="Input chronological events, merchant name, or reason why arbitration must be settled in your favor..." 
                      className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-xl border-none py-3 px-4 body text-foreground placeholder:text-muted-foreground/40 min-h-[90px] resize-none outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>

                  <button
                    onClick={handleSendDispute}
                    disabled={isSendingDispute || !selectedTxId}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-all ios-spring disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert size={18} />
                    {isSendingDispute ? "Opening Case..." : "File Official Dispute"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportScreen;
