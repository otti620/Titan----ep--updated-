"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ArrowRight, Shield, CheckCircle2, Lock, Eye, EyeOff, Phone, Delete, Loader2, XCircle, Gift } from 'lucide-react';
import PayTitanLogo from './PayTitanLogo';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../lib/utils';
import { usePayTitan } from '../../context/PayTitanContext';
import LegalScreen from './LegalScreen';

const SignupScreen = ({ onComplete, onLogin, initialStep }: { onComplete: () => void, onLogin: () => void, initialStep?: number }) => {
  const { checkUsername, session } = usePayTitan();
  const [step, setStep] = useState(initialStep || (session ? 4 : 1));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [showLegal, setShowLegal] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    username: '',
    phone: '',
    kycType: 'bvn',
    kycNumber: '',
    referralCode: ''
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.username.length >= 3) {
        setUsernameStatus('checking');
        const isAvailable = await checkUsername(formData.username);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
      } else {
        setUsernameStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleNext = () => {
    hapticFeedback('medium');
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.username || !formData.phone) {
        toast.error("Please complete your profile details");
        return;
      }
      if (usernameStatus !== 'available') {
        toast.error("Please choose an available Titan handle");
        return;
      }
      setStep(3);
    }
  };

  const handlePinPress = (num: string) => {
    if (pin.length < 4) {
      hapticFeedback('light');
      const newPin = pin + num;
      setPin(newPin);
    }
  };

  useEffect(() => {
    if (pin.length === 4 && step === 3 && !isLoading) {
      handleSignup();
    }
  }, [pin, step, isLoading]);

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const [firstName, ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: formData.username.toLowerCase(),
            phone: formData.phone,
            pin: pin,
            kyc_status: 'pending',
            kyc_level: 0
          }
        }
      });

      if (error) {
        hapticFeedback('error');
        toast.error(error.message);
        setPin('');
      } else {
        // Success: Handle referral bonus if code provided
        if (formData.referralCode) {
          const { data: signUpData } = await supabase.auth.getUser();
          if (signUpData.user) {
            await supabase.rpc('process_referral_bonus', {
              p_new_user_id: signUpData.user.id,
              p_referral_code: formData.referralCode
            });
          }
        }
        
        hapticFeedback('success');
        setStep(4);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycSubmit = async () => {
    if (formData.kycNumber.length !== 11 || !/^\d+$/.test(formData.kycNumber)) {
      toast.error(`Please enter a valid 11-digit ${formData.kycType.toUpperCase()}`);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            kyc_status: 'approved',
            kyc_level: 1,
            [formData.kycType]: formData.kycNumber
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        hapticFeedback('success');
        setStep(6); // Success confetti
      }
    } catch (err) {
      toast.error("Failed to verify KYC.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-y-auto w-full bg-background flex flex-col px-5 pt-12 pb-8 text-foreground">
      {step < 4 && (
        <div className="flex justify-center mb-8 pb-4">
          <div className="bg-indigo-500/10 px-4 py-2 rounded-full flex items-center gap-2 border border-indigo-500/20">
            <PayTitanLogo size={18} className="text-indigo-500" />
            <span className="text-indigo-500 font-bold subtitle tracking-tight uppercase">PayTitan</span>
          </div>
        </div>
      )}

      {step < 4 && (
        <div className="text-center mb-8 px-2">
          <h2 className="large-title tracking-tight mb-2">
            {step === 1 ? "Create Account" : step === 2 ? "Identity Setup" : "Security PIN"}
          </h2>
          <p className="subheadline text-muted-foreground font-medium">
            {step === 1 ? "Join the elite financial network today." : 
             step === 2 ? "Choose your unique Titan handle." :
             "Set a 4-digit PIN for transactions."}
          </p>
        </div>
      )}

      {step < 4 && (
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-indigo-500" : "w-1.5 bg-black/10 dark:bg-white/20"
              )} 
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="ios-list-group space-y-0 relative">
              <div className="px-4 py-3 ios-hairline-bottom flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                   <User className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Full Name</p>
                   <input 
                      type="text" 
                      placeholder="Alex Titan" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
                   />
                 </div>
              </div>
              
              <div className="px-4 py-3 ios-hairline-bottom flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                   <Mail className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Email</p>
                   <input 
                      type="email" 
                      placeholder="hello@paytitan.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
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

            <button
              onClick={handleNext}
              className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring mt-4 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={20} />
            </button>

            <button onClick={() => { hapticFeedback('light'); onLogin(); }} className="w-full text-center subheadline font-semibold text-muted-foreground mt-4 active:opacity-60 transition-opacity">
              Already have an account? <span className="text-indigo-500">Login</span>
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="ios-list-group space-y-0 relative">
              <div className="px-4 py-3 ios-hairline-bottom flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                   <span className="text-indigo-500 font-bold subtitle tracking-tight">@</span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Titan Handle</p>
                   <input 
                      type="text" 
                      placeholder="alex.titan" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '')})}
                      className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
                   />
                 </div>
                 <div className="shrink-0 flex items-center">
                    {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
                    {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-[#34C759]" />}
                    {usernameStatus === 'taken' && <XCircle className="w-5 h-5 text-[#FF3B30]" />}
                 </div>
              </div>
              
              <div className="px-4 py-3 ios-hairline-bottom flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                   <Phone className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Phone Number</p>
                   <input 
                      type="tel" 
                      placeholder="0801 234 5678" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
                   />
                 </div>
              </div>

              <div className="px-4 py-3 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                   <Gift className="w-4 h-4 text-indigo-500" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Referral Code (Optional)</p>
                   <input 
                      type="text" 
                      placeholder="TITAN-XXXXXX" 
                      value={formData.referralCode}
                      onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})}
                      className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
                   />
                 </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-indigo-500 text-white py-3.5 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring mt-4 flex items-center justify-center gap-2"
            >
              Set Security PIN <ArrowRight size={20} />
            </button>

            <button onClick={() => { hapticFeedback('light'); setStep(1); }} className="w-full text-center subheadline font-semibold text-muted-foreground mt-4 active:opacity-60 transition-opacity">
              Go Back
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center"
          >
            <div className="flex justify-center gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-200",
                    pin.length >= i ? "bg-indigo-500 border-indigo-500 scale-125 shadow-sm" : "border-muted-foreground/30"
                  )} 
                />
              ))}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest">Architecting Account...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-[280px] mx-auto mb-10 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button 
                    key={num}
                    onClick={() => handlePinPress(num.toString())}
                    className="aspect-square rounded-full flex flex-col items-center justify-center bg-card shadow-sm border border-border active:bg-indigo-500 active:text-white transition-colors title-2 font-semibold text-foreground group"
                  >
                    {num}
                  </button>
                ))}
                <div className="aspect-square" />
                <button 
                  onClick={() => handlePinPress('0')}
                  className="aspect-square rounded-full flex flex-col items-center justify-center bg-card shadow-sm border border-border active:bg-indigo-500 active:text-white transition-colors title-2 font-semibold text-foreground"
                >
                  0
                </button>
                <button 
                  onClick={() => { hapticFeedback('light'); setPin(pin.slice(0, -1)); }}
                  className="aspect-square rounded-full flex flex-col items-center justify-center text-muted-foreground active:text-foreground transition-colors"
                >
                  <Delete size={28} />
                </button>
              </div>
            )}

            <button 
              onClick={() => { hapticFeedback('light'); setStep(2); }} 
              disabled={isLoading}
              className="caption-1 font-semibold text-muted-foreground uppercase tracking-widest active:opacity-60 transition-opacity"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center flex-1 py-4 justify-center"
          >
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-500 mb-6 mt-4">You're almost there🚀</h2>
            
            <div className="relative w-40 h-40 mb-8">
               {/* Simplified representation of the provided KYC illustration */}
               <div className="absolute inset-0 bg-emerald-500/5 rounded-[30px] rotate-6" />
               <div className="absolute inset-4 bg-teal-500/10 rounded-[24px] -rotate-3" />
               <div className="absolute inset-6 bg-card rounded-[18px] shadow-lg border border-border flex flex-col items-center justify-center p-3">
                 <Shield className="w-10 h-10 text-emerald-500 mb-1" />
                 <div className="w-8 h-1.5 bg-muted rounded-full mb-0.5" />
                 <div className="w-12 h-1.5 bg-muted rounded-full mb-3" />
                 <div className="px-3 py-1 bg-border rounded-full text-[8px] font-bold text-muted-foreground">SUBMIT</div>
               </div>
            </div>

            <h3 className="title-3 tracking-tight text-foreground font-bold mb-3">KYC Submission</h3>
            <p className="body text-muted-foreground leading-relaxed text-center px-4 mb-8">
              Complete active KYC verification in seconds to generate your custom Titan current account number and activate instant secure payments, investments, and card products in compliance with CBN regulations.
            </p>

            <button
              onClick={() => { hapticFeedback('medium'); setStep(5); }}
              className="w-full bg-[#113220] hover:bg-[#1f5638] text-white py-4 rounded-full headline shadow-sm active:scale-95 transition-all ios-spring mt-4"
            >
              Start Verification
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-10"
          >
            <div className="text-center mb-8 px-2">
              <h2 className="large-title tracking-tight mb-2">Verify Identity</h2>
              <p className="subheadline text-muted-foreground font-medium">
                To generate your account number.
              </p>
            </div>

            <div className="ios-list-group space-y-0 relative">
              {/* KYC Document Type Segmented Control */}
              <div className="px-4 py-3 ios-hairline-bottom flex flex-col gap-2">
                <p className="caption-2 font-semibold text-muted-foreground uppercase tracking-widest">KYC Document Type</p>
                <div className="grid grid-cols-2 gap-1 bg-black/[0.04] dark:bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { hapticFeedback('light'); setFormData({...formData, kycType: 'bvn'}); }}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold transition-all",
                      formData.kycType === 'bvn' 
                        ? "bg-indigo-500 text-white shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-black/[0.02]"
                    )}
                  >
                    Bank Verification (BVN)
                  </button>
                  <button
                    type="button"
                    onClick={() => { hapticFeedback('light'); setFormData({...formData, kycType: 'nin'}); }}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold transition-all",
                      formData.kycType === 'nin' 
                        ? "bg-indigo-500 text-white shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-black/[0.02]"
                    )}
                  >
                    National Identity (NIN)
                  </button>
                </div>
              </div>

              {/* KYC Number Input Field */}
              <div className="px-4 py-3 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                   <Shield className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="caption-2 font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">
                     {formData.kycType === 'bvn' ? '11-Digit BVN' : '11-Digit NIN'}
                   </p>
                   <input 
                      type="text" 
                      maxLength={11}
                      placeholder={formData.kycType === 'bvn' ? "222XXXXXXXX" : "102XXXXXXXX"} 
                      value={formData.kycNumber}
                      onChange={(e) => setFormData({...formData, kycNumber: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-transparent border-none p-0 body text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none font-mono tracking-widest"
                   />
                 </div>
              </div>
            </div>

            <button
              onClick={handleKycSubmit}
              disabled={isLoading}
              className="w-full bg-[#113220] flex items-center justify-center text-white py-4 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
            </button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center flex-1 justify-center relative overflow-hidden"
          >
            {/* Confetti effect background simple simulation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 w-2 h-2 bg-red-500 rounded-full animate-bounce" />
              <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              <div className="absolute bottom-40 left-20 w-2 h-6 bg-yellow-400 rotate-45" />
              <div className="absolute top-40 right-10 w-2 h-2 bg-emerald-500 rounded-full" />
              <div className="absolute bottom-20 right-30 w-3 h-3 bg-purple-500 rotate-12" />
            </div>

            <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mb-8 rotate-12">
              <Gift className="w-12 h-12 text-emerald-500" />
            </div>

            <h2 className="text-4xl font-black tracking-tight text-foreground text-center mb-4 leading-tight">
              Hey my love,<br/>
              welcome to Titan.
            </h2>

            <div className="bg-card border border-border p-5 rounded-2xl w-full text-center space-y-1 mb-8 shadow-sm">
               <p className="caption-2 text-muted-foreground uppercase tracking-widest font-semibold">Your New Account</p>
               <p className="text-2xl font-mono font-bold tracking-widest">{Math.floor(8000000000 + Math.random() * 900000000)}</p>
               <p className="caption-1 text-muted-foreground">Providus Bank</p>
            </div>

            <p className="subheadline text-muted-foreground text-center italic mb-10">
              With love from Gospel Otti and the team
            </p>

            <button
              onClick={() => { hapticFeedback('success'); onComplete(); }}
              className="w-full bg-[#113220] text-white py-4 rounded-full headline shadow-sm active:scale-95 transition-transform ios-spring"
            >
              Continue to app
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(step < 4) && (
        <div className="mt-8 text-center relative z-20 pb-[env(safe-area-inset-bottom,20px)]">
          <p className="caption-2 text-muted-foreground font-semibold leading-relaxed mb-6">
            By continuing, you agree to PayTitan's <button onClick={() => { hapticFeedback('light'); setShowLegal(true); }} className="text-indigo-500 active:opacity-60 transition-opacity outline-none font-bold">Terms of Service</button> and <button onClick={() => { hapticFeedback('light'); setShowLegal(true); }} className="text-indigo-500 active:opacity-60 transition-opacity outline-none font-bold">Privacy Policy</button>.
          </p>
          <div className="flex items-center justify-center gap-1.5 caption-2 font-bold text-muted-foreground/50 uppercase tracking-widest">
            <Shield size={14} /> SECURITY PROTOCOL AES-256
          </div>
        </div>
      )}

      <AnimatePresence>
        {showLegal && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-background"
          >
            <LegalScreen onClose={() => setShowLegal(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupScreen;