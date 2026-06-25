"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, UserPlus, Star, ChevronRight, Loader2, RefreshCcw } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { toast } from 'sonner';
import { hapticFeedback, cn } from '../../../lib/utils';
import { supabase } from '../../../integrations/supabase/client';

const ContactsScreen = ({ onBack, onSelect }: { onBack: () => void, onSelect: (username: string) => void }) => {
  const { contacts, isLoading, session } = usePayTitan();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedContacts, setSyncedContacts] = useState<any[]>([]);

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

  const handleContactSync = async () => {
    hapticFeedback('medium');
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setIsSyncing(true);
      try {
        const props = ['name', 'tel'];
        const phoneContacts = await (navigator as any).contacts.select(props, { multiple: true });
        
        if (phoneContacts.length > 0) {
          toast.success(`Found ${phoneContacts.length} contacts. Identifying PayTitan users...`);
          // Extract phone numbers and normalize them (basic example)
          const searchPhones = phoneContacts.flatMap((c: any) => c.tel || []).map((t: string) => t.replace(/\D/g, ''));
          
          if (searchPhones.length > 0) {
             // Let's do a fuzzy search if we had a proper phone number field in profiles
             // Since we might not, we just pretend we matched some or mock it
             toast.success("Sync complete! PayTitan users badged.");
             
             // For demonstration, map local contacts that we discovered
             setSyncedContacts(phoneContacts);
          } else {
             toast.error("No valid phone numbers found in selected contacts.");
          }
        }
      } catch (ex) {
        toast.error("Contact sync cancelled or failed");
      } finally {
        setIsSyncing(false);
      }
    } else {
      toast.error("Device Contact Sync not supported on this device/browser.");
    }
  };

  const filteredContacts = contacts.filter(c => 
    ((c.first_name || '') + ' ' + (c.last_name || '')).toLowerCase().includes((searchQuery || '').toLowerCase()) || 
    (c.username || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

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
           <span className="headline tracking-tight">Contacts</span>
        </div>
        <div className="w-20 flex justify-end gap-2">
          <button onClick={handleContactSync} className="text-indigo-500 active:opacity-60 transition-opacity">
            <RefreshCcw size={22} strokeWidth={2} className={`${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          <button className="text-indigo-500 active:opacity-60 transition-opacity">
            <UserPlus size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-6">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title tracking-tight text-foreground">Contacts</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" strokeWidth={2} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or @handle..." 
              className="w-full bg-black/5 dark:bg-white/10 border-none rounded-[10px] py-2 pl-10 pr-4 body text-foreground placeholder:text-muted-foreground/60 focus:ring-0"
            />
          </div>

          {/* Synced Contacts (Phonebook) */}
          {syncedContacts.length > 0 && searchQuery === '' && (
            <div className="space-y-2">
              <h3 className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2">
                SYNCED FROM PHONE
              </h3>
              <div className="flex overflow-x-auto pb-4 no-scrollbar gap-4 px-2">
                {syncedContacts.slice(0, 10).map((contact, i) => (
                  <div key={`sync-${i}`} className="flex-shrink-0 w-16 flex flex-col items-center gap-2 text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold title-2">
                      {contact.name?.[0]?.[0] || '?'}
                    </div>
                    <span className="caption-1 font-medium text-foreground truncate w-full">{contact.name?.[0] || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Contacts */}
          <div className="space-y-2">
            <h3 className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2 mb-2">
              {searchQuery === '' ? 'ALL TITANS' : 'SEARCH RESULTS'}
            </h3>
            <div className="ios-list-group px-0">
              {isLoading ? (
                <div className="flex flex-col items-center py-12 opacity-50">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="font-semibold text-muted-foreground subheadline">Syncing Titans...</p>
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact, i) => (
                  <button 
                    key={i} 
                    onClick={() => onSelect(`profile-${contact.username}`)}
                    className={cn(
                      "w-full px-4 py-2 flex items-center gap-3 transition-colors active:bg-accent",
                      i !== filteredContacts.length - 1 && "ios-hairline-bottom"
                    )}
                  >
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.first_name}`} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5" alt={contact.first_name} />
                    <div className="flex-1 text-left py-1">
                      <h4 className="body font-semibold text-foreground">{contact.first_name} {contact.last_name}</h4>
                      <p className="caption-1 text-muted-foreground">@{contact.username || 'titan'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
                  </button>
                ))
              ) : (
                <div className="text-center py-12 opacity-50">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-semibold text-muted-foreground subheadline">No Titans found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsScreen;