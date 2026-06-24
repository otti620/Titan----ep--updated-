"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Share2, Edit3, ChevronRight, Users, MessageCircle, Zap, Heart, History, Sparkles } from 'lucide-react';
import { hapticFeedback, safeShare } from '../../../lib/utils';
import { toast } from 'sonner';

interface TribeScreenProps {
  tribe: any;
  onBack: () => void;
  onSelectFeature: (feature: string) => void;
}

const TribeScreen = ({ tribe, onBack, onSelectFeature }: TribeScreenProps) => {
  const [activeTab, setActiveTab] = useState<'features' | 'activities'>('features');
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join my Tribe on PayTitan! Use the 6-digit code ${tribe?.invite_code || ''} to start saving and splitting bills together. Download the app today.`)}`;

  const handleShare = async () => {
    hapticFeedback('light');
    const text = `Join my Tribe on PayTitan! Tribe: ${tribe.name}. Invite Code: ${tribe.invite_code}`;
    const result = await safeShare({
      title: 'Tribe Invitation Code',
      text,
    }, text);

    if (result === 'copied') {
      toast.success("Tribe invite code copied!");
    }
  };

  const handleWhatsApp = () => {
    hapticFeedback('light');
    if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#000000] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-6 space-y-8 overflow-y-auto pb-32 no-scrollbar">
        {/* Tribe Identity */}
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2130] dark:text-white flex items-center gap-2">
            {tribe.name} <span className="text-3xl">🏖️</span>
          </h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Take control of your finances and live the lifestyle you want.
          </p>
        </div>

        {/* Members Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Members</h3>
            <button 
              onClick={() => { hapticFeedback('light'); toast.info("Full member directory coming soon!"); }}
              className="text-[11px] font-bold text-[#1A2130] dark:text-white flex items-center gap-1 active:opacity-60 transition-opacity"
            >
              All members <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#F8F9FC] dark:border-[#000000] overflow-hidden bg-gray-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 50}`} alt="Member" />
                </div>
              ))}
            </div>
            <button 
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-[#1A2130] dark:text-white shadow-sm active:scale-95 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* 6-Digit Join Code Section */}
        <div className="bg-white dark:bg-[#1A2130] rounded-[32px] p-6 shadow-sm border border-gray-50 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between group">
            <div className="flex-1 overflow-hidden pr-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">6-Digit Join Code</p>
              <p className="text-2xl font-black text-indigo-500 dark:text-indigo-400 tracking-[0.2em]">{tribe?.invite_code || '------'}</p>
            </div>
            <button 
              onClick={handleShare}
              className="px-4 py-2.5 text-xs font-bold bg-[#E9EDF7] dark:bg-white/5 hover:bg-[#d0daef] dark:hover:bg-white/10 text-indigo-600 dark:text-white rounded-full transition-all flex items-center gap-1.5 shrink-0"
              title="Copy Join Code"
            >
              <Share2 size={14} /> Copy Code
            </button>
          </div>
          <div className="h-px bg-gray-50 dark:bg-white/5" />
          <div className="flex items-center justify-between group">
            <div className="flex-1 overflow-hidden pr-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tribe Chat invite</p>
              <p className="text-sm font-bold text-[#25D366] truncate hover:underline cursor-pointer" onClick={handleWhatsApp}>Share Code to WhatsApp</p>
            </div>
            <button onClick={handleWhatsApp} className="p-2 text-gray-300 hover:text-[#25D366] transition-colors shrink-0">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button 
            onClick={() => { hapticFeedback('light'); setActiveTab('features'); }}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'features' ? 'bg-[#1A2130] dark:bg-white text-white dark:text-[#1A2130] shadow-lg' : 'bg-white dark:bg-white/5 text-gray-400'}`}
          >
            Features
          </button>
          <button 
            onClick={() => { hapticFeedback('light'); setActiveTab('activities'); }}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'activities' ? 'bg-[#1A2130] dark:bg-white text-white dark:text-[#1A2130] shadow-lg' : 'bg-white dark:bg-white/5 text-gray-400'}`}
          >
            Activities
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'features' ? (
              <motion.div 
                key="features"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#1A2130] dark:text-white">Things to do as a Tribe</h4>
                  <p className="text-xs text-gray-400">Do more in your Tribe, split bills, save together etc</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => { hapticFeedback('medium'); onSelectFeature('ajo'); }}
                    className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[40px] p-8 text-left relative overflow-hidden shadow-xl active:scale-[0.98] transition-all group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-active:opacity-80" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-white/10">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ajo" alt="Ajo" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center text-white">
                          <Plus size={16} />
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xl font-bold text-white">Set up Circle/Ajo/Esusu</h5>
                        <p className="text-white/60 text-xs mt-1">Set up savings rotation for your Tribe</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { 
                      hapticFeedback('medium'); 
                      toast.info("Split Bills feature is coming in the next update!"); 
                    }}
                    className="w-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[40px] p-8 text-left relative overflow-hidden shadow-xl active:scale-[0.98] transition-all group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-active:opacity-80" />
                    <div className="relative z-10 space-y-4">
                      <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center text-white">
                        <Zap size={18} />
                      </div>
                      <div>
                        <h5 className="text-xl font-bold text-white">Split Group Bills</h5>
                        <p className="text-white/60 text-xs mt-1">Split pizza, rent, or utilities instantly</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="activities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                 <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#1A2130] dark:text-white">Tribe Ledger</h4>
                  <p className="text-xs text-gray-400">Recent activity in {tribe.name}</p>
                </div>
                
                <div className="bg-white dark:bg-[#1A2130] rounded-[32px] p-6 shadow-sm border border-gray-50 dark:border-white/5 h-48 flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
                     <History size={24} />
                   </div>
                   <p className="text-[13px] text-gray-400 font-medium text-center px-8">No recent activities on the ledger. Start a Circle or split a bill to get started.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TribeScreen;