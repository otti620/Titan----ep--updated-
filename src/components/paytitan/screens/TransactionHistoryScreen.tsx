"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, Search, ArrowDownLeft, ArrowUpRight, Calendar, Repeat, AlertTriangle, History, SearchX, Clock, Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import { usePayTitan, Transaction } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { EmptyState } from '../ui/EmptyState';

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const TransactionHistoryScreen = ({ onBack, onSelectTransaction }: { onBack: () => void, onSelectTransaction: (id: string) => void }) => {
  const { transactions, generateHistoryPDF, profile } = usePayTitan();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFocused, setIsFocused] = useState(false);
  const [disputingTxId, setDisputingTxId] = useState<string | null>(null);
  
  // Date filtering states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Export selection sheet state
  const [showExportSheet, setShowExportSheet] = useState(false);
  
  // Navigation bar large title collapse state
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

  const categories = ['All', 'Transfer', 'Airtime', 'Data', 'Bills', 'Circle', 'Card', 'Fee'];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search matching
      const matchesSearch = (tx.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (tx.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category matching
      const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;

      // Date range matching
      if (startDate) {
        const txDate = new Date(tx.created_at);
        const start = new Date(startDate);
        txDate.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        if (txDate < start) return false;
      }
      if (endDate) {
        const txDate = new Date(tx.created_at);
        const end = new Date(endDate);
        txDate.setHours(23,59,59,999);
        end.setHours(23,59,59,999);
        if (txDate > end) return false;
      }

      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory, startDate, endDate]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();

    filteredTransactions.forEach(tx => {
      const date = new Date(tx.created_at);
      const dateStr = date.toDateString();
      let groupKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (dateStr === today) groupKey = 'Today';
      else if (dateStr === yesterday) groupKey = 'Yesterday';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const handleExportPDF = () => {
    hapticFeedback('success');
    setShowExportSheet(false);
    const now = new Date();
    const dateStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    generateHistoryPDF(dateStr);
    import('sonner').then(m => m.toast.success("Architecting your financial statement...", {
      description: `PayTitan Statement_${dateStr.replace(' ', '_')}.pdf is ready.`,
      duration: 5000,
    }));
  };

  const handleExportCSV = () => {
    hapticFeedback('success');
    setShowExportSheet(false);

    if (filteredTransactions.length === 0) {
      import('sonner').then(m => m.toast.error("No transactions found matching your filters to export."));
      return;
    }

    try {
      // Build Excel/RFC4180 compliant CSV format with proper quote escaping
      const headers = ["Date", "Time", "Reference ID", "Category", "Title", "Description", "Direction", "Amount (NGN)", "Status"];
      const rows = filteredTransactions.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.time || '',
        tx.reference || tx.id || '',
        tx.category || '',
        tx.title || '',
        tx.description || '',
        tx.type || '',
        tx.amount,
        tx.status || 'successful'
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => {
          const stringVal = String(val).replace(/"/g, '""');
          return stringVal.includes(",") || stringVal.includes("\n") || stringVal.includes('"') 
            ? `"${stringVal}"` 
            : stringVal;
        }).join(","))
      ].join("\n");

      // Trigger automatic file download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().substring(0, 10);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `PayTitan_Statement_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      import('sonner').then(m => m.toast.success("Spreadsheet generated!", {
        description: `Downloaded PayTitan_Statement_${dateStr}.csv successfully.`,
        duration: 4000,
      }));
    } catch (err) {
      import('sonner').then(m => m.toast.error("Failed to generate CSV spreadsheet format."));
    }
  };

  const handleReport = (id: string) => {
    hapticFeedback('medium');
    setDisputingTxId(id);
  };

  const submitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    hapticFeedback('success');
    setDisputingTxId(null);
    import('sonner').then(m => m.toast.success("Dispute filed. Our team will review this shortly."));
  };

  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Decorative Titan Pulse Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      
      {/* Navigation Bar */}
      <div className={cn(
        "px-5 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "ios-glass ios-hairline-bottom" : "bg-transparent"
      )}>
        <button onClick={onBack} className="text-foreground/80 flex flex-row items-center gap-1 active:opacity-60 transition-opacity z-10 w-20">
          <ArrowLeft size={22} strokeWidth={2.5} /> 
          <span className="text-[15px] font-bold tracking-tight">Back</span>
        </button>
        
        <div className={cn(
           "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 text-center pointer-events-none",
           isCollapsed ? "opacity-100" : "opacity-0"
        )}>
           <span className="text-[13px] font-black uppercase tracking-[0.2em] text-foreground">Activity</span>
        </div>

        <div className="z-10 w-20 flex justify-end">
           <button 
             onClick={() => { hapticFeedback('light'); setShowExportSheet(true); }}
             className="text-indigo-500 active:opacity-60 transition-opacity text-[13px] font-black uppercase tracking-wider flex items-center gap-1"
           >
             Export
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-12 relative z-10">
        <div className="px-5 pt-2 pb-4">
           <div ref={sentinelRef} className="h-1 w-full" />
           {/* Nothing-style Title */}
           <div className="mb-6 relative">
             <h1 className="text-[32px] font-black text-foreground tracking-tighter leading-none mb-1">Transaction Ledger</h1>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest opacity-40">Architected Wealth Index</span>
                <div className="flex gap-[3px] opacity-10">
                   {[...Array(8)].map((_, i) => (
                     <div key={i} className="w-[3px] h-[3px] rounded-full bg-foreground" />
                   ))}
                </div>
             </div>
           </div>

          {/* Premium Glassmorphic Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1 group">
              <div className={cn(
                "absolute inset-y-0 flex items-center transition-all duration-300 pointer-events-none",
                isFocused || searchQuery ? "left-4" : "left-1/2 -translate-x-1/2 -ml-10"
              )}>
                <Search size={16} strokeWidth={2.5} className={cn("transition-colors", isFocused ? "text-indigo-500" : "text-muted-foreground/50")} />
                {!isFocused && !searchQuery && <span className="ml-[8px] text-muted-foreground/50 text-[14px] font-medium">Search Ledger</span>}
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-[18px] py-3 px-10 text-foreground text-[14px] font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all outline-none"
              />
            </div>
            
            <button 
              onClick={() => { hapticFeedback('light'); setShowDateFilter(!showDateFilter); }}
              className={cn(
                "w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-300 border backdrop-blur-md",
                showDateFilter || startDate || endDate 
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20" 
                  : "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-muted-foreground"
              )}
              title="Filter by Date"
            >
              <Calendar size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Collapsible date range filter card */}
          <AnimatePresence>
            {showDateFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[24px] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Temporal Filter</span>
                    {(startDate || endDate) && (
                      <button 
                        onClick={() => { hapticFeedback('light'); setStartDate(''); setEndDate(''); }}
                        className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:opacity-60 transition-opacity"
                      >
                        Reset Temporal Range
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Initiation</label>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => { hapticFeedback('light'); setStartDate(e.target.value); }}
                        className="w-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-[14px] py-2.5 px-3 text-[13px] text-foreground outline-none focus:border-indigo-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Termination</label>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => { hapticFeedback('light'); setEndDate(e.target.value); }}
                        className="w-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-[14px] py-2.5 px-3 text-[13px] text-foreground outline-none focus:border-indigo-500/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Segmented-style Category Filters */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { hapticFeedback('light'); setSelectedCategory(cat); }}
                className={cn(
                  "px-5 py-2 rounded-[14px] text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 active:scale-95 border backdrop-blur-md",
                  selectedCategory === cat 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                    : "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-muted-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 space-y-8 pt-4">
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <h3 className="footnote text-muted-foreground uppercase tracking-[0.06em] px-3">{group}</h3>
                <div className="ios-list-group">
                  {items.map((tx, idx) => (
                    <SwipeableTransactionItem 
                      key={tx.id} 
                      tx={tx} 
                      onClick={() => onSelectTransaction(tx.id)} 
                      onReport={() => handleReport(tx.id)}
                      isLast={idx === items.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (searchQuery || startDate || endDate) ? (
            <EmptyState 
              icon={SearchX}
              title="No Results Found"
              description={`We couldn't find any transactions matching your parameters in ${selectedCategory}.`}
              actionLabel="Clear Filters"
              onAction={() => { setSearchQuery(''); setSelectedCategory('All'); setStartDate(''); setEndDate(''); }}
            />
          ) : (
            <EmptyState 
              icon={Clock}
              title="Immutable Ledger"
              description="Your financial journey starts now. Fund your wallet to begin architecting wealth."
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {/* iOS Actions Drawer for Export Style */}
        {showExportSheet && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowExportSheet(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            />
            
            {/* Bottom Drawer */}
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[24px] bg-card p-6 pb-[env(safe-area-inset-bottom,24px)] shadow-2xl border-t border-border flex flex-col space-y-4"
            >
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h3 className="headline font-bold text-foreground">Export Activity</h3>
                  <p className="caption-1 text-muted-foreground">Select your compiled format preference</p>
                </div>
                <button 
                  onClick={() => setShowExportSheet(false)}
                  className="p-1 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 rounded-[14px] transition-colors text-left"
                >
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="subheadline font-semibold text-foreground">PDF Audit Statement</h4>
                    <p className="caption-2 text-muted-foreground">Perfect for official reference and printing</p>
                  </div>
                </button>

                <button 
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 rounded-[14px] transition-colors text-left"
                >
                  <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h4 className="subheadline font-semibold text-foreground">CSV Spreadsheet</h4>
                    <p className="caption-2 text-muted-foreground">Perfect for Excel, Numbers, and data analysis</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setShowExportSheet(false)}
                className="w-full py-4 text-center bg-black/5 dark:bg-white/10 active:opacity-60 rounded-[14px] font-bold text-foreground transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}

        {disputingTxId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card w-full max-w-sm rounded-[24px] p-6 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} strokeWidth={1.5} />
              </div>
              <h2 className="title-3 mb-2">Report Issue</h2>
              <p className="subheadline text-muted-foreground mb-6 leading-relaxed">
                Is there a problem with this transaction? Please provide a brief description.
              </p>
              <form onSubmit={submitDispute} className="space-y-4">
                <textarea 
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[14px] p-4 subheadline resize-none focus:border-indigo-500"
                  rows={4}
                  placeholder="E.g., I was charged twice, or I don't recognize this amount."
                  required
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setDisputingTxId(null)} className="flex-1 py-3 text-foreground bg-black/5 dark:bg-white/10 rounded-[14px] active:scale-95 transition-transform headline">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 text-white bg-red-500 shadow-sm rounded-[14px] active:scale-95 transition-transform headline">
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SwipeableTransactionItem = ({ tx, onClick, onReport, isLast }: { tx: Transaction, onClick: () => void, onReport: () => void, isLast: boolean }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  // Nothing-inspired "Titan Pulse" indicator for recent transactions
  const isRecent = new Date().getTime() - new Date(tx.created_at).getTime() < 3600000; // 1 hour

  return (
    <div className={cn(
      "relative mb-2 overflow-hidden rounded-[18px] transition-all duration-300",
      "bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10",
      "shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:bg-white/60 dark:hover:bg-white/10"
    )}>
      <div className="absolute inset-0 flex justify-end items-center px-6 gap-4 bg-black/5 dark:bg-white/5">
        <button className="flex flex-col items-center gap-1 text-indigo-500">
          <Repeat size={20} strokeWidth={1.5} />
          <span className="caption-1 font-mono uppercase tracking-tighter">Repeat</span>
        </button>
        <button onClick={onReport} className="flex flex-col items-center gap-1 text-red-500 active:scale-95 transition-transform">
          <AlertTriangle size={20} strokeWidth={1.5} />
          <span className="caption-1 font-mono uppercase tracking-tighter">Report</span>
        </button>
      </div>

      <motion.button
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        onClick={onClick}
        className="relative w-full p-4 flex items-center justify-between bg-transparent active:bg-black/5 dark:active:bg-white/5 transition-colors text-left z-10"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "w-[44px] h-[44px] rounded-[14px] flex items-center justify-center border transition-all duration-500",
              tx.type === 'in' 
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
            )}>
              {tx.type === 'in' ? <ArrowDownLeft size={22} strokeWidth={1.5} /> : <ArrowUpRight size={22} strokeWidth={1.5} />}
            </div>
            {isRecent && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute -inset-1 rounded-[16px] border opacity-20",
                  tx.type === 'in' ? "border-green-500" : "border-indigo-500"
                )}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-[15px] font-bold text-foreground tracking-tight">{tx.title}</h4>
              {tx.status === 'pending' && (
                <div className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[8px] font-black uppercase text-amber-600 tracking-widest">Pending</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-tighter bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-sm">
                {tx.category || 'Payment'}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/60">{tx.time}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-[16px] font-black tabular-nums tracking-tighter font-mono",
            tx.type === 'in' ? "text-green-500" : "text-foreground"
          )}>
            {tx.type === 'in' ? '+' : '-'}₦{tx.amount.toLocaleString()}
          </p>
          <div className="flex justify-end gap-[2px] mt-1 opacity-20">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-[2px] h-[2px] rounded-full bg-foreground" />
             ))}
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export default TransactionHistoryScreen;