"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../integrations/supabase/client';
import { usePayTitan } from '../../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import { 
  Network, 
  Settings2, 
  Send, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Tv, 
  Activity, 
  Info, 
  Database, 
  Globe, 
  Key,
  ChevronRight,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';

interface WebhookLog {
  id: string;
  timestamp: string;
  partner: string;
  endpoint: string;
  status: number;
  message: string;
  amount: number;
  payload: string;
}

export default function FintechPartnersHub() {
  const { profile, balance, refreshData } = usePayTitan();
  
  // Tab control
  const [activeSubTab, setActiveSubTab] = useState<'sim' | 'vtu' | 'credentials'>('sim');
  
  // Custom API configurations saved locally
  const [creds, setCreds] = useState({
    paystackSecretKey: '',
    flutterwaveSecretKey: '',
    monnifySecretKey: '',
    payscribeApiKey: '',
    mode: 'sandbox' // sandbox or live
  });

  // Simulator configurations
  const [simPartner, setSimPartner] = useState<'paystack' | 'flutterwave' | 'monnify' | 'payscribe'>('paystack');
  const [simAmount, setSimAmount] = useState('5000');
  const [simEmail, setSimEmail] = useState(profile?.email || 'user@paytitan.com');
  const [simRef, setSimRef] = useState(`TX-${Math.floor(1000000 + Math.random() * 9000000)}`);
  
  // VTU Simulator config
  const [vtuType, setVtuType] = useState<'airtime' | 'data'>('airtime');
  const [vtuNetwork, setVtuNetwork] = useState('mtn');
  const [vtuPhone, setVtuPhone] = useState('08031234567');
  const [vtuAmount, setVtuAmount] = useState('1000');
  const [vtuProvider, setVtuProvider] = useState<'payscribe' | 'flutterwave'>('payscribe');

  // Logs terminal
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isFiring, setIsFiring] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  
  // Load local configurations if present
  useEffect(() => {
    const saved = localStorage.getItem('paytitan_fintech_creds');
    if (saved) {
      try {
        setCreds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCreds = (newCreds: typeof creds) => {
    setCreds(newCreds);
    localStorage.setItem('paytitan_fintech_creds', JSON.stringify(newCreds));
    toast.success('Fintech credentials cached for simulation.');
  };

  // Autogenerate payloads
  const getSimulatedPayload = () => {
    const amount = parseFloat(simAmount) || 0;
    switch (simPartner) {
      case 'paystack':
        return {
          event: "charge.success",
          data: {
            id: Math.floor(Math.random() * 1000000),
            domain: "test",
            status: "success",
            reference: simRef,
            amount: amount * 100, // Paystack operates in kobo
            message: null,
            gateway_response: "Approved",
            channel: "dedicated_nuban",
            currency: "NGN",
            customer: {
              id: Math.floor(Math.random() * 500000),
              first_name: profile?.first_name || "Sandbox",
              last_name: profile?.last_name || "User",
              email: simEmail,
              phone: "08030000000",
              metadata: null,
              customer_code: "CUS_9x8y7z6a"
            }
          }
        };
      case 'flutterwave':
        return {
          event: "charge.completed",
          data: {
            id: Math.floor(Math.random() * 1000000),
            tx_ref: simRef,
            flw_ref: `FLW-${simRef}`,
            device_fingerprint: "69x8y7z6a",
            amount: amount,
            currency: "NGN",
            charged_amount: amount,
            app_fee: amount * 0.014,
            merchant_fee: 0,
            processor_response: "Approved",
            status: "successful",
            payment_type: "bank_transfer",
            customer: {
              id: Math.floor(Math.random() * 500000),
              name: `${profile?.first_name || "Sandbox"} ${profile?.last_name || "User"}`,
              phone_number: "08031111111",
              email: simEmail,
              created_at: new Date().toISOString()
            }
          }
        };
      case 'monnify':
        return {
          eventType: "SUCCESSFUL_TRANSACTION",
          eventData: {
            product: {
              reference: simRef,
              type: "RESERVED_ACCOUNT"
            },
            transactionReference: `MNF-${simRef}`,
            paymentReference: simRef,
            amountPaid: amount.toFixed(2),
            payableAmount: amount.toFixed(2),
            paymentStatus: "PAID",
            paymentDescription: "Virtual Account Transfer auto-received",
            paymentSourceInformation: [
              {
                bankCode: "058",
                amountPaid: amount.toFixed(2),
                accountName: "SENDER BANK PL PLC",
                accountNumber: "0123456789"
              }
            ],
            customer: {
              name: `${profile?.first_name || "Sandbox"} ${profile?.last_name || "User"}`,
              email: simEmail
            },
            bankName: "Wema Bank (Monnify Partner)"
          }
        };
      case 'payscribe':
        return {
          event: "transaction.update",
          status: "success",
          amount: amount,
          user_email: simEmail,
          transaction_id: simRef,
          message: `Automatic VTU pipe topup funding from Payscribe. Ref: ${simRef}`
        };
      default:
        return {};
    }
  };

  const handleFireWebhook = async () => {
    hapticFeedback('medium');
    setIsFiring(true);
    toast.loading('Firing webhook payload to server API...', { id: 'wh-fire' });

    const payload = getSimulatedPayload();
    const endpoint = `/api/webhooks/${simPartner}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': 'simulated_signature_hash',
          'verif-hash': 'simulated_verif_hash',
          'monnify-signature': 'simulated_monnify_hash',
          'x-payscribe-signature': 'simulated_payscribe_hash'
        },
        body: JSON.stringify(payload)
      });

      const resText = await response.text();
      let resJson;
      try {
        resJson = JSON.parse(resText);
      } catch (err) {
        resJson = { raw: resText };
      }

      setLastResponse({
        status: response.status,
        statusText: response.statusText,
        data: resJson
      });

      const newLog: WebhookLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        partner: simPartner.toUpperCase(),
        endpoint,
        status: response.status,
        message: resJson.message || 'Processed successfully.',
        amount: parseFloat(simAmount) || 0,
        payload: JSON.stringify(payload, null, 2)
      };

      setWebhookLogs(prev => [newLog, ...prev]);

      if (response.ok) {
        toast.success(`Webhook reconciled! Wallet +₦${parseFloat(simAmount).toLocaleString()}`, { id: 'wh-fire' });
        // Regenerate reference for next simulation
        setSimRef(`TX-${Math.floor(1000000 + Math.random() * 9000000)}`);
        
        // Refresh balance and ledger database context
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else {
        toast.error(`Reconciliation Failed: ${resJson.message || 'Incompatible payload'}`, { id: 'wh-fire' });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Internal connection error: ${err.message}`, { id: 'wh-fire' });
    } finally {
      setIsFiring(false);
    }
  };

  const handleTestVtu = async () => {
    hapticFeedback('medium');
    setIsFiring(true);
    toast.loading('Executing server-side VTU process...', { id: 'vtu-test' });

    try {
      const response = await fetch('/api/payments/vtu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: profile?.id,
          amount: parseFloat(vtuAmount),
          phone: vtuPhone,
          network: vtuNetwork,
          type: vtuType,
          provider: vtuProvider
        })
      });

      const data = await response.json();
      setLastResponse({
         status: response.status,
         statusText: response.statusText,
         data: data
      });

      if (response.ok) {
        toast.success(`VTU Purchase Registered! NGN ${parseFloat(vtuAmount).toLocaleString()} deducted from wallet.`, { id: 'vtu-test' });
        refreshData();
      } else {
        toast.error(`VTU failed: ${data.message}`, { id: 'vtu-test' });
      }
    } catch (err: any) {
      toast.error(`VTU Pipeline Connection Error: ${err.message}`, { id: 'vtu-test' });
    } finally {
      setIsFiring(false);
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-32 px-1">
      {/* Top Banner & Status */}
      <div className="bg-card border border-border rounded-[24px] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h2 className="headline tracking-tight text-foreground font-bold">API Partner Tunnels</h2>
              <p className="caption-1 text-muted-foreground">Virtual accounts routing and automated ledger updates.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-green-500">READY</span>
          </div>
        </div>

        {/* Local Callback Endpoints Information (Developer Help) */}
        <div className="p-4 bg-muted/50 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Globe size={12} /> Webhook Callback Web Addresses
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            In production, configure these URLs inside your partner consoles (e.g., Paystack/Flutterwave dashboard) to auto-catch live transactions.
          </p>
          <div className="space-y-1.5 pt-1">
            <EndpointRow label="PAYSTACK CALLBACK" path="/api/webhooks/paystack" />
            <EndpointRow label="FLUTTERWAVE CALLBACK" path="/api/webhooks/flutterwave" />
            <EndpointRow label="MONNIFY CALLBACK" path="/api/webhooks/monnify" />
            <EndpointRow label="PAYSCRIBE CALLBACK" path="/api/webhooks/payscribe" />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl">
        <button 
          onClick={() => { hapticFeedback('light'); setActiveSubTab('sim'); }}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
            activeSubTab === 'sim' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground/80 hover:text-foreground"
          )}
        >
          <Send size={14} /> Webhook Simulator
        </button>
        <button 
          onClick={() => { hapticFeedback('light'); setActiveSubTab('vtu'); }}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
            activeSubTab === 'vtu' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground/80 hover:text-foreground"
          )}
        >
          <Smartphone size={14} /> VTU Aggregator
        </button>
        <button 
          onClick={() => { hapticFeedback('light'); setActiveSubTab('credentials'); }}
          className={cn(
            "flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
            activeSubTab === 'credentials' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground/80 hover:text-foreground"
          )}
        >
          <Settings2 size={14} /> Partner Creds
        </button>
      </div>

      {/* TAB 1: WEBHOOK SIMULATOR */}
      {activeSubTab === 'sim' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Card */}
          <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 space-y-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity size={15} /> VA Transfer simulation
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Select Channel Partner</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['paystack', 'flutterwave', 'monnify', 'payscribe'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => { hapticFeedback('light'); setSimPartner(p); }}
                      className={cn(
                        "py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all truncate",
                        simPartner === p 
                          ? "bg-indigo-500 text-white border-indigo-500" 
                          : "bg-black/5 dark:bg-white/5 border-border text-muted-foreground hover:bg-black/10"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Transfer Amount (₦)</label>
                  <input 
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Simulated Customer</label>
                  <input 
                    type="text"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="user@paytitan.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Transaction Ref / Session ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    readOnly
                    value={simRef}
                    className="flex-1 bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2 text-xs font-mono font-medium focus:outline-none"
                  />
                  <button 
                    onClick={() => { hapticFeedback('light'); setSimRef(`TX-${Math.floor(1000000 + Math.random() * 9000000)}`); }}
                    className="px-3 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500/20 transition-all flex items-center justify-center border border-indigo-500/15"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Payload Preview */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Webhook Payload (JSON)</label>
                  <span className="text-[9px] font-mono text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">HTTP POST</span>
                </div>
                <pre className="p-3 bg-black dark:bg-[#1E1E1E] text-[#80CBC4] text-[8px] font-mono rounded-xl border border-border overflow-x-auto max-h-40 no-scrollbar">
                  {JSON.stringify(getSimulatedPayload(), null, 2)}
                </pre>
              </div>

              <button
                disabled={isFiring}
                onClick={handleFireWebhook}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> {isFiring ? 'Filing payment update event...' : `Auto-Catch payment transfer (₦${(parseFloat(simAmount) || 0).toLocaleString()})`}
              </button>
            </div>
          </div>

          {/* Response & Live Streams */}
          <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 flex flex-col gap-5 h-[480px]">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Terminal size={15} /> Sandbox console logs
            </h3>

            {/* Terminal Response logs */}
            {lastResponse && (
               <div className="p-3 bg-black text-xs font-mono rounded-xl border border-border text-left overflow-y-auto h-24 no-scrollbar">
                  <p className="text-[9px] text-gray-500">SERVER RESPONSE LOG ({new Date().toLocaleTimeString()}):</p>
                  <p className={cn("font-bold text-[10px]", lastResponse.status < 400 ? 'text-green-400' : 'text-red-400')}>
                    HTTP {lastResponse.status} {lastResponse.statusText}
                  </p>
                  <p className="text-[9px] text-[#A6ACCD] mt-1">{JSON.stringify(lastResponse.data, null, 1)}</p>
               </div>
            )}

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-1">Catch stream logs</p>
              {webhookLogs.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/40 gap-2 border border-dashed border-border rounded-xl">
                   <Terminal size={24} strokeWidth={1} />
                   <p className="caption-1 font-semibold">Ready for test payloads</p>
                </div>
              ) : (
                webhookLogs.map(log => (
                  <div key={log.id} className="p-3 bg-muted/30 rounded-xl border border-border text-left space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {log.partner}
                      </span>
                      <span className="text-[8px] text-muted-foreground font-mono">{log.timestamp}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground truncate">{log.endpoint}</span>
                      <span className={cn("font-black font-mono", log.status < 400 ? 'text-green-500' : 'text-red-500')}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-foreground bg-black/5 dark:bg-white/5 p-1 px-1.5 rounded flex items-center justify-between">
                       <span>{log.message}</span>
                       <span className="font-bold text-indigo-500">+₦{log.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VTU AGGREGATOR */}
      {activeSubTab === 'vtu' && (
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Outbound Airtime & Utility Bills Tunnels</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => { hapticFeedback('light'); setVtuType('airtime'); }}
                className={cn("px-3 py-1 text-[10px] font-bold rounded-lg border", vtuType === 'airtime' ? "bg-indigo-500 text-white border-indigo-500" : "bg-neutral-100 dark:bg-neutral-800 border-border")}
              >
                Airtime
              </button>
              <button 
                onClick={() => { hapticFeedback('light'); setVtuType('data'); }}
                className={cn("px-3 py-1 text-[10px] font-bold rounded-lg border", vtuType === 'data' ? "bg-indigo-500 text-white border-indigo-500" : "bg-neutral-100 dark:bg-neutral-800 border-border")}
              >
                Data Plan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input card */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Biller Provider Pipe</label>
                  <select
                    value={vtuProvider}
                    onChange={(e) => setVtuProvider(e.target.value as any)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="payscribe">Payscribe API</option>
                    <option value="flutterwave">Flutterwave Bills API</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Network/Operator</label>
                  <select
                    value={vtuNetwork}
                    onChange={(e) => setVtuNetwork(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="mtn">MTN Nigeria</option>
                    <option value="airtel">Airtel Nigeria</option>
                    <option value="glo">Globacom (Glo)</option>
                    <option value="9mobile">9mobile</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Recipient Number</label>
                  <input 
                    type="tel"
                    value={vtuPhone}
                    onChange={(e) => setVtuPhone(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                    placeholder="08031234567"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Amount (₦)</label>
                  <input 
                    type="number"
                    value={vtuAmount}
                    onChange={(e) => setVtuAmount(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                    placeholder="1000"
                  />
                </div>
              </div>

              <button
                disabled={isFiring}
                onClick={handleTestVtu}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Smartphone size={14} /> {isFiring ? 'Connecting Aggregator...' : `Perform Test Outbound Refill (₦${(vtuAmount).toLocaleString()})`}
              </button>
            </div>

            {/* Outbound Developer Payload documentation */}
            <div className="space-y-3 bg-muted/40 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">API OUTBOUND DOCUMENTATION</span>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  When a user verifies with security.pin to buy Airtime, Data, Electricity DISCOS, or Cable TV on their screens, the app securely passes details to our backend proxy, keeping API secrets locked safely in our server logs without browser leakage.
                </p>
              </div>

              <div className="space-y-1.5 font-mono text-[9px] text-[#A6ACCD]">
                 <div className="flex justify-between items-center bg-black/10 dark:bg-black/40 p-1.5 rounded">
                     <span>PROXY ENDPOINT</span>
                     <span className="font-bold text-white font-sans text-[8px] bg-indigo-500 px-1.5 py-0.5 rounded">POST /api/payments/vtu</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/10 dark:bg-black/40 p-1.5 rounded">
                     <span>LAZY AUTH HEADERS</span>
                     <span className="text-green-500">Authorization: Bearer [PROVIDER_SECRET]</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/10 dark:bg-black/40 p-1.5 rounded">
                     <span>PROVIDER TARGET API</span>
                     <span className="text-indigo-400 font-bold truncate">
                       {vtuProvider === 'payscribe' ? 'api.payscribe.ng/v1/airtime' : 'api.flutterwave.com/v3/bills'}
                     </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNER CREDENTIALS SETUP */}
      {activeSubTab === 'credentials' && (
        <div className="bg-card border border-border shadow-sm rounded-[24px] p-6 space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Key size={15} /> Environment variables
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              These secret keys are stored client-side in your secure browser session for sandbox execution testing only. For real deployments, add them to your <code className="font-mono bg-neutral-100 dark:bg-neutral-800 text-red-500 px-1 rounded">.env</code> or server cloud configurations.
            </p>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between pl-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">PAYSTACK SECRET KEY</label>
                    <span className="text-[8px] font-mono text-gray-400">sk_test_...</span>
                  </div>
                  <input 
                    type="password"
                    value={creds.paystackSecretKey}
                    onChange={(e) => saveCreds({ ...creds, paystackSecretKey: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter Paystack API Key"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between pl-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">FLUTTERWAVE SECRET KEY</label>
                    <span className="text-[8px] font-mono text-gray-400">FLWSECK_test_...</span>
                  </div>
                  <input 
                    type="password"
                    value={creds.flutterwaveSecretKey}
                    onChange={(e) => saveCreds({ ...creds, flutterwaveSecretKey: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter Flutterwave API Key"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between pl-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">MONNIFY SECRET KEY</label>
                    <span className="text-[8px] font-mono text-gray-400">MK_TEST...</span>
                  </div>
                  <input 
                    type="password"
                    value={creds.monnifySecretKey}
                    onChange={(e) => saveCreds({ ...creds, monnifySecretKey: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter Monnify Client Secret"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between pl-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">PAYSCRIBE API KEY</label>
                    <span className="text-[8px] font-mono text-gray-400">PSB_KEY...</span>
                  </div>
                  <input 
                    type="password"
                    value={creds.payscribeApiKey}
                    onChange={(e) => saveCreds({ ...creds, payscribeApiKey: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter Payscribe API Key"
                  />
                </div>
             </div>

             <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3 text-xs leading-relaxed text-yellow-600 dark:text-yellow-400">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p>
                   <strong>Security Standard Warning:</strong> If real workspace environment credentials are found in the project host (.env.example), your backend server will automatically switch from <strong>Sandbox Simulation</strong> to <strong>Live Integration Piping</strong>, securing user payments securely.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EndpointRow({ label, path }: { label: string, path: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}${path}` : path;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success(`${label} Copied to Clip-Board!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1 p-2 bg-black/10 dark:bg-black/30 rounded-xl">
      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
         <span>{label}</span>
         <button onClick={handleCopy} className="text-indigo-400 hover:text-indigo-300 active:opacity-60 flex items-center gap-0.5 transition-all uppercase">
           {copied ? <span className="text-green-400 font-sans tracking-wide">Copied</span> : 'Copy'}
         </button>
      </div>
      <span className="font-mono text-[9px] text-indigo-500 dark:text-indigo-400 break-all select-all font-semibold leading-tight">
        {fullUrl}
      </span>
    </div>
  );
}
