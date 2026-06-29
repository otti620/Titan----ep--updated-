"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Zap, Shield, Users, Sparkles, ChevronRight, Mail, Instagram, Twitter } from 'lucide-react';
import { hapticFeedback } from '../../../lib/utils';
import PayTitanLogo from '../PayTitanLogo';

interface TitanMissionScreenProps {
  onBack: () => void;
}

const TitanMissionScreen = ({ onBack }: TitanMissionScreenProps) => {
  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full -ml-20 -mb-20" />
      
      {/* Navigation */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30">
        <button onClick={onBack} className="text-foreground/80 flex flex-row items-center gap-1 active:opacity-60 transition-opacity z-10 w-20">
          <ArrowLeft size={22} strokeWidth={2.5} /> 
          <span className="text-[15px] font-bold tracking-tight">Back</span>
        </button>
        
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">The Blueprint</span>

        <div className="z-10 w-20 flex justify-end" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
        <div className="px-8 pt-10 pb-6 text-center flex flex-col items-center">
          {/* Logo & Manifesto */}
          <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[32px] flex items-center justify-center shadow-2xl border border-black/5 dark:border-white/10 mb-8 relative">
             <div className="absolute inset-0 rounded-[32px] border-2 border-indigo-500 animate-pulse opacity-20" />
             <PayTitanLogo size={48} />
          </div>

          <h1 className="text-[42px] font-black text-foreground tracking-tighter leading-tight italic mb-6">
            Democratizing the Future of Wealth.
          </h1>
          
          <div className="space-y-6 text-left">
            <p className="text-[16px] text-muted-foreground font-medium leading-relaxed">
               PayTitan isn't just a fintech app. It's a social architecture designed to reclaim financial sovereignty. We believe wealth shouldn't be a privilege, but a basic human right architected through code.
            </p>
            
            <p className="text-[16px] text-muted-foreground font-medium leading-relaxed">
               Our mission is to build the world's most transparent, community-driven financial ecosystem. No jargon. No hidden fees. Just pure, unadulterated financial engineering.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 gap-4 w-full mt-12">
             <PillarCard 
               icon={Shield} 
               title="Radical Transparency" 
               desc="Our real-time audit engine ensures every node in our network is verifiable and immune to centralized bias."
             />
             <PillarCard 
               icon={Zap} 
               title="Social Engineering" 
               desc="Banking is inherently social. We build tools that empower communities to save, invest, and grow together."
             />
             <PillarCard 
               icon={Globe} 
               title="Global Architecture" 
               desc="A borderless financial mesh that connects the unbanked to the future of decentralized wealth."
             />
          </div>

          {/* Meetups CTA */}
          <div className="mt-12 w-full p-8 rounded-[40px] bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[40px] rounded-full" />
             <div className="relative z-10 text-center">
                <Sparkles size={32} className="mx-auto mb-4 text-amber-300" />
                <h3 className="text-[20px] font-black italic mb-2 uppercase tracking-tight">Titan Meetups</h3>
                <p className="text-[14px] font-medium text-white/80 mb-6">
                   Join us for exclusive "Coffee with the Founders" events in Lagos, Nairobi, and London.
                </p>
                <button className="h-14 w-full bg-white text-indigo-600 rounded-full font-black uppercase tracking-widest text-[12px] active:scale-95 transition-all">
                   Join the Guestlist
                </button>
             </div>
          </div>

          {/* Social Links */}
          <div className="mt-12 w-full">
             <div className="flex justify-center gap-6 mb-8">
                <SocialIcon icon={Twitter} />
                <SocialIcon icon={Instagram} />
                <SocialIcon icon={Mail} />
             </div>
             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                Architected in Lagos • v2.4.0
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PillarCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="glass-card rounded-[32px] p-6 text-left border border-black/5 dark:border-white/10">
    <div className="w-12 h-12 rounded-[18px] bg-white dark:bg-white/10 flex items-center justify-center text-indigo-500 shadow-sm mb-4">
      <Icon size={24} strokeWidth={2} />
    </div>
    <h3 className="text-[18px] font-black text-foreground mb-2 italic">{title}</h3>
    <p className="text-[14px] text-muted-foreground font-medium leading-snug">{desc}</p>
  </div>
);

const SocialIcon = ({ icon: Icon }: { icon: any }) => (
  <button className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground hover:text-indigo-500 active:scale-90 transition-all">
    <Icon size={20} strokeWidth={2} />
  </button>
);

export default TitanMissionScreen;
