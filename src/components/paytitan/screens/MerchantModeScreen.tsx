"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, ShieldCheck, ClipboardCheck, 
  Sparkles, AtSign, Globe, CheckCircle2, FileText, Send
} from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback } from '../../../lib/utils';
import { toast } from 'sonner';

const MerchantModeScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, toggleMerchantMode } = usePayTitan();
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('retail');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessNamePlaceholder = profile?.first_name 
    ? `${profile.first_name}'s Enterprise` 
    : "Your Business Name";

  const handleSubmitWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback('medium');
    
    const finalBusinessName = businessName.trim() || businessNamePlaceholder;
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      hapticFeedback('success');
      toast.success("Merchant pre-registration received successfully!", {
        description: "Your business is now queued for regulatory review."
      });
    }, 1200);
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#08080C] flex flex-col relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-white dark:bg-black/40 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase italic">BUSINESS HUB</span>
          <span className="text-base font-bold text-foreground">Merchant Settlement</span>
        </div>
        <button onClick={toggleMerchantMode} className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center border border-indigo-500/20 active:scale-95 transition-all">
          <AtSign size={18} />
        </button>
      </div>

      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-32 pt-4 no-scrollbar">
        {/* Compliance Status Badge */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Regulatory Underwriting Pending</p>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed font-medium">
              We are finalizing our corporate onboarding integration with our Banking-as-a-Service (BaaS) and primary license partners. Business accounts will be available immediately upon final regulatory clearance.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center py-6 space-y-2">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-[22px] flex items-center justify-center text-indigo-500 mx-auto">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Launch Your Merchant Store</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
            Accept instantly-settled payments, invoice customers, and integrate PayTitan APIs with complete peace of mind.
          </p>
        </div>

        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/5 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">Interest Successfully Registered!</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Thank you for applying. Your corporate profile has been added to our underwriting waitlist. You are position <span className="font-bold text-indigo-500">#1,492</span> in line.
              </p>
            </div>
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Our compliance team will reach out via email once onboarding opens.
            </div>
            <button 
              onClick={onBack}
              className="w-full bg-indigo-500 text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Return to Personal Dashboard
            </button>
          </motion.div>
        ) : (
          /* Underwriting Checklist & Pre-registration Form */
          <div className="space-y-6">
            {/* Regulatory Checklist Card */}
            <div className="bg-white dark:bg-white/5 border border-border rounded-3xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <ClipboardCheck size={14} className="text-indigo-500" /> Required Corporate Documents
              </h3>
              <div className="space-y-3">
                <ChecklistRow icon={<FileText size={14} />} title="CAC Registration details (RC Number)" desc="For verified business verification" />
                <ChecklistRow icon={<ShieldCheck size={14} />} title="Director's BVN & NIN credentials" desc="Required for commercial identity check" />
                <ChecklistRow icon={<Globe size={14} />} title="SCUML Certificate / AML Compliance" desc="Required for designated non-financial businesses" />
              </div>
            </div>

            {/* Interest Form */}
            <form onSubmit={handleSubmitWaitlist} className="bg-white dark:bg-white/5 border border-border rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-500" /> Pre-Register Interest
                </h3>
                <p className="text-xs text-muted-foreground">Submit your business profile for early underwriting queue placement.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Legal Name</label>
                  <input 
                    type="text" 
                    placeholder={businessNamePlaceholder} 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full h-11 bg-muted/30 dark:bg-white/5 border border-border rounded-xl px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Industry Classification</label>
                  <select 
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full h-11 bg-muted/30 dark:bg-white/5 border border-border rounded-xl px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
                  >
                    <option value="retail">Retail / Physical Store</option>
                    <option value="ecommerce">E-commerce / Digital Business</option>
                    <option value="fintech">Financial / Tech Services</option>
                    <option value="hospitality">Hospitality & Food Services</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1A2130] dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm hover:opacity-95"
              >
                {isSubmitting ? "Queuing Profile..." : (
                  <>
                    Submit For Underwriting <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const ChecklistRow = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-lg bg-indigo-500/5 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/10">
      {icon}
    </div>
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-foreground leading-normal">{title}</p>
      <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
    </div>
  </div>
);

export default MerchantModeScreen;
