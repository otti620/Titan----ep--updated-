"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, CreditCard, ShieldCheck, Trash2, Zap, Tv, Music, Dumbbell, ShoppingBag, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../integrations/supabase/client';

const SubscriptionManagerScreen = ({ onBack }: { onBack: () => void }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', category: 'Entertainment' });

  const fetchSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_billing_date', { ascending: true });
    
    setSubscriptions(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAdd = async () => {
    if (!newSub.name || !newSub.amount) return toast.error("Please fill in all fields");
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('subscriptions').insert([{
      user_id: user?.id,
      name: newSub.name,
      amount: parseFloat(newSub.amount),
      category: newSub.category,
      status: 'active',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }]);

    if (!error) {
      toast.success("Subscription added!");
      setShowAdd(false);
      setNewSub({ name: '', amount: '', category: 'Entertainment' });
      fetchSubscriptions();
    }
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', id);
    if (!error) {
      toast.success("Subscription cancelled.");
      fetchSubscriptions();
    }
  };

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'entertainment': return <Tv className="text-red-500" />;
      case 'music': return <Music className="text-green-500" />;
      case 'fitness': return <Dumbbell className="text-blue-500" />;
      default: return <ShoppingBag className="text-orange-500" />;
    }
  };

  const totalCommitment = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + Number(s.amount), 0);

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Subscriptions</span>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-[#FF4D1C] rounded-full flex items-center justify-center shadow-lg shadow-[#FF4D1C]/20"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold text-[#1A2130] dark:text-white">Lifestyle.</h2>
          <p className="text-sm text-[#1A2130]/60">Manage your recurring world in one place.</p>
        </div>

        <div className="bg-[#1A2130] p-8 rounded-[40px] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-10 blur-[60px] rounded-full -mr-10 -mt-10" />
          <div className="relative z-10">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">MONTHLY COMMITMENT</p>
            <h3 className="text-3xl font-bold text-white">₦{totalCommitment.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-2 text-green-400">
              <Zap size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Optimized by TitanAI</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ACTIVE SERVICES</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center py-12 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="font-bold">Syncing Services...</p>
              </div>
            ) : subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className={`bg-white dark:bg-[#1A2130] p-5 rounded-[32px] flex items-center gap-4 shadow-sm border border-gray-50 dark:border-white/5 ${sub.status !== 'active' && 'opacity-50'}`}>
                  <div className="w-12 h-12 bg-[#F8F9FC] dark:bg-white/5 rounded-2xl flex items-center justify-center">
                    {getIcon(sub.category)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#1A2130] dark:text-white">{sub.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Next: {new Date(sub.next_billing_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1A2130] dark:text-white">₦{Number(sub.amount).toLocaleString()}</p>
                    {sub.status === 'active' && (
                      <button onClick={() => handleCancel(sub.id)} className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">Cancel</button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-20">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                <p className="font-bold">No active subscriptions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xs bg-white dark:bg-[#1A2130] rounded-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Add Service</h3>
                <button onClick={() => setShowAdd(false)}><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <input 
                  placeholder="Service Name (e.g. Netflix)" 
                  value={newSub.name}
                  onChange={(e) => setNewSub({...newSub, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold"
                />
                <input 
                  type="number"
                  placeholder="Monthly Amount (₦)" 
                  value={newSub.amount}
                  onChange={(e) => setNewSub({...newSub, amount: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold"
                />
                <select 
                  value={newSub.category}
                  onChange={(e) => setNewSub({...newSub, category: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold"
                >
                  <option>Entertainment</option>
                  <option>Music</option>
                  <option>Fitness</option>
                  <option>Shopping</option>
                </select>
              </div>
              <button 
                onClick={handleAdd}
                className="w-full bg-[#FF4D1C] text-white py-4 rounded-2xl font-bold shadow-lg"
              >
                Track Subscription
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionManagerScreen;