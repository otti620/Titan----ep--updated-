"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../integrations/supabase/client';
import { RefreshCw, Search, ArrowUpRight, ArrowDownRight, FileText, Ban } from 'lucide-react';
import { hapticFeedback, cn } from '../../../../lib/utils';
import { toast } from 'sonner';

export default function AdminTransactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    fetchTxs();
    const sub = supabase
      .channel('admin:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => {
        fetchTxs();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(sub); }
  }, []);

  const fetchTxs = async () => {
    setLoading(true);
    const { data } = await supabase.from('transactions')
      .select('*, profiles!transactions_user_id_fkey(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setTxs(data);
    setLoading(false);
  };

  const executeAction = async (action: string) => {
    hapticFeedback('medium');
    switch (action) {
      case 'reverse':
        if (selectedTx.status === 'reversed') {
           toast.error('Transaction already reversed');
           break;
        }
        try {
          // Create reversal transaction
          await supabase.from('transactions').insert({
            user_id: selectedTx.user_id,
            amount: selectedTx.type === 'in' ? -Math.abs(selectedTx.amount) : Math.abs(selectedTx.amount), // negate if it was 'in'
            type: selectedTx.type === 'in' ? 'out' : 'in',
            category: 'Refund',
            title: 'Reversal: ' + selectedTx.title,
            status: 'SUCCESS', // Uppercase SUCCESS based on db schema
            reference: 'REV-' + selectedTx.id.substring(0,8)
          });
          // Update original
          await supabase.from('transactions').update({ status: 'REVERSED' }).eq('id', selectedTx.id);
          setSelectedTx({...selectedTx, status: 'REVERSED'});
          toast.success("Transaction reversed successfully");
        } catch (e: any) {
           toast.error(e.message);
        }
        break;
      case 'flag':
        await supabase.from('transactions').update({ status: 'FLAGGED' }).eq('id', selectedTx.id);
        setSelectedTx({...selectedTx, status: 'FLAGGED'});
        toast.success("Transaction flagged for review");
        break;
      case 'force_success':
        await supabase.from('transactions').update({ status: 'SUCCESS' }).eq('id', selectedTx.id);
        setSelectedTx({...selectedTx, status: 'SUCCESS'});
        toast.success("Transaction manually marked as successful");
        break;
      default: break;
    }
  };

  if (selectedTx) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedTx(null)} className="text-sm font-semibold text-indigo-500">&larr; Back to Ledger</button>
        
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 text-foreground">
           <div className="flex justify-between items-start mb-6">
             <div>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Amount</p>
               <p className="text-3xl font-black tracking-tight mt-1">₦{Math.abs(selectedTx.amount).toLocaleString()}</p>
             </div>
             <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", 
                selectedTx.status?.toUpperCase() === 'SUCCESS' ? 'bg-green-500/10 text-green-500' :
                selectedTx.status?.toUpperCase() === 'FAILED' ? 'bg-red-500/10 text-red-500' :
                'bg-orange-500/10 text-orange-500'
             )}>
               {selectedTx.status}
             </div>
           </div>

           <div className="space-y-4 mb-8">
             <div className="flex justify-between border-b border-border pb-2">
               <span className="text-sm font-medium text-muted-foreground">ID / Ref</span>
               <span className="text-sm font-mono text-foreground">{selectedTx.reference || selectedTx.id.substring(0,8)}</span>
             </div>
             <div className="flex justify-between border-b border-border pb-2">
               <span className="text-sm font-medium text-muted-foreground">Category</span>
               <span className="text-sm font-semibold text-foreground">{selectedTx.category} ({selectedTx.type})</span>
             </div>
             <div className="flex justify-between border-b border-border pb-2">
               <span className="text-sm font-medium text-muted-foreground">Date</span>
               <span className="text-sm font-medium text-foreground">{new Date(selectedTx.created_at).toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-border pb-2">
               <span className="text-sm font-medium text-muted-foreground">User</span>
               <span className="text-sm font-medium text-foreground">{selectedTx.profiles?.first_name} {selectedTx.profiles?.last_name}</span>
             </div>
           </div>

           <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Admin Actions</h3>
           <div className="space-y-2 ios-list-group bg-background overflow-hidden">
             <button onClick={() => executeAction('reverse')} className="w-full px-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors ios-hairline-bottom text-red-500 font-medium">
               <span>Reverse Transaction</span> <RefreshCw size={18} />
             </button>
             <button onClick={() => executeAction('flag')} className="w-full px-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors ios-hairline-bottom text-orange-500 font-medium">
               <span>Flag for Review</span> <Ban size={18} />
             </button>
             {selectedTx.status?.toUpperCase() !== 'SUCCESS' && (
                <button onClick={() => executeAction('force_success')} className="w-full px-4 py-3 flex items-center justify-between active:bg-black/5 dark:active:bg-white/5 transition-colors text-green-500 font-medium">
                 <span>Force Success</span> <ArrowUpRight size={18} />
               </button>
             )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex justify-between items-center px-2">
        <h2 className="title-3 text-foreground">Global Ledger</h2>
        <button onClick={fetchTxs} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 text-foreground flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="ios-list-group">
        {txs.map((tx, i) => (
          <button 
            key={tx.id}
            onClick={() => { hapticFeedback('light'); setSelectedTx(tx); }}
            className={cn(
              "w-full flex items-center justify-between p-4 active:bg-black/5 dark:active:bg-white/5 transition-colors text-left",
              i !== txs.length - 1 && "ios-hairline-bottom"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", 
                 tx.type === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-black/5 dark:bg-white/5 text-foreground'
              )}>
                {tx.type === 'in' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div>
                <p className="font-semibold text-[15px] tracking-tight">{tx.profiles?.first_name} {tx.profiles?.last_name}</p>
                <p className="text-[12px] text-muted-foreground">{tx.category} • {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
             <div className="text-right flex flex-col items-end gap-1 shrink-0">
              <p className="font-semibold text-[15px] tabular-nums">₦{Math.abs(tx.amount).toLocaleString()}</p>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider",
                tx.status?.toUpperCase() === 'SUCCESS' ? 'text-green-500' :
                tx.status?.toUpperCase() === 'FAILED' ? 'text-red-500' : 'text-orange-500'
              )}>{tx.status}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
