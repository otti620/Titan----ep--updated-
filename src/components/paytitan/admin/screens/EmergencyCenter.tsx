"use client";

import React, { useState } from 'react';
import { supabase } from '../../../../integrations/supabase/client';
import { AlertOctagon, ChevronLeft, PowerOff, ShieldBan, Radio, RefreshCcw, X, Send } from 'lucide-react';
import { hapticFeedback, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import { usePayTitan } from '../../../../context/PayTitanContext';

export default function EmergencyCenter({ onBack }: { onBack: () => void }) {
  const { updateSettings, settings } = usePayTitan();
  const [locked, setLocked] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const confirmAction = (msg: string, action: () => void) => {
    if (locked) {
      toast.error("Emergency Center is locked. Slide to unlock.");
      return;
    }
    hapticFeedback('heavy');
    if (window.confirm(msg)) {
      action();
    }
  };

  const actions = {
    suspendAll: () => {
      const features = settings.features || {};
      updateSettings('features', { ...features, p2p: false, bank: false, vtu: false, cards: false });
      toast.success("SYSTEM HALTED. All financial modules disabled.");
    },
    maintenance: () => {
      updateSettings('maintenance_mode', true);
      toast.success("Maintenance mode activated globally.");
    },
    switchProvider: () => {
      const current = settings.active_gateway || 'monnify';
      const next = current === 'monnify' ? 'paystack' : 'monnify';
      updateSettings('active_gateway', next);
      toast.info(`Primary switch flipped to ${next.toUpperCase()}`);
    },
    triggerBroadcastUI: () => {
      setShowBroadcast(true);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg) return toast.error('Enter a message');
    setIsSending(true);
    const toastId = toast.loading('Synchronizing global alert channel...');
    
    try {
      // Pushing to public notifications
      const { error } = await supabase.from('app_settings').upsert({ 
        key: 'global_broadcast', 
        value: JSON.stringify({
          message: broadcastMsg,
          timestamp: new Date().toISOString(),
          type: 'alert'
        }) 
      });

      if (error) throw error;
      
      toast.success(`Broadcast distributed across the network`, { id: toastId });
      setShowBroadcast(false);
      setBroadcastMsg('');
    } catch (e: any) {
      toast.error('Transmission failed: ' + e.message, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-red-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
      
      {/* Header */}
      <div className="pt-16 pb-4 px-6 relative z-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center font-black text-lg tracking-widest uppercase text-red-500 animate-pulse">
          DEFCON 1
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative z-10 px-6 py-4 overflow-y-auto pb-32 space-y-6">
        <div className="text-center space-y-2 mb-8">
           <AlertOctagon className="w-20 h-20 text-red-500 mx-auto" />
           <h1 className="text-3xl font-black text-white uppercase tracking-wider">Super Admin</h1>
           <p className="text-red-300 text-xs font-bold uppercase tracking-widest">Emergency Override Center</p>
        </div>

        <div className="bg-black/40 border border-red-500/30 rounded-3xl p-6 text-center">
          <p className="text-xs text-red-300 mb-4 font-mono">Status: {locked ? 'LOCKED' : 'ARMED'}</p>
          <button 
            onClick={() => { hapticFeedback('heavy'); setLocked(!locked); }}
            className={cn("w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all", 
              locked ? "bg-white/10 text-white" : "bg-red-600 text-white animate-pulse"
            )}
          >
            {locked ? 'Tap to Unlock Safeguards' : 'Safeguards Removed - careful!'}
          </button>
        </div>

        <div className="space-y-4 pt-4 relative">
          {!locked && <div className="absolute inset-0 border-2 border-red-500/50 rounded-3xl animate-pulse pointer-events-none -m-4" />}
          
          <button 
            onClick={() => confirmAction("Are you sure you want to disable ALL transfers on the platform?", actions.suspendAll)}
            className="w-full bg-red-900 border border-red-500 p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-red-950 rounded-xl flex items-center justify-center text-red-500 shrink-0">
               <PowerOff size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-white uppercase">Kill Switch</h3>
              <p className="text-[10px] text-red-300 font-medium mt-1 uppercase tracking-widest">Disable all transfers system-wide</p>
            </div>
          </button>

          <button 
            onClick={() => confirmAction("Put app in maintenance mode?", actions.maintenance)}
            className="w-full bg-orange-900 border border-orange-500 p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-orange-950 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
               <ShieldBan size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-white uppercase">Maintenance Mode</h3>
              <p className="text-[10px] text-orange-300 font-medium mt-1 uppercase tracking-widest">Force logout & lock platform</p>
            </div>
          </button>

          <button 
            onClick={() => confirmAction("Switch default gateway to secondary provider?", actions.switchProvider)}
            className="w-full bg-blue-900 border border-blue-500 p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
               <RefreshCcw size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-white uppercase">Gateway Failover</h3>
              <p className="text-[10px] text-blue-300 font-medium mt-1 uppercase tracking-widest">Switch Monnify ↔ Paystack</p>
            </div>
          </button>

          <button 
            onClick={() => confirmAction("Send emergency broadcast to all devices?", actions.triggerBroadcastUI)}
            className="w-full bg-purple-900 border border-purple-500 p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-purple-950 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
               <Radio size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-white uppercase">Global Broadcast</h3>
              <p className="text-[10px] text-purple-300 font-medium mt-1 uppercase tracking-widest">Push alert to all users instantly</p>
            </div>
          </button>
        </div>
      </div>

      {showBroadcast && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
           <div className="bg-card w-full max-w-sm rounded-[32px] p-6 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><Radio size={18} className="text-purple-500" /> Global Broadcast</h3>
               <button onClick={() => setShowBroadcast(false)} className="w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full text-foreground active:scale-95">
                 <X size={18} />
               </button>
             </div>
             
             <textarea 
               value={broadcastMsg}
               onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Enter urgent message for all active users..."
               className="w-full h-32 bg-black/5 dark:bg-white/5 border border-border rounded-xl p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium resize-none mb-6"
             />

             <button 
               onClick={sendBroadcast} 
               disabled={isSending || !broadcastMsg}
               className="w-full py-4 rounded-xl bg-purple-600 text-white font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
             >
               <Send size={18} /> {isSending ? 'Transmitting...' : 'Send to All Devices'}
             </button>
           </div>
         </div>
      )}
    </div>
  );
}
