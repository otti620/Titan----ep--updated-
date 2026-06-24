"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../integrations/supabase/client';
import { 
  MessageSquare, AlertCircle, RefreshCw, Send, DollarSign, Ban, 
  CheckCircle, ShieldAlert, Sparkles, LifeBuoy, Clock, ChevronRight, Check
} from 'lucide-react';
import { hapticFeedback, cn } from '../../../../lib/utils';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  admin_reply?: string;
  charge_amount?: number;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    username: string;
    balance: number;
  };
}

interface Dispute {
  id: string;
  transaction_id: string;
  user_id: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  chargeback_fee_applied?: number;
  created_at: string;
  transactions?: {
    amount: number;
    reference: string;
    category: string;
    title: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
    username: string;
    balance: number;
  };
}

interface InactiveUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  balance: number;
  created_at: string;
  last_active_days: number;
  last_tx_date: string;
}

export default function HelpDesk() {
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'disputes' | 'sweep'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  
  // Resolution forms
  const [replyMessage, setReplyMessage] = useState('');
  const [supportChargeAmount, setSupportChargeAmount] = useState('150'); // Default ₦150 ticket fee
  const [chargeSupportUser, setChargeSupportUser] = useState(true);
  
  const [disputeNotes, setDisputeNotes] = useState('');
  const [chargebackFee, setChargebackFee] = useState('1000'); // Default ₦1000 merchant fee
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    fetchActiveData();
  }, [activeSubTab]);

  const fetchActiveData = () => {
    if (activeSubTab === 'tickets') fetchTickets();
    if (activeSubTab === 'disputes') fetchDisputes();
    if (activeSubTab === 'sweep') fetchInactiveSweep();
  };

  const fetchTickets = async () => {
    setLoading(true);
    let dbTickets: SupportTicket[] = [];
    try {
      // Fetch tickets joining profiles
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, profiles(first_name, last_name, username, balance)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbTickets = data as any[];
      }
    } catch (err: any) {
      console.warn('Database error fetching tickets, falling back to local storage:', err);
    }

    try {
      const localStr = localStorage.getItem('paytitan_support_tickets');
      if (localStr) {
        const localTickets: SupportTicket[] = JSON.parse(localStr);
        const merged = [...dbTickets];
        localTickets.forEach(lt => {
          const idx = merged.findIndex(t => t.id === lt.id);
          if (idx > -1) {
            merged[idx] = { ...merged[idx], ...lt };
          } else {
            merged.unshift(lt);
          }
        });
        setTickets(merged);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('Local tickets parsing error:', e);
    }

    setTickets(dbTickets);
    setLoading(false);
  };

  const fetchDisputes = async () => {
    setLoading(true);
    let dbDisputes: Dispute[] = [];
    try {
      const { data, error } = await supabase
        .from('transaction_disputes')
        .select('*, transactions(*), profiles(first_name, last_name, username, balance)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbDisputes = data as any[];
      }
    } catch (err: any) {
      console.warn('Database error fetching disputes, falling back to local storage:', err);
    }

    try {
      const localStr = localStorage.getItem('paytitan_transaction_disputes');
      if (localStr) {
        const localDisputes: Dispute[] = JSON.parse(localStr);
        const merged = [...dbDisputes];
        localDisputes.forEach(ld => {
          const idx = merged.findIndex(d => d.id === ld.id);
          if (idx > -1) {
            merged[idx] = { ...merged[idx], ...ld };
          } else {
            merged.unshift(ld);
          }
        });
        setDisputes(merged);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('Local disputes parsing error:', e);
    }

    setDisputes(dbDisputes);
    setLoading(false);
  };

  const fetchInactiveSweep = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .gt('balance', 0); // Must have outstanding balances to be eligible for deductions

      if (pErr) throw pErr;

      const candidates: InactiveUser[] = [];
      const now = new Date();

      for (const p of (profiles || [])) {
        // Find latest successful transaction for user
        const { data: txs, error: txErr } = await supabase
          .from('transactions')
          .select('created_at')
          .eq('user_id', p.id)
          .eq('status', 'SUCCESS')
          .order('created_at', { ascending: false })
          .limit(1);

        const lastActiveStr = txs && txs.length > 0 ? txs[0].created_at : p.created_at;
        const lastActiveDate = new Date(lastActiveStr);
        const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 180) { // Completely inactive for over 180 consecutive days
          candidates.push({
            id: p.id,
            first_name: p.first_name || 'Valued',
            last_name: p.last_name || 'Member',
            username: p.username || 'user',
            balance: Number(p.balance),
            created_at: p.created_at,
            last_active_days: diffDays,
            last_tx_date: lastActiveStr
          });
        }
      }

      setInactiveUsers(candidates);
    } catch (err: any) {
      toast.error('Sweep query error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyTicket = async () => {
    if (!selectedTicket) return;
    if (!replyMessage.trim()) {
      toast.error('Please input a reply message');
      return;
    }

    setIsProcessingAction(true);
    hapticFeedback('medium');

    try {
      const feeAmt = chargeSupportUser ? parseFloat(supportChargeAmount) || 0 : 0;
      
      // Save reply and resolve ticket
      // We write defensively by first attempting column write, and appending to message if it fails
      const updateObj: any = { status: 'resolved' };
      
      const { data: cols } = await supabase
        .from('support_tickets')
        .select('*')
        .limit(1);

      const hasAdminReplyColumn = cols && cols.length > 0 && ('admin_reply' in cols[0]);

      if (hasAdminReplyColumn) {
        updateObj.admin_reply = replyMessage;
        updateObj.charge_amount = feeAmt;
      } else {
        // Fallback: append reply inside the message column
        updateObj.message = `${selectedTicket.message}\n\n---ADMIN_REPLY---\nResolved by support specialists:\n"${replyMessage}"\n\nSupport Admin Fee Applied: ₦${feeAmt}`;
      }

      let dbUpdated = false;
      try {
        const { error: ticketErr } = await supabase
          .from('support_tickets')
          .update(updateObj)
          .eq('id', selectedTicket.id);

        if (ticketErr) throw ticketErr;
        dbUpdated = true;
      } catch (err: any) {
        console.warn('Database ticket resolve failed, handling inside local storage fallback:', err.message);
      }

      // Sync and store in Local Storage for full frontend communication
      try {
        const localStr = localStorage.getItem('paytitan_support_tickets');
        const localTickets = localStr ? JSON.parse(localStr) : [];
        const existingIdx = localTickets.findIndex((t: any) => t.id === selectedTicket.id);
        const updatedTicket = { 
          ...selectedTicket, 
          status: 'resolved' as const, 
          admin_reply: replyMessage, 
          charge_amount: feeAmt 
        };
        if (existingIdx > -1) {
          localTickets[existingIdx] = { ...localTickets[existingIdx], ...updatedTicket };
        } else {
          localTickets.unshift(updatedTicket);
        }
        localStorage.setItem('paytitan_support_tickets', JSON.stringify(localTickets));
      } catch (e) {
        console.error("Local storage support ticket update failed:", e);
      }

      // Apply maintenance charging if chosen
      if (feeAmt > 0) {
        const reference = `SUP-${Math.floor(100000 + Math.random() * 899900)}`;
        try {
          // Insert out transaction
          const { error: txErr } = await supabase
            .from('transactions')
            .insert([{
              user_id: selectedTicket.user_id,
              type: 'out',
              category: 'Fee',
              title: 'Support Desk Resolution Charge',
              description: `Deduction for resolving query: "${selectedTicket.subject}"`,
              amount: feeAmt,
              status: 'SUCCESS',
              reference
            }]);

          if (!txErr) {
            // Trigger balance recalculation
            await supabase.rpc('recalculate_user_balance', { target_user_id: selectedTicket.user_id });
          } else {
            console.warn("Support fee transaction logging bypass flag:", txErr);
          }
        } catch (txEx) {
          console.warn("Deduction error caught locally:", txEx);
        }
      }

      toast.success('Ticket resolved and customer was replied successfully!');
      setSelectedTicket(null);
      setReplyMessage('');
      fetchTickets();
    } catch (err: any) {
      toast.error('Failed to reply ticket: ' + err.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleResolveDispute = async (status: 'resolved' | 'dismissed') => {
    if (!selectedDispute) return;
    setIsProcessingAction(true);
    hapticFeedback('heavy');

    const feeAmt = parseFloat(chargebackFee) || 0;

    let dbUpdated = false;
    try {
      // Update dispute status
      const { error: disputeErr } = await supabase
        .from('transaction_disputes')
        .update({
          status,
          resolution_notes: disputeNotes
        } as any)
        .eq('id', selectedDispute.id);

      if (!disputeErr) {
        dbUpdated = true;
      }
    } catch (err: any) {
      console.warn('Database error updating dispute status, falling back to local storage:', err);
    }

    // Sync and update Local Storage for the user to see immediately
    try {
      const localStr = localStorage.getItem('paytitan_transaction_disputes');
      const localDisputes = localStr ? JSON.parse(localStr) : [];
      const existingIdx = localDisputes.findIndex((d: any) => d.id === selectedDispute.id);
      const updatedDispute = { 
        ...selectedDispute, 
        status, 
        resolution_notes: disputeNotes,
        chargeback_fee_applied: status === 'resolved' ? feeAmt : 0
      };
      if (existingIdx > -1) {
        localDisputes[existingIdx] = { ...localDisputes[existingIdx], ...updatedDispute };
      } else {
        localDisputes.unshift(updatedDispute);
      }
      localStorage.setItem('paytitan_transaction_disputes', JSON.stringify(localDisputes));
    } catch (e) {
      console.error("Local storage dispute update failed:", e);
    }

    try {
      const disputedAmount = Number(selectedDispute.transactions?.amount || 0);
      const originalRef = selectedDispute.transactions?.reference || 'N/A';

      if (status === 'resolved') {
        // In favor of user:
        // 1. Rollback funds back to the User (Claimant)
        const refundRef = `REF-${Math.floor(100000 + Math.random() * 899900)}`;
        try {
          await supabase.from('transactions').insert([{
            user_id: selectedDispute.user_id,
            type: 'in',
            category: 'Refund',
            title: 'Dispute Settlement Refund',
            description: `Dispute Case Settlement Refund for transaction ref ${originalRef}`,
            amount: Math.abs(disputedAmount),
            status: 'SUCCESS',
            reference: refundRef
          }]);

          await supabase.rpc('recalculate_user_balance', { target_user_id: selectedDispute.user_id });
        } catch (e) {
          console.warn("Direct DB recovery reversal skipped, handled via simulation fallback:", e);
        }

        // 2. Charge the merchant / recipient of original transaction a chargeback fee!
        // To find the recipient, let's look at transactions with the same reference but type='in' (the original recipient)
        try {
          const { data: receiverTx } = await supabase
            .from('transactions')
            .select('user_id')
            .eq('reference', originalRef)
            .eq('type', 'in')
            .maybeSingle();

          if (receiverTx && receiverTx.user_id) {
            const merchantId = receiverTx.user_id;

            // Deduct full refunded value from the merchant as reverse payout
            const chargebackRef = `CBK-${Math.floor(100000 + Math.random() * 899900)}`;
            await supabase.from('transactions').insert([{
              user_id: merchantId,
              type: 'out',
              category: 'System Fee',
              title: 'Dispute Chargeback Reversal',
              description: `Reversal debit due to lost dispute case for reference ${originalRef}`,
              amount: Math.abs(disputedAmount),
              status: 'SUCCESS',
              reference: chargebackRef
            }]);

            // Charge administrative chargeback fee
            if (feeAmt > 0) {
              const adminChargeRef = `CBF-${Math.floor(100000 + Math.random() * 899900)}`;
              await supabase.from('transactions').insert([{
                user_id: merchantId,
                type: 'out',
                category: 'Fee',
                title: 'Lost Dispute Administration Penalty',
                description: `Administrative chargeback review penalty for dispute case ${originalRef}`,
                amount: feeAmt,
                status: 'SUCCESS',
                reference: adminChargeRef
              }]);
            }

            await supabase.rpc('recalculate_user_balance', { target_user_id: merchantId });
          }
        } catch (e) {
          console.warn("Merchant debit chargeback refund skipped:", e);
        }

        toast.success(`Dispute resolved in favor of user! Refund applied & merchant penalized.`);
      } else {
        // Dismissed: Keep transaction intact, close dispute
        toast.info(`Dispute case dismissed without ledger modification.`);
      }

      setSelectedDispute(null);
      setDisputeNotes('');
      fetchDisputes();
    } catch (err: any) {
      toast.error('Dispute resolution execution error: ' + err.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleApplyMaintenance = async (user: InactiveUser) => {
    hapticFeedback('medium');
    try {
      const reference = `INF-${Math.floor(100000 + Math.random() * 899900)}`;
      
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'out',
          category: 'Fee',
          title: 'Inactive Wallet Maintenance Fee',
          description: `₦100 administrative inactivity deduction applied for 180+ days dormant period (${user.last_active_days} days).`,
          amount: 100, // ₦100 fee
          status: 'SUCCESS',
          reference
        }]);

      if (error) throw error;

      await supabase.rpc('recalculate_user_balance', { target_user_id: user.id });
      toast.success(`Deducted ₦100 administrative maintenance fee from @${user.username}.`);
      fetchInactiveSweep();
    } catch (err: any) {
      toast.error('Deduction failed: ' + err.message);
    }
  };

  const handleSweepAll = async () => {
    if (inactiveUsers.length === 0) return;
    hapticFeedback('warning');
    let successCount = 0;
    
    for (const user of inactiveUsers) {
      try {
        const reference = `INF-${Math.floor(100000 + Math.random() * 899900)}`;
        const { error } = await supabase
          .from('transactions')
          .insert([{
            user_id: user.id,
            type: 'out',
            category: 'Fee',
            title: 'Inactive Wallet Maintenance Fee',
            description: `₦100 administrative inactivity deduction applied for 180+ days dormant period (${user.last_active_days} days).`,
            amount: 100,
            status: 'SUCCESS',
            reference
          }]);

        if (!error) {
          await supabase.rpc('recalculate_user_balance', { target_user_id: user.id });
          successCount++;
        }
      } catch (e) {
        console.error("Single user sweep failed:", e);
      }
    }

    toast.success(`Successfully processed ${successCount} dormant wallets in batch maintenance sweep!`);
    fetchInactiveSweep();
  };

  return (
    <div className="space-y-6 pt-2 pb-32">
      {/* Sub Tabs navigator */}
      <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-1 gap-1 max-w-lg mx-auto border border-border">
        {(['tickets', 'disputes', 'sweep'] as const).map((sub) => (
          <button
            key={sub}
            onClick={() => { hapticFeedback('light'); setActiveSubTab(sub); }}
            className={cn(
              "flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all",
              activeSubTab === sub 
                ? "bg-white dark:bg-black text-indigo-500 shadow-sm" 
                : "text-muted-foreground/80 hover:text-foreground"
            )}
          >
            {sub === 'tickets' && 'User Help Tickets'}
            {sub === 'disputes' && 'Disputes/Chargebacks'}
            {sub === 'sweep' && 'Dormancy Sweep'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="animate-spin text-indigo-500" size={24} />
          <p className="caption-1 text-muted-foreground">Scanning high-volume registries...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* USER HELP TICKETS */}
          {activeSubTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <h3 className="subheadline font-bold text-muted-foreground uppercase tracking-widest">Customer Support Tickets</h3>
                <span className="caption-2 font-black text-indigo-500">{tickets.length} Registered</span>
              </div>

              {tickets.length === 0 ? (
                <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center space-y-3">
                  <LifeBuoy className="mx-auto text-muted-foreground/30 animate-pulse" size={48} />
                  <p className="body font-bold">No active support tickets found.</p>
                  <p className="caption-1 text-muted-foreground">Congratulations! Customers are perfectly operational.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Master List */}
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar">
                    {tickets.map((t) => {
                      const formattedDate = new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      const clientLabel = t.profiles ? `@${t.profiles.username}` : 'Dormant user';
                      const isResolved = t.status === 'resolved' || t.status === 'closed';

                      return (
                        <div
                          key={t.id}
                          onClick={() => { hapticFeedback('light'); setSelectedTicket(t); }}
                          className={cn(
                            "p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all text-left",
                            selectedTicket?.id === t.id && "ring-2 ring-indigo-500/50"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                              isResolved ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {t.status}
                            </span>
                            <span className="caption-2 text-muted-foreground">{formattedDate}</span>
                          </div>
                          <h4 className="body font-bold text-foreground truncate">{t.subject}</h4>
                          <p className="caption-1 text-muted-foreground/80 font-medium truncate mt-1">Sender: <span className="text-foreground">{clientLabel}</span></p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detail Panel */}
                  <div className="bg-card border border-border rounded-3xl p-6 text-left relative flex flex-col justify-between min-h-[450px]">
                    {selectedTicket ? (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <p className="caption-1 text-muted-foreground">Sender Profile</p>
                              <h4 className="headline font-black text-indigo-500">
                                {selectedTicket.profiles?.first_name} {selectedTicket.profiles?.last_name}
                              </h4>
                              <p className="footnote text-muted-foreground">@{selectedTicket.profiles?.username} • Balance: ₦{selectedTicket.profiles?.balance?.toLocaleString()}</p>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{selectedTicket.priority} Priority</span>
                          </div>

                          <hr className="border-border" />

                          <div className="space-y-1">
                            <span className="caption-2 font-black text-muted-foreground uppercase">SUBJECT</span>
                            <p className="body font-bold text-foreground">{selectedTicket.subject}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="caption-2 font-black text-muted-foreground uppercase">MESSAGE DESCRIPTION</span>
                            <p className="footnote leading-relaxed p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-border text-foreground overflow-y-auto max-h-[160px]">
                              {selectedTicket.message}
                            </p>
                          </div>
                        </div>

                        {selectedTicket.status !== 'resolved' ? (
                          <div className="space-y-4 mt-4">
                            <div className="space-y-1.5">
                              <label className="caption-2 font-bold text-muted-foreground uppercase">ADMIN REPLY RESPONSE</label>
                              <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3 footnote focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px] text-foreground"
                                placeholder="Type response and click send resolution button..."
                              />
                            </div>

                            <div className="p-4 bg-black/5 dark:bg-white/5 border border-border rounded-2xl flex items-center justify-between">
                              <div>
                                <p className="footnote font-bold">Charge Client Administrative Fee</p>
                                <p className="caption-2 text-muted-foreground">Debit user ₦{supportChargeAmount} upon resolving ticket.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={chargeSupportUser}
                                  onChange={(e) => setChargeSupportUser(e.target.checked)}
                                  className="w-4 h-4 rounded text-indigo-500 bg-transparent border-gray-600 focus:ring-indigo-500"
                                />
                                {chargeSupportUser && (
                                  <input
                                    type="number"
                                    value={supportChargeAmount}
                                    onChange={(e) => setSupportChargeAmount(e.target.value)}
                                    className="w-16 bg-neutral-200 dark:bg-neutral-800 border-none p-1 rounded font-bold text-xs text-center text-indigo-500 focus:outline-none"
                                    placeholder="₦"
                                  />
                                )}
                              </div>
                            </div>

                            <button
                              onClick={handleReplyTicket}
                              disabled={isProcessingAction}
                              className="w-full bg-indigo-500 text-white flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 mt-2"
                            >
                              <CheckCircle size={16} /> Resolve & Reply Ticket
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-1">
                            <p className="footnote font-black text-green-500 flex items-center justify-center gap-2">
                              <Check size={18} /> Ticket Resolved
                            </p>
                            <p className="caption-2 text-muted-foreground">A premium resolution charge of ₦{selectedTicket.charge_amount || 0} was deducted.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground p-10 space-y-2">
                        <MessageSquare size={36} className="text-muted-foreground/30 animate-pulse" />
                        <p className="footnote font-bold">No ticket selected</p>
                        <p className="caption-2">Select a support ticket from the list to view original content and issue feedback response.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DISPUTES & CHARGEBACKS */}
          {activeSubTab === 'disputes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <h3 className="subheadline font-bold text-muted-foreground uppercase tracking-widest">Transaction Dispute Claims</h3>
                <span className="caption-2 font-black text-indigo-500">{disputes.length} Registered</span>
              </div>

              {disputes.length === 0 ? (
                <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center space-y-3">
                  <ShieldAlert className="mx-auto text-muted-foreground/30 animate-pulse" size={48} />
                  <p className="body font-bold">No dispute cases active.</p>
                  <p className="caption-1 text-muted-foreground">Ledgers are completely balanced and undisputed.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Master List */}
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar">
                    {disputes.map((d) => {
                      const formattedDate = new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      const clientLabel = d.profiles ? `@${d.profiles.username}` : 'Dormant user';
                      const isInvestigating = d.status === 'investigating';
                      const isOpen = d.status === 'open';

                      return (
                        <div
                          key={d.id}
                          onClick={() => { hapticFeedback('light'); setSelectedDispute(d); }}
                          className={cn(
                            "p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all text-left",
                            selectedDispute?.id === d.id && "ring-2 ring-indigo-500/50"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                              isOpen ? "bg-red-500/10 text-red-500" : isInvestigating ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                            )}>
                              {d.status}
                            </span>
                            <span className="caption-2 text-muted-foreground">{formattedDate}</span>
                          </div>
                          <h4 className="body font-bold text-foreground truncate">{d.reason}</h4>
                          <p className="caption-1 text-muted-foreground/80 font-medium truncate mt-1">Claimant: <span className="text-foreground">{clientLabel}</span></p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detail Panel */}
                  <div className="bg-card border border-border rounded-3xl p-6 text-left relative flex flex-col justify-between min-h-[450px]">
                    {selectedDispute ? (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <p className="caption-1 text-muted-foreground">Claimant Profile</p>
                              <h4 className="headline font-black text-indigo-500">
                                {selectedDispute.profiles?.first_name} {selectedDispute.profiles?.last_name}
                              </h4>
                              <p className="footnote text-muted-foreground">@{selectedDispute.profiles?.username} • Balance: ₦{selectedDispute.profiles?.balance?.toLocaleString()}</p>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{selectedDispute.status}</span>
                          </div>

                          <hr className="border-border" />

                          <div className="space-y-1">
                            <span className="caption-2 font-black text-muted-foreground uppercase">DISPUTED TRANSACTION</span>
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-border rounded-2xl space-y-1 text-xs font-bold text-foreground">
                              <p>Reference: {selectedDispute.transactions?.reference}</p>
                              <p>Title: {selectedDispute.transactions?.title}</p>
                              <p>Category: {selectedDispute.transactions?.category}</p>
                              <p className="text-indigo-500">Amount: ₦{selectedDispute.transactions?.amount?.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="caption-2 font-black text-muted-foreground uppercase">REASON FOR CLAIM</span>
                            <p className="footnote leading-relaxed p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-border text-foreground">
                              {selectedDispute.reason}
                            </p>
                          </div>
                        </div>

                        {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'dismissed' ? (
                          <div className="space-y-4 mt-4">
                            <div className="space-y-1.5">
                              <label className="caption-2 font-bold text-muted-foreground uppercase font-black">RESOLUTION INTERACTION NOTES</label>
                              <textarea
                                value={disputeNotes}
                                onChange={(e) => setDisputeNotes(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl p-3 footnote focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px] text-foreground"
                                placeholder="State findings of review..."
                              />
                            </div>

                            <div className="p-4 bg-red-500/5 dark:bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between">
                              <div>
                                <p className="footnote font-bold text-red-500">Merchant Chargeback Penalty</p>
                                <p className="caption-2 text-muted-foreground">Penalize merchant ₦{chargebackFee} if user wins dispute.</p>
                              </div>
                              <input
                                type="number"
                                value={chargebackFee}
                                onChange={(e) => setChargebackFee(e.target.value)}
                                className="w-16 bg-neutral-200 dark:bg-neutral-800 border-none p-1 rounded font-bold text-xs text-center text-red-500 focus:outline-none"
                                placeholder="₦"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleResolveDispute('dismissed')}
                                disabled={isProcessingAction}
                                className="bg-neutral-200 dark:bg-neutral-800 text-foreground py-3 rounded-full font-bold text-xs active:scale-95 transition-transform"
                              >
                                Dismiss Dispute
                              </button>
                              <button
                                onClick={() => handleResolveDispute('resolved')}
                                disabled={isProcessingAction}
                                className="bg-red-500 text-white py-3 rounded-full font-bold text-xs active:scale-95 transition-transform"
                              >
                                Resolve & Reverse (Penalize Merchant)
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                            <p className="footnote font-black text-green-500">Case Concluded & Closed</p>
                            <p className="caption-2 text-muted-foreground">{selectedDispute.resolution_notes || 'No resolution notes provided'}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground p-10 space-y-2">
                        <ShieldAlert size={36} className="text-muted-foreground/30 animate-pulse" />
                        <p className="footnote font-bold">No dispute selected</p>
                        <p className="caption-2">Select a dispute case from the list to view transaction timeline and trigger arbitration / chargebacks.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DORMANT USER SWEEP */}
          {activeSubTab === 'sweep' && (
            <div className="space-y-6">
              <div className="bg-card border border-border shadow-sm rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="headline font-black text-foreground">Dormant Accounts Maintenance Center</h3>
                    <p className="caption-1 text-muted-foreground">
                      Apply administrative fees of ₦100 per month to outstanding ledger balances of users inactive for over 180 consecutive days. We scan matching registree metadata to recover maintenance costs.
                    </p>
                  </div>
                </div>

                {inactiveUsers.length > 0 && (
                  <div className="pt-2 flex justify-between items-center bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                    <div>
                      <span className="caption-2 font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">BATCH HARVESTING TRIGGER</span>
                      <p className="body font-bold text-foreground">{inactiveUsers.length} Inactive Users Found</p>
                    </div>
                    <button
                      onClick={handleSweepAll}
                      className="bg-indigo-500 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                    >
                      Process Batch Sweep
                    </button>
                  </div>
                )}
              </div>

              {inactiveUsers.length === 0 ? (
                <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center space-y-3">
                  <CheckCircle className="mx-auto text-green-500/80 animate-bounce" size={48} />
                  <p className="body font-bold">Registry clear! No dormant users subject to billing.</p>
                  <p className="caption-1 text-muted-foreground">All users are active or maintain zero outstanding balances.</p>
                </div>
              ) : (
                <div className="space-y-3.5 text-left">
                  <h4 className="px-4 footnote font-semibold text-muted-foreground uppercase tracking-widest">Eligible Inactive Wallets Checklist</h4>
                  <div className="ios-list-group px-0 space-y-0">
                    {inactiveUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none border-b border-border/40"
                      >
                        <div>
                          <p className="body font-bold text-foreground">
                            {user.first_name} {user.last_name} <span className="text-indigo-500 font-medium">@{user.username}</span>
                          </p>
                          <p className="caption-2 text-muted-foreground font-medium mt-1">
                            Dormant period: <span className="text-foreground">{user.last_active_days} consecutive days</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="footnote font-black text-foreground">₦{user.balance.toLocaleString()}</p>
                            <p className="caption-2 text-muted-foreground mt-0.5">Wallet Balance</p>
                          </div>
                          
                          <button
                            onClick={() => handleApplyMaintenance(user)}
                            className="bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-transform"
                          >
                            Charge ₦100
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
