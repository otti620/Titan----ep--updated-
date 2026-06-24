"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, CheckCircle2, ShieldCheck, ArrowRight, Info, Loader2, TrendingUp } from 'lucide-react';
import { hapticFeedback, cn } from '../../../lib/utils';
import { usePayTitan, CircleSlot } from '../../../context/PayTitanContext';

const SlotSelectionScreen = ({ circle, onBack, onConfirm }: { circle: any, onBack: () => void, onConfirm: () => void }) => {
  const { getCircleSlots, claimSlot, profile } = usePayTitan();
  const [slots, setSlots] = useState<CircleSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      const data = await getCircleSlots(circle.id);
      setSlots(data);
      setIsLoading(false);
    };
    fetchSlots();
  }, [circle.id, getCircleSlots]);

  const handleConfirm = async () => {
    if (!selectedSlotId) return;
    setIsClaiming(true);
    const success = await claimSlot(selectedSlotId);
    setIsClaiming(false);
    if (success) onConfirm();
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin absolute" />
          <span className="text-3xl animate-pulse drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]">⚡</span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing Slots...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#000000] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-lg font-bold text-[#1A2130] dark:text-white">Select your preferred slot</span>
        <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 text-[10px] font-bold">
          {slots.filter(s => s.status === 'available').length}/{slots.length}
        </div>
      </div>

      <div className="flex-1 px-6 space-y-8 overflow-y-auto pb-32 no-scrollbar">
        {/* Summary Card */}
        <div className="bg-white dark:bg-[#1A2130] rounded-[40px] p-8 shadow-sm border border-gray-50 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Payout</p>
              <h3 className="text-3xl font-bold text-[#1A2130] dark:text-white tracking-tight">₦{circle.target_amount.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              ₦{(circle.target_amount / slots.length).toLocaleString()} Monthly Contribution
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Duration of {slots.length} Months
            </div>
          </div>
        </div>

        {/* Slots List */}
        <div className="space-y-4">
          {slots.map((slot) => (
            <button
              key={slot.id}
              disabled={slot.status !== 'available' || isClaiming}
              onClick={() => { hapticFeedback('medium'); setSelectedSlotId(slot.id); }}
              className={cn(
                "w-full text-left rounded-[32px] p-6 border transition-all duration-300 space-y-4",
                selectedSlotId === slot.id 
                  ? "bg-white dark:bg-[#1A2130] border-green-500 shadow-lg scale-[1.02]" 
                  : "bg-white dark:bg-[#1A2130] border-gray-50 dark:border-white/5 shadow-sm",
                slot.status !== 'available' && "opacity-40 grayscale"
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedSlotId === slot.id ? "border-green-500 bg-green-500" : "border-gray-200"
                  )}>
                    {selectedSlotId === slot.id && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-bold text-[#1A2130] dark:text-white">Paid out in {slot.payout_month_name}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  slot.status === 'available' ? "text-green-500" : "text-gray-400"
                )}>
                  {slot.status === 'available' ? 'Slot Available' : slot.user_id === profile?.id ? 'Your Slot' : 'Taken'}
                </span>
              </div>

              <div className="space-y-2 pl-8">
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Calendar size={12} />
                  You will pay admin fees: <span className="font-bold text-[#1A2130] dark:text-white">₦{slot.admin_fee}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <TrendingUp size={12} />
                  You get a bonus: <span className="font-bold text-blue-500">₦{slot.bonus.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Payout</span>
                  <span className="text-base font-black text-[#1A2130] dark:text-white">₦{slot.payout_amount.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F8F9FC] dark:from-[#000000] to-transparent">
        <button
          disabled={!selectedSlotId || isClaiming}
          onClick={handleConfirm}
          className="w-full bg-[#1A2130] dark:bg-white text-white dark:text-[#1A2130] py-5 rounded-[24px] font-bold text-lg shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isClaiming ? <Loader2 className="animate-spin" /> : "Confirm Slot"}
        </button>
      </div>
    </div>
  );
};

export default SlotSelectionScreen;