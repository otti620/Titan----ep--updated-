"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from '@/components/paytitan/SplashScreen';
import OnboardingScreen from '@/components/paytitan/OnboardingScreen';
import LoginScreen from '@/components/paytitan/LoginScreen';
import SignupScreen from '@/components/paytitan/SignupScreen';
import MainAppShell from '@/components/paytitan/MainAppShell';
import BannedScreen from '@/components/paytitan/BannedScreen';
import AppLockScreen from '@/components/paytitan/AppLockScreen';
import NativeAppShell from '@/components/paytitan/NativeAppShell';
import { supabase } from '@/integrations/supabase/client';
import { usePayTitan } from '@/context/PayTitanContext';

export type AppScreen = 'splash' | 'onboarding' | 'login' | 'signup' | 'main' | 'banned' | 'locked';

export default function PayTitanApp() {
  const { session, isAuthReady, profile } = usePayTitan();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [isLocked, setIsLocked] = useState(false);
  const [isSplashScreenDone, setIsSplashScreenDone] = useState(false);
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Visibility change listener to auto-lock the app if minimized
    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem('pt_last_active', Date.now().toString());
      } else {
        // App is visible again
        const lastActive = localStorage.getItem('pt_last_active');
        if (lastActive && session) {
          const timeGone = Date.now() - parseInt(lastActive, 10);
          // lock if gone for more than 15 seconds
          if (timeGone > 15000) {
            setIsLocked(true);
            sessionStorage.removeItem('pt_was_unlocked');
          }
        }
      }
    };

    const handleBlur = () => {
      localStorage.setItem('pt_last_active', Date.now().toString());
    };

    const handleFocus = () => {
      const lastActive = localStorage.getItem('pt_last_active');
      if (lastActive && session) {
        const timeGone = Date.now() - parseInt(lastActive, 10);
        if (timeGone > 15000) {
          setIsLocked(true);
          sessionStorage.removeItem('pt_was_unlocked');
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session]);

  useEffect(() => {
    if (!isAuthReady || !isSplashScreenDone) return;

    // Do NOT interrupt the user if they are currently filling out onboarding signup or login steps
    if (currentScreen === 'signup' || currentScreen === 'login') return;

    if (session) {
      if (!profile) return; // Wait for profile to load

      if (profile.is_banned) {
        setCurrentScreen('banned');
      } else if (profile.kyc_level === 0 || profile.kyc_status === 'unverified' || !profile.kyc_status) {
        setCurrentScreen('signup');
      } else {
        // Automatically lock on initial load if session exists
        if (!isLocked) {
          const wasLocked = sessionStorage.getItem('pt_was_unlocked');
          if (!wasLocked) {
            setIsLocked(true);
          } else {
            setCurrentScreen('main');
          }
        }
      }
    } else {
      setCurrentScreen('onboarding');
      setIsLocked(false);
      sessionStorage.removeItem('pt_was_unlocked');
    }
  }, [isAuthReady, session, profile, isLocked, isSplashScreenDone, currentScreen]);

  useEffect(() => {
    if (session && !profile?.is_banned) {
      // Do NOT interrupt the user if they are currently filling out onboarding signup or login steps
      if (currentScreen === 'signup' || currentScreen === 'login') return;

      if (profile && (profile.kyc_level === 0 || profile.kyc_status === 'unverified' || !profile.kyc_status)) {
        setCurrentScreen('signup');
        return;
      }

      if (isLocked) {
        setCurrentScreen('locked');
      } else {
        setCurrentScreen('main');
      }
    }
  }, [isLocked, session, profile, currentScreen]);

  const handleUnlock = () => {
    setIsLocked(false);
    sessionStorage.setItem('pt_was_unlocked', 'true');
    setCurrentScreen('main');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentScreen('login');
    setIsLocked(false);
    sessionStorage.removeItem('pt_was_unlocked');
  };

  return (
    <NativeAppShell>
      <div className="fixed inset-0 h-[100dvh] w-full max-w-md mx-auto bg-black overflow-hidden shadow-2xl font-sans">
        <AnimatePresence mode="popLayout">
          {currentScreen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-50"
            >
              <SplashScreen onComplete={() => setIsSplashScreenDone(true)} />
            </motion.div>
          )}

          {currentScreen === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-40"
            >
              <OnboardingScreen 
                onComplete={() => setCurrentScreen('login')} 
                onSignup={() => setCurrentScreen('signup')} 
              />
            </motion.div>
          )}

          {currentScreen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30"
            >
              <LoginScreen 
                onLogin={() => { 
                  if (profile && (profile.kyc_level === 0 || profile.kyc_status === 'unverified' || !profile.kyc_status)) {
                    setCurrentScreen('signup');
                  } else {
                    setCurrentScreen('main'); 
                    setIsLocked(false); 
                    sessionStorage.setItem('pt_was_unlocked', 'true'); 
                  }
                }} 
                onSignup={() => setCurrentScreen('signup')} 
              />
            </motion.div>
          )}

          {currentScreen === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30"
            >
              <SignupScreen 
                initialStep={session ? 4 : 1}
                onComplete={() => { setCurrentScreen('main'); setIsLocked(false); sessionStorage.setItem('pt_was_unlocked', 'true'); }} 
                onLogin={() => setCurrentScreen('login')} 
              />
            </motion.div>
          )}

          {currentScreen === 'banned' && (
            <motion.div
              key="banned"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50"
            >
              <BannedScreen />
            </motion.div>
          )}

          {currentScreen === 'locked' && (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-[60]" // Higher z-index to overlay nicely
            >
              <AppLockScreen onUnlock={handleUnlock} />
            </motion.div>
          )}

          {currentScreen === 'main' && session && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20"
            >
              <MainAppShell onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NativeAppShell>
  );
}