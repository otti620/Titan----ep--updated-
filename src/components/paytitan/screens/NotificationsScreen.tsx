"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCircle2, AlertCircle, Users, Wallet, ChevronRight, Info, HandCoins, Check, X } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import SystemBrandedShield from '../SystemBrandedShield';

const NotificationsScreen = ({ onBack }: { onBack: () => void }) => {
  const { notifications, clearAllNotifications, markNotificationAsRead, handleRequestAction } = usePayTitan();

  const [pushStatus, setPushStatus] = React.useState<string | null>(null);
  const [showShield, setShowShield] = React.useState(false);

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

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handleEnablePush = () => {
    setShowShield(true);
  };

  const confirmShieldAction = () => {
    setShowShield(false);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        setPushStatus(permission);
      });
    }
  };

  const handleClearAll = () => {
    hapticFeedback('heavy');
    clearAllNotifications();
  };

  const handleMarkRead = (id: string) => {
    hapticFeedback('light');
    markNotificationAsRead(id);
  };

  const onAction = (id: string, action: 'accept' | 'decline') => {
    hapticFeedback('medium');
    handleRequestAction(id, action);
  };

  const getIcon = (type: string, title: string) => {
    if (title.includes('Request') || type === 'request') return <HandCoins className="text-[#FF4D1C]" />;
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" />;
      case 'info': return <Users className="text-blue-500" />;
      case 'warning': return <AlertCircle className="text-yellow-500" />;
      case 'error': return <AlertCircle className="text-red-500" />;
      default: return <Info className="text-gray-400" />;
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col relative text-foreground">
      <SystemBrandedShield 
        isOpen={showShield}
        type="notifications"
        onConfirm={confirmShieldAction}
        onClose={() => setShowShield(false)}
      />
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
           <span className="headline tracking-tight">Notifications</span>
        </div>
        <div className="w-20 flex justify-end">
          <button
            onClick={handleClearAll}
            className="text-indigo-500 active:opacity-60 transition-opacity"
          >
            <span className="headline">Clear</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-6">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title tracking-tight text-foreground">Notifications</h1>

          {pushStatus === 'default' && (
            <div className="ios-list-group p-4 flex items-center justify-between mt-4">
              <div className="flex flex-col gap-0.5">
                <span className="body font-semibold tracking-tight text-foreground">Turn on Notifications</span>
                <span className="caption-1 text-muted-foreground">Get alerted for incoming funds.</span>
              </div>
              <button 
                onClick={handleEnablePush}
                className="bg-indigo-500 text-white px-4 py-1.5 rounded-full subheadline font-semibold active:scale-95 transition-transform shadow-sm"
              >
                Enable
              </button>
            </div>
          )}

          {notifications.length > 0 ? (
            <div className="space-y-3 mt-4">
              {notifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NotificationItem
                    icon={getIcon(notification.type, notification.title)}
                    title={notification.title}
                    description={notification.description}
                    time={notification.time}
                    unread={notification.unread}
                    isRequest={notification.type === 'request'}
                    onRead={() => handleMarkRead(notification.id)}
                    onAccept={() => onAction(notification.id, 'accept')}
                    onDecline={() => onAction(notification.id, 'decline')}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
              <Bell className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
              <p className="headline text-muted-foreground">All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ icon, title, description, time, unread, isRequest, onRead, onAccept, onDecline }: { icon: React.ReactNode, title: string, description: string, time: string, unread?: boolean, isRequest?: boolean, onRead: () => void, onAccept?: () => void, onDecline?: () => void }) => (
  <div
    onClick={unread && !isRequest ? onRead : undefined}
    className={cn(
      "relative overflow-hidden bg-card rounded-2xl border border-border shadow-sm transition-all duration-300 ios-list-group p-4",
      !unread && "opacity-70"
    )}
  >
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full border border-border flex items-center justify-center bg-black/5 dark:bg-white/5">
            {React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 18, strokeWidth: 1.5 })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="body font-semibold tracking-tight text-foreground">
                {title}
              </h4>
               {unread && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
            </div>
            <p className="caption-2 text-muted-foreground mt-0.5 font-medium">{time}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 pl-[50px]">
        <p className="subheadline leading-snug font-medium text-foreground/80">
          {description}
        </p>
      </div>

      {isRequest && unread && (
        <div className="flex gap-2 pt-3 pl-[50px]">
          <button
            onClick={(e) => { e.stopPropagation(); onAccept?.(); }}
            className="flex-1 py-2 bg-indigo-500 text-white rounded-[10px] subheadline font-semibold active:scale-[0.98] transition-transform shadow-sm ios-spring"
          >
            Pay Now
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
            className="flex-1 py-2 bg-black/5 dark:bg-white/10 text-foreground rounded-[10px] subheadline font-semibold active:scale-[0.98] transition-transform ios-spring"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  </div>
);

export default NotificationsScreen;