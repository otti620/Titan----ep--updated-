"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  XCircle, 
  Bell, 
  ShieldCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { hapticFeedback, cn } from '../../lib/utils';

export interface InAppNotificationData {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface InAppNotificationProps {
  notification: InAppNotificationData | null;
  onClose: () => void;
}

const InAppNotification = ({ notification, onClose }: InAppNotificationProps) => {
  useEffect(() => {
    if (notification) {
      // Trigger haptic based on type
      if (notification.type === 'error') hapticFeedback('error');
      else if (notification.type === 'success') hapticFeedback('success');
      else hapticFeedback('medium');

      // Auto-close timer
      const timer = setTimeout(onClose, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const getIcon = () => {
    if (!notification) return null;
    switch (notification.type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={24} />;
      case 'error': return <XCircle className="text-red-500" size={24} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBgColor = () => {
    if (!notification) return "";
    switch (notification.type) {
      case 'success': return "bg-green-500/10 border-green-500/20";
      case 'error': return "bg-red-500/10 border-red-500/20";
      case 'warning': return "bg-yellow-500/10 border-yellow-500/20";
      default: return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <div className="fixed top-12 left-0 right-0 z-[300] px-6 pointer-events-none">
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            className="max-w-md mx-auto pointer-events-auto"
          >
            <div className={cn(
              "relative overflow-hidden backdrop-blur-2xl rounded-[32px] border shadow-2xl p-6 flex items-start gap-4",
              "bg-white/80 dark:bg-[#1A2130]/80 border-white/40 dark:border-white/10",
              getBgColor()
            )}>
              {/* Decorative Glow */}
              <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full",
                notification.type === 'success' ? 'bg-green-500' : 
                notification.type === 'error' ? 'bg-red-500' : 
                'bg-[#FF4D1C]'
              )} />

              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                  {getIcon()}
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1A2130] dark:text-white">
                    {notification.title}
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Just Now</span>
                </div>
                <p className="text-[15px] leading-snug font-medium text-gray-600 dark:text-gray-300">
                  {notification.description}
                </p>
                
                <div className="pt-3 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">TitanShield™ Verified</span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InAppNotification;