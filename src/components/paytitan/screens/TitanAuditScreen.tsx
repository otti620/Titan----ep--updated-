"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Activity, Terminal, Lock, Globe, RefreshCcw, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

interface TitanAuditScreenProps {
  onBack: () => void;
}

const TitanAuditScreen = ({ onBack }: TitanAuditScreenProps) => {
  const { auditReport } = usePayTitan();
  const [logs, setLogs] = useState(auditReport.logs);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate real-time log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString('en-GB'),
        event: [
          'Shard Verification',
          'Database Sync',
          'Security Hash Check',
          'Ingress Traffic Audit',
          'Memory Buffer Flush',
          'Titan Node Verification'
        ][Math.floor(Math.random() * 6)],
        status: 'SUCCESS'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerSync = () => {
    hapticFeedback('medium');
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden font-mono text-[8px] leading-none text-foreground break-all p-4">
        {Array(100).fill(0).map((_, i) => (
          <div key={i} className="mb-1">
             {Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      
      {/* Navigation */}
      <div className="px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30">
        <button onClick={onBack} className="text-foreground/80 flex flex-row items-center gap-1 active:opacity-60 transition-opacity z-10 w-20">
          <ArrowLeft size={22} strokeWidth={2.5} /> 
          <span className="text-[15px] font-bold tracking-tight">Back</span>
        </button>
        
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">System Core</span>

        <div className="z-10 w-20 flex justify-end">
          <motion.button 
            onClick={triggerSync}
            animate={isSyncing ? { rotate: 360 } : {}}
            transition={{ repeat: isSyncing ? Infinity : 0, duration: 1, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
          >
             <RefreshCcw size={18} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
        <div className="px-6 pt-2 pb-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
               <ShieldCheck size={20} className="text-emerald-500" strokeWidth={2.5} />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Immunity Verified</span>
            </div>
            <h1 className="text-[32px] font-black text-foreground tracking-tighter leading-none mb-2">The Titan Audit</h1>
            <p className="text-[14px] text-muted-foreground font-medium max-w-[80%]">
              Architecting transparency through immutable real-time ledger verification.
            </p>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-2 gap-3 mb-8">
             <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[28px] p-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 block mb-3">Security Integrity</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-[28px] font-black text-foreground tracking-tighter">{auditReport.securityScore}</span>
                   <span className="text-[12px] font-bold text-muted-foreground">%</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "98%" }}
                     transition={{ duration: 1.5, delay: 0.2 }}
                     className="h-full bg-emerald-500 rounded-full" 
                   />
                </div>
             </div>
             <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[28px] p-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 block mb-3">Node Uptime</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-[28px] font-black text-foreground tracking-tighter">{auditReport.uptime}</span>
                </div>
                <div className="flex gap-1 mt-3">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className="flex-1 h-1.5 rounded-full bg-emerald-500 opacity-80" />
                   ))}
                </div>
             </div>
          </div>

          {/* System Status Cards */}
          <div className="space-y-3 mb-8">
             <StatusCard icon={Globe} label="Global Mesh Status" value="Online & Synced" status="success" />
             <StatusCard icon={Lock} label="Encryption Protocol" value="AES-256 Quantum-Safe" status="success" />
             <StatusCard icon={Terminal} label="Ledger Consistency" value="Verified" status="success" />
          </div>

          {/* Live Log Terminal */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Live Node Stream</span>
               </div>
               <span className="text-[10px] font-mono text-muted-foreground opacity-40">UTC {new Date().getHours()}:00</span>
             </div>

             <div className="bg-black/90 dark:bg-black p-5 rounded-[32px] border border-white/5 font-mono shadow-2xl">
                <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                   <AnimatePresence mode="popLayout">
                      {logs.map((log, idx) => (
                        <motion.div 
                          key={`${log.time}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 text-[11px]"
                        >
                           <span className="text-emerald-500/50 whitespace-nowrap">[{log.time}]</span>
                           <span className="text-white/80 whitespace-nowrap">{log.event}</span>
                           <div className="flex-1 border-b border-dashed border-white/10" />
                           <span className="text-emerald-400 font-bold tracking-widest">{log.status}</span>
                        </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-white/30 text-[10px]">
                   <Activity size={12} />
                   <span>Monitoring 124 global architectural nodes...</span>
                </div>
             </div>
          </div>

          {/* Report Access Footer */}
          <div className="mt-8">
            <button className="w-full h-16 glass-card rounded-[24px] px-6 flex items-center justify-between group active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                  <Terminal size={18} className="text-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-bold text-foreground">Monthly Compliance Report</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Download full June Audit (PDF)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status: 'success' | 'warning' }) => (
  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[24px] p-4 flex items-center gap-4">
    <div className={cn(
      "w-10 h-10 rounded-[14px] flex items-center justify-center",
      status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
    )}>
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 leading-none mb-1">{label}</p>
      <p className="text-[14px] font-bold text-foreground leading-none">{value}</p>
    </div>
    {status === 'success' ? (
      <CheckCircle2 size={16} className="text-emerald-500" />
    ) : (
      <AlertCircle size={16} className="text-amber-500" />
    )}
  </div>
);

export default TitanAuditScreen;
