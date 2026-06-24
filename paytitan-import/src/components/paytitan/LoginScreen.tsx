"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import PayTitanLogo from './PayTitanLogo';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../lib/utils';

const LoginScreen = ({ onLogin, onSignup }: { onLogin: () => void, onSignup: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      hapticFeedback('error');
      toast.error(error.message);
    } else {
      hapticFeedback('success');
      import('../../lib/notifications').then(module => {
        module.sendAppNotification(
          "Welcome Back", 
          "Successfully signed into PayTitan.", 
          "🚀"
        );
      });
      onLogin();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col px-5 pt-12 pb-8 text-foreground">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-10 pt-4">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-[28px] flex items-center justify-center mb-4 shadow-sm border border-indigo-500/20">
          <PayTitanLogo size={45} className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        </div>
        <h1 className="title-1 tracking-tight text-foreground">PayTitan</h1>
        <p className="caption-2 font-bold text-indigo-500 uppercase tracking-widest mt-1">Financial Architect</p>
      </div>

      {/* Welcome Text */}
      <div className="mb-8 px-2">
        <h2 className="large-title tracking-tight mb-2">Welcome</h2>
        <p className="subheadline text-muted-foreground font-medium">Sign in to your dashboard.</p>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div className="ios-list-group space-y-0 relative">
          <div className="px-4 py-3 ios-hairline-bottom flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
               <Mail className="w-4 h-4 text-muted-foreground" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Email</p>
               <input 
                  type="email" 
                  placeholder="titan@paytitan.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
               />
             </div>
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
               <Lock className="w-4 h-4 text-muted-foreground" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Password</p>
               <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
               />
             </div>
             <button 
               onClick={() => { hapticFeedback('light'); setShowPassword(!showPassword); }}
               className="p-2 -mr-2 text-muted-foreground active:opacity-60 transition-opacity"
             >
               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
             </button>
          </div>
        </div>

        <div className="flex justify-end px-4">
          <button onClick={() => hapticFeedback('light')} className="caption-1 font-semibold text-indigo-500 uppercase tracking-widest active:opacity-60 transition-opacity">
            Forgot Password?
          </button>
        </div>

        <button
          onClick={() => { hapticFeedback('medium'); handleLogin(); }}
          disabled={isLoading}
          className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring disabled:opacity-50 mt-8 flex items-center justify-center gap-2"
        >
          {isLoading ? "Authenticating..." : "Sign In"} <ArrowRight size={20} />
        </button>

        <button 
          onClick={() => { hapticFeedback('light'); onSignup(); }} 
          className="w-full bg-card text-foreground py-3.5 rounded-full headline shadow-sm border border-border active:scale-95 transition-transform ios-spring mt-4 flex items-center justify-center"
        >
          Create New Account
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center pb-[env(safe-area-inset-bottom,20px)]">
        <p className="caption-1 font-semibold text-muted-foreground/60">
          Secure Environment
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;