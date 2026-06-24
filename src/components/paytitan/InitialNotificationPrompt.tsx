import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { setupNotifications, sendAppNotification } from '../../lib/notifications';
import { hapticFeedback } from '../../lib/utils';

export default function InitialNotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if we're in a browser and haven't dismissed
    if (typeof window !== 'undefined') {
      const hasDismissed = localStorage.getItem('pt_dismissed_notifications');
      
      let isDefault = true;
      if ('Notification' in window) {
        isDefault = Notification.permission === 'default';
      }

      if (!hasDismissed && isDefault) {
        // Delay presentation so it doesn't overwhelm the user immediately
        const timer = setTimeout(() => setShow(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    hapticFeedback('medium');
    const granted = await setupNotifications();
    if (granted) {
      setShow(false);
      localStorage.setItem('pt_dismissed_notifications', 'true');
      sendAppNotification('All Set!', 'You will now receive automatic notifications for transfers and daily rewards.', '🎉');
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    hapticFeedback('light');
    localStorage.setItem('pt_dismissed_notifications', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 left-4 right-4 z-[9999] bg-[#1A2130] text-white p-6 rounded-[32px] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Background embellishment */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] rounded-full blur-[80px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-2"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FF4D1C]/20 border border-[#FF4D1C]/30 text-[#FF4D1C] rounded-full flex items-center justify-center mb-4">
                <Bell size={32} />
              </div>
              
              <h3 className="font-bold text-2xl mb-2 tracking-tight">Turn on Notifications</h3>
              <p className="text-white/70 text-[15px] mb-6 leading-relaxed px-2">
                Don't miss out! Get instantly alerted about successful transfers, daily rewards, and circle updates.
              </p>

              <button 
                onClick={handleEnable}
                className="w-full bg-[#FF4D1C] text-white font-bold py-4 rounded-2xl text-[16px] active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(255,77,28,0.2)]"
              >
                Enable Notifications
              </button>
              
              <button 
                onClick={handleDismiss}
                className="w-full mt-3 text-white/50 font-bold py-3 text-[15px] active:text-white/80 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
