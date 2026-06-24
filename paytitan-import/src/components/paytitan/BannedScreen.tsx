"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut, MessageSquare } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { hapticFeedback } from '../../lib/utils';

const BannedScreen = () => {
  const handleLogout = async () => {
    hapticFeedback('medium');
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="h-full w-full bg-[#1A2130] flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-lg shadow-red-500/20"
      >
        <ShieldAlert size={48} className="text-white" />
      </motion.div>

      <h2 className="text-3xl font-bold text-white mb-4">Access Restricted.</h2>
      <p className="text-white/60 mb-12 leading-relaxed">
        Your account has been flagged for violating PayTitan's terms of service. 
        All financial activities have been suspended for your security and the integrity of the network.
      </p>

      <div className="w-full space-y-4">
        <button 
          onClick={() => window.location.href = 'mailto:support@paytitan.com'}
          className="w-full bg-white/10 border border-white/10 text-white py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <MessageSquare size={20} /> Contact Support
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>

      <p className="mt-12 text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
        TitanShield™ Enforcement Active
      </p>
    </div>
  );
};

export default BannedScreen;