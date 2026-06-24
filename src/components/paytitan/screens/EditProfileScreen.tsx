"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, User, AtSign, Mail, Phone, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePayTitan } from '../../../context/PayTitanContext';
import { supabase } from '../../../integrations/supabase/client';
import { cn, hapticFeedback } from '../../../lib/utils';

const EditProfileScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshData } = usePayTitan();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (profile) {
      setName(`${profile.first_name} ${profile.last_name}`);
      setHandle(profile.username);
      setPhone((profile as any).phone || '');
      setBio(profile.bio || '');
      setTwitter(profile.twitter || '');
      setInstagram(profile.instagram || '');
    }
    
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, [profile]);

  const handleSave = async () => {
    hapticFeedback('medium');
    if (!profile?.id) {
      toast.error("Profile ID not found. Please try logging in again.");
      return;
    }

    setIsSaving(true);
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const { error } = await supabase
      .from('profiles')
      .update({ 
        first_name: firstName, 
        last_name: lastName, 
        username: handle.toLowerCase(),
        bio,
        twitter,
        instagram
      } as any)
      .eq('id', profile.id);

    if (error) {
      console.error("Profile update error:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      hapticFeedback('error');
    } else {
      await refreshData();
      toast.success("Profile updated successfully!");
      hapticFeedback('success');
      onBack();
    }
    setIsSaving(false);
  };

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
           <span className="headline tracking-tight">Edit Profile</span>
        </div>
        <div className="w-20 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="text-indigo-500 font-semibold disabled:opacity-50 active:opacity-60 transition-opacity headline"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Done'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-2 pb-6 space-y-8">
          <div ref={sentinelRef} className="h-1 w-full" />
          <h1 className="large-title tracking-tight text-foreground">Edit Profile</h1>

          {/* Avatar Edit */}
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-border shadow-sm">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.first_name || 'Alex'}`} alt="Profile" className="w-full h-full object-cover bg-black/5 dark:bg-white/5" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-full border border-border flex items-center justify-center shadow-sm active:scale-95 transition-transform ios-spring">
                <Camera className="w-4 h-4 text-foreground" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2">PUBLIC INFORMATION</h3>
              <div className="ios-list-group px-0">
                <ProfileInput label="Name" value={name} onChange={setName} hasBorder />
                <ProfileInput label="Username" value={handle} onChange={(v: string) => setHandle(v.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} hasBorder={false} />
              </div>
            </div>

            <div className="space-y-1">
               <div className="ios-list-group px-4 py-3">
                 <span className="body text-foreground">Bio</span>
                 <textarea 
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   className="w-full bg-transparent border-none p-0 body text-foreground focus:ring-0 resize-none min-h-[60px] placeholder:text-muted-foreground/40 mt-1"
                   placeholder="Write a short bio..."
                 />
               </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2">SOCIAL</h3>
              <div className="ios-list-group px-0">
                 <ProfileInput label="Twitter" value={twitter} onChange={setTwitter} placeholder="@username" hasBorder />
                 <ProfileInput label="Instagram" value={instagram} onChange={setInstagram} placeholder="@username" hasBorder={false} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="px-2 caption-1 font-semibold text-muted-foreground uppercase tracking-widest pl-2">PRIVATE INFORMATION</h3>
              <div className="ios-list-group px-0">
                <ProfileInput label="Email" value={email} disabled hasBorder />
                <ProfileInput label="Phone" value={phone} disabled hasBorder={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileInput = ({ label, value, onChange, disabled, placeholder, hasBorder }: any) => (
  <div className={cn("flex flex-col py-2.5 px-4", hasBorder && "ios-hairline-bottom")}>
    <label className="caption-2 text-muted-foreground font-medium mb-0.5">{label}</label>
    <div className="flex items-center">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent border-none p-0 body focus:ring-0 placeholder:text-muted-foreground/40",
          disabled ? "text-muted-foreground" : "text-foreground font-medium"
        )}
      />
    </div>
  </div>
);

export default EditProfileScreen;