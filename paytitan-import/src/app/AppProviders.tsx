"use client";

import React from 'react';
import { ThemeProvider } from "next-themes";
import { PayTitanProvider, usePayTitan } from "../context/PayTitanContext";
import { RealtimeNotificationListener } from "../components/RealtimeNotificationListener";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import RewardPopup from "../components/paytitan/RewardPopup";
import InAppNotification from "../components/paytitan/InAppNotification";
import { Toaster } from "sonner";

const GlobalOverlays = () => {
  const { 
    rewardQueue, 
    closeRewardPopup, 
    activeNotification, 
    closeNotification 
  } = usePayTitan();
  
  const currentReward = rewardQueue[0];

  return (
    <>
      <RewardPopup 
        isOpen={!!currentReward}
        onClose={closeRewardPopup}
        amount={currentReward?.amount || 0}
        title={currentReward?.title || ''}
        description={currentReward?.description || ''}
      />
      <InAppNotification 
        notification={activeNotification}
        onClose={closeNotification}
      />
    </>
  );
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <PayTitanProvider>
        {mounted && (
          <>
            <ServiceWorkerRegistration />
            <RealtimeNotificationListener />
            <GlobalOverlays />
          </>
        )}
        <Toaster 
          position="top-center" 
          toastOptions={{
            className: "bg-[#1A2130]/90 backdrop-blur-xl border border-white/10 text-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] font-sans px-4 py-3 font-semibold",
            duration: 4000,
            style: {
              padding: '12px 16px',
            }
          }}
        />
        {children}
      </PayTitanProvider>
    </ThemeProvider>
  );
}
