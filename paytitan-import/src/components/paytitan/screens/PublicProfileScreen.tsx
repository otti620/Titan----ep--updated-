"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, HandCoins, ShieldCheck, Star, Calendar, Share2, MessageSquare } from 'lucide-react';
import { Profile } from '../../../context/PayTitanContext';
import { hapticFeedback, safeShare, cn } from '../../../lib/utils';
import { toast } from 'sonner';

interface PublicProfileScreenProps {
  user: Profile;
  onBack: () => void;
  onSend: (handle: string) => void;
  onRequest: (handle: string) => void;
}

const PublicProfileScreen = ({ user, onBack, onSend, onRequest }: PublicProfileScreenProps) => {
  const fullName = `${user.first_name} ${user.last_name}`;
  const trustScore = 500 + (user.kyc_level * 200) + (user.referral_count || 0 * 10);
  
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

  const handleShare = async () => {
    hapticFeedback('light');
    const text = `Check out ${fullName} on PayTitan! Use @${user.username} to send money instantly. https://paytitan.com/${user.username}`;
    const result = await safeShare({
      title: `${fullName} on PayTitan`,
      text,
    }, text);

    if (result === 'copied') {
      toast.success("Profile link copied!");
    }
  };

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
           <span className="headline tracking-tight">Titan Page</span>
        </div>
        <div className="w-20 flex justify-end">
          <button 
            onClick={handleShare}
            className="text-indigo-500 active:opacity-60 transition-opacity"
          >
            <Share2 size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-6">
          <div ref={sentinelRef} className="h-1 w-full" />
          
          <div className="flex flex-col items-center text-center pt-4">
            <div className="relative mb-6">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-border shadow-sm bg-black/5 dark:bg-white/5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}`} alt={fullName} className="w-full h-full object-cover" />
              </div>
              {user.kyc_level > 0 && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center">
                  <ShieldCheck size={18} strokeWidth={2} className="text-white" />
                </div>
              )}
            </div>
            
            <h2 className="title-1 font-bold text-foreground tracking-tight">{fullName}</h2>
            <p className="subheadline font-semibold text-indigo-500 mt-1">@{user.username}</p>
            
            <div className="flex items-center gap-6 mt-6">
              <div className="flex flex-col items-center">
                <span className="title-2 font-bold text-foreground tabular-nums tracking-tight">{trustScore}</span>
                <span className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mt-1">Trust Score</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col items-center">
                <span className="title-2 font-bold text-foreground uppercase tracking-tight">{user.user_tier || 'Basic'}</span>
                <span className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mt-1">Tier</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col items-center">
                <span className="title-2 font-bold text-foreground tabular-nums tracking-tight">{user.referral_count || 0}</span>
                <span className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest mt-1">Invites</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button 
              onClick={() => { hapticFeedback('medium'); onSend(user.username); }}
              className="bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring"
            >
              <Send size={20} strokeWidth={2} /> Send
            </button>
            <button 
              onClick={() => { hapticFeedback('medium'); onRequest(user.username); }}
              className="bg-card border border-border text-foreground py-3.5 rounded-full headline shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring"
            >
              <HandCoins size={20} strokeWidth={2} /> Request
            </button>
          </div>

          <div className="space-y-2 mt-8">
            <h3 className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2 mb-2">TITAN INSIGHTS</h3>
            <div className="ios-list-group px-0">
              <div className="flex items-center gap-4 px-4 py-3 ios-hairline-bottom">
                <div className="w-10 h-10 bg-blue-500/10 rounded-[10px] flex items-center justify-center text-blue-500">
                  <Calendar size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="body font-semibold text-foreground">Titan Member</p>
                  <p className="caption-1 text-muted-foreground mt-0.5">PayTitan Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-[10px] flex items-center justify-center text-orange-500">
                  <Star size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="body font-semibold text-foreground">Active Networker</p>
                  <p className="caption-1 text-muted-foreground mt-0.5">Connected to {user.followers_count || 0} Titans</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full py-4 bg-black/5 dark:bg-white/5 rounded-full text-foreground headline flex items-center justify-center gap-2 active:scale-95 transition-transform ios-spring">
              <MessageSquare size={18} strokeWidth={2} /> Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileScreen;