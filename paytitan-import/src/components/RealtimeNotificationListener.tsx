"use client";

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePayTitan } from '@/context/PayTitanContext';
import { playChaChingSound } from '@/lib/audio';
import { toast } from 'sonner';

export const RealtimeNotificationListener = () => {
  const { session, refreshData, showNotification } = usePayTitan();
  const lastCheckedRef = useRef<string>(new Date().toISOString());
  const seenTxIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const getTargetUserId = () => {
      if (session?.user?.id) return session.user.id;
      if (typeof window !== 'undefined') {
        return localStorage.getItem('paytitan_cached_user_id');
      }
      return null;
    };

    const targetUserId = getTargetUserId();
    if (!targetUserId) return;

    // We still attempt to listen to realtime for profile changes
    const profileChannel = supabase
      .channel(`profile_updates_${targetUserId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${targetUserId}` },
        () => {
          if (session?.user?.id === targetUserId) refreshData();
        }
      )
      .subscribe();

    // Active Polling for Incoming Transactions / Notifications as a bulletproof fallback
    const interval = setInterval(async () => {
      if (!targetUserId) return;

      try {
        const { data: newTxs } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', targetUserId)
          .in('type', ['in', 'receive'])
          .gt('created_at', lastCheckedRef.current)
          .order('created_at', { ascending: true });

        if (newTxs && newTxs.length > 0) {
          let shouldRefresh = false;

          newTxs.forEach(tx => {
            if (seenTxIdsRef.current.has(tx.id)) return;
            seenTxIdsRef.current.add(tx.id);
            shouldRefresh = true;
            
            // Cha-ching moment!
            playChaChingSound();

            const amountVal = Number(tx.amount || 0);
            const amountFormatted = `₦${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
            let sourceDetail = 'credited to your wallet';
            if (tx.description && tx.description.toLowerCase().includes('virtual account')) {
              sourceDetail = `via Virtual Account Transfer (${tx.description})`;
            } else if (tx.title && tx.title.toLowerCase().startsWith('transfer from')) {
              sourceDetail = `from ${tx.title.replace(/Transfer from /i, '')}`;
            } else if (tx.description) {
              sourceDetail = `(${tx.description})`;
            } else if (tx.title) {
              sourceDetail = `via ${tx.title}`;
            }

            const toastTitle = `💰 Received ${amountFormatted}!`;
            const toastMessage = `You received money ${sourceDetail}. Balance updated.`;

            toast.success(toastTitle, { description: toastMessage, duration: 6000 });

            if (session?.user?.id === targetUserId) {
              showNotification({ type: 'success', title: toastTitle, description: toastMessage });
            }

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                if (navigator.serviceWorker) {
                  navigator.serviceWorker.ready.then((reg) => reg.showNotification(toastTitle, { body: toastMessage }));
                } else {
                  new Notification(toastTitle, { body: toastMessage });
                }
              } catch (e) {
                console.error("Failed device alert:", e);
              }
            }
          });

          if (shouldRefresh && session?.user?.id === targetUserId) {
            refreshData();
          }

          lastCheckedRef.current = new Date().toISOString();
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      supabase.removeChannel(profileChannel);
      clearInterval(interval);
    };
  }, [session?.user?.id, refreshData, showNotification]);

  return null;
};
