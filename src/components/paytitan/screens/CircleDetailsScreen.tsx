"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreHorizontal, ChevronRight, CheckCircle2, Wallet, TrendingUp, Clock, MessageSquare, Plus, Loader2, Send } from 'lucide-react';
import { usePayTitan, CircleSlot } from '../../../context/PayTitanContext';
import { supabase } from '../../../integrations/supabase/client';
import { hapticFeedback, cn } from '../../../lib/utils';
import { toast } from 'sonner';

const CircleDetailsScreen = ({ circle, onBack, onSelectSlot }: { circle: any, onBack: () => void, onSelectSlot: () => void }) => {
  const { addFundsToCircle, profile, getCircleSlots } = usePayTitan();
  const [activeTab, setActiveTab] = useState('Contributions');
  const [slots, setSlots] = useState<CircleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'Adewale', text: "I've contributed my monthly quota successfully.", time: '10:14 AM' },
    { id: 2, user: 'Chinedu', text: "Perfect. Guys, please ensure payments are sent today before the 5pm default cutoff.", time: '11:02 AM' },
    { id: 3, user: 'Aminu', text: "Sent mine too. Circle is now 100% locked for the scheduled payout!", time: '11:15 AM' }
  ]);

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

  const fetchSlots = async () => {
    if (!circle?.id) return;
    const data = await getCircleSlots(circle.id);
    setSlots(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (circle?.id) {
      fetchSlots();
    }
  }, [circle?.id, getCircleSlots]);

  if (!circle) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 text-center bg-background">
        <div className="space-y-4">
          <Loader2 size={48} className="mx-auto text-indigo-500 animate-spin" />
          <h3 className="font-bold">Syncing Circle Metadata...</h3>
          <button onClick={onBack} className="px-6 py-2 bg-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-widest">Return</button>
        </div>
      </div>
    );
  }

  const userSlot = slots.find(s => s.user_id === profile?.id);
  const firstUnpaid = slots.findIndex(s => s.status !== 'paid');
  const currentMonthIndex = firstUnpaid === -1 ? (slots.length > 0 ? slots.length - 1 : 0) : firstUnpaid;

  const handleMakeContribution = async () => {
    if (isContributing) return;
    hapticFeedback('heavy');
    setIsContributing(true);
    toast.loading("Processing smart-escrow social contribution...", { id: "contrib" });

    const contributionAmt = slots[0]?.contribution_amount || circle.target_amount / (slots.length || 10);

    try {
      await addFundsToCircle(circle.id, contributionAmt);
      toast.success("Contribution recorded in smart-escrow ledger!", { id: "contrib" });
      await fetchSlots();
    } catch (e: any) {
      toast.error(e.message || "Failed to make contribution", { id: "contrib" });
    } finally {
      setIsContributing(false);
    }
  };

  const handleSendMessage = () => {
    if (!discussionMessage.trim()) return;
    hapticFeedback('keypad');
    setMessages([
      ...messages,
      {
        id: Date.now(),
        user: profile?.first_name || 'You',
        text: discussionMessage.trim(),
        time: 'Just now'
      }
    ]);
    setDiscussionMessage('');
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin absolute" />
          <span className="text-3xl animate-pulse drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]">⚡</span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Synchronizing Tribe...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={onBack} className="w-20 text-indigo-500 font-medium flex items-center gap-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline">Back</span>
        </button>
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="headline tracking-tight">Circle Details</span>
        </div>
        <div className="w-20 flex justify-end">
          <button className="text-indigo-500 active:opacity-60 transition-opacity">
            <MoreHorizontal size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="px-5 py-2">
        <div className="bg-black/5 dark:bg-white/10 p-1 rounded-[10px] flex gap-1">
          {['Contributions', 'Activities', 'Discussions'].map((tab) => (
            <button
              key={tab}
              onClick={() => { hapticFeedback('light'); setActiveTab(tab); }}
              className={cn(
                "flex-1 py-[6px] rounded-md subheadline font-semibold transition-all ios-spring",
                activeTab === tab 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title tracking-tight text-foreground">{circle.name || circle.title || 'Ajo Social Circle'}</h1>

          {/* Main Progress Card */}
          <div className="ios-list-group p-6 space-y-6">
            <div className="space-y-1">
              <p className="caption-1 text-muted-foreground font-semibold uppercase tracking-widest">MONTH {currentMonthIndex + 1} / {slots.length || 12}</p>
              <h3 className="title-1 font-bold text-foreground tracking-tight tabular-nums">
                ₦{circle.balance.toLocaleString()} <span className="text-muted-foreground/50">/ ₦{circle.target_amount.toLocaleString()}</span>
              </h3>
            </div>

            {userSlot ? (
              <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2.5 rounded-full w-fit">
                <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.first_name}`} className="w-full h-full object-cover" alt="User" />
                </div>
                <span className="caption-2 font-bold text-blue-500 uppercase tracking-widest">Payout {userSlot.payout_month_name}</span>
              </div>
            ) : (
              <button 
                onClick={onSelectSlot}
                className="flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-4 py-2.5 rounded-full w-fit active:scale-95 transition-transform ios-spring"
              >
                <span className="caption-2 font-bold uppercase tracking-widest">Select Payout Slot</span>
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            )}

            <div className="flex gap-1.5 h-2">
              {(slots.length > 0 ? slots : Array.from({ length: 12 })).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-full flex-1 rounded-full",
                    i < currentMonthIndex ? "bg-green-500" : i === currentMonthIndex ? "bg-indigo-500" : "bg-black/5 dark:bg-white/10"
                  )} 
                />
              ))}
            </div>

            <button 
              onClick={handleMakeContribution}
              disabled={isContributing}
              className="w-full bg-indigo-500 text-white disabled:opacity-50 py-3.5 rounded-full headline flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform ios-spring"
            >
              {isContributing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wallet size={18} strokeWidth={2} />
              )}
              <span>Make contribution</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'Contributions' && (
              <motion.div 
                key="contributions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="px-2 footnote font-semibold text-muted-foreground uppercase tracking-widest pb-1">Payout Schedule</h3>
                
                <div className="ios-list-group px-0">
                  {slots.map((slot, idx) => (
                    <div key={slot.id} className={cn("px-4 py-4 space-y-4", idx !== slots.length - 1 && "ios-hairline-bottom")}>
                      <div className="flex justify-between items-center">
                        <h4 className="caption-1 font-bold text-foreground uppercase tracking-widest">{slot.payout_month_name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "caption-2 font-bold uppercase tracking-widest",
                            slot.status === 'paid' ? "text-green-500" : slot.user_id === profile?.id ? "text-indigo-500" : "text-muted-foreground"
                          )}>
                            {slot.status === 'paid' ? 'Completed' : slot.user_id === profile?.id ? 'Your Payout' : 'Upcoming'}
                          </span>
                          {slot.status === 'paid' && <CheckCircle2 size={14} strokeWidth={2} className="text-green-500" />}
                          {slot.user_id === profile?.id && slot.status !== 'paid' && <TrendingUp size={14} strokeWidth={2} className="text-indigo-500" />}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="subheadline text-muted-foreground">Monthly Contribution</span>
                          <span className="subheadline font-semibold text-foreground">
                            ₦{slot.contribution_amount.toLocaleString()}
                          </span>
                        </div>
                        {slot.admin_fee > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="subheadline text-muted-foreground">Admin Fees</span>
                            <span className="subheadline font-semibold text-foreground">₦{slot.admin_fee.toLocaleString()}</span>
                          </div>
                        )}
                        {slot.bonus > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="subheadline text-muted-foreground">Bonus</span>
                            <span className="subheadline font-semibold text-green-500">+₦{slot.bonus.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="pt-3 flex justify-between items-center mt-1">
                          <span className="caption-1 font-bold text-foreground uppercase tracking-widest">
                            {slot.user_id === profile?.id ? 'Total Payout' : 'Total Contribution'}
                          </span>
                          <span className="title-3 font-semibold text-foreground tabular-nums">
                            ₦{(slot.user_id === profile?.id ? slot.payout_amount : slot.contribution_amount + slot.admin_fee).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'Activities' && (
              <motion.div 
                key="activities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="px-2 footnote font-semibold text-muted-foreground uppercase tracking-widest pb-1">Ledger Activities</h3>
                <div className="ios-list-group px-4 py-2 divide-y divide-border/30">
                  <div className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="subheadline font-semibold">Month 1 Payout Settled</p>
                        <p className="caption-2 text-muted-foreground">Dec 30, 2026</p>
                      </div>
                    </div>
                    <span className="subheadline font-bold text-green-500">+₦{(circle.target_amount / (slots.length || 1)).toLocaleString()}</span>
                  </div>

                  <div className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <p className="subheadline font-semibold">Ajo Vault Escrow Hardened</p>
                        <p className="caption-2 text-muted-foreground">Dec 20, 2026</p>
                      </div>
                    </div>
                    <span className="caption-2 font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">SECURE LOCK</span>
                  </div>

                  <div className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="subheadline font-semibold">User Contribution Pending</p>
                        <p className="caption-2 text-muted-foreground">Dec 15, 2026</p>
                      </div>
                    </div>
                    <span className="subheadline font-bold text-muted-foreground">₦{((slots[0]?.contribution_amount) || 50000).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Discussions' && (
              <motion.div 
                key="discussions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-2">
                  <h3 className="footnote font-semibold text-muted-foreground uppercase tracking-widest">Circle Communication</h3>
                  <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">EPHEMERAL</span>
                </div>

                <div className="ios-list-group p-4 space-y-4">
                  <div className="space-y-4 max-h-[220px] overflow-y-auto no-scrollbar">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground">{msg.user}</span>
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-muted-foreground bg-muted/20 p-2.5 rounded-[12px]">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <input 
                      type="text" 
                      placeholder="Comment on dynamic billing adjustments..." 
                      value={discussionMessage}
                      onChange={(e) => setDiscussionMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      className="flex-1 bg-black/5 dark:bg-white/5 border-none rounded-full px-4 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="w-9 h-9 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
                    >
                      <Send size={14} className="ml-[1px]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CircleDetailsScreen;
