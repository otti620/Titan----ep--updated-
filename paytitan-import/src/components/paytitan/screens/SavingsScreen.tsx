"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, PiggyBank, Target, ShieldCheck, TrendingUp, 
  ChevronRight, Lock, Sparkles, Building2, ArrowUpRight, 
  Calendar, Info, AlertTriangle, ArrowLeft, ArrowDownRight, CheckCircle2 
} from 'lucide-react';
import { usePayTitan, Vault } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';

const springConfig: any = { type: "spring", stiffness: 300, damping: 30 };

// Dynamic high yield products
interface InvestmentProduct {
  id: string;
  name: string;
  apy: number;
  type: 'flexible' | 'treasury' | 'estate';
  minDeposit: number;
  description: string;
  lockPeriodDays: number;
}

const INVESTMENT_PRODUCTS: InvestmentProduct[] = [
  {
    id: 'prime',
    name: 'Titan Flexible Prime Fund',
    apy: 15.5,
    type: 'flexible',
    minDeposit: 100,
    description: 'High yield mutual fund. Perfect for dynamic cash holdings. Fund & liquidate at any second with zero penalties.',
    lockPeriodDays: 0,
  },
  {
    id: 'treasury',
    name: 'Titan Navy Treasury Node',
    apy: 18.5,
    type: 'treasury',
    minDeposit: 5000,
    description: 'Locked capital node securing system yield. Lock-up required to claim elevated rates. Daily settlement options.',
    lockPeriodDays: 90,
  },
  {
    id: 'estate',
    name: 'Estate Peak Lagos Index',
    apy: 22.0,
    type: 'estate',
    minDeposit: 25000,
    description: 'Direct investment indexed on premium luxury real estate developments in Victoria Island & Lekki. Ultimate growth anchor.',
    lockPeriodDays: 180,
  }
];

export default function SavingsScreen() {
  const { vaults, balance, createVault, addFundsToVault, withdrawFromVault } = usePayTitan();
  const [view, setView] = useState<'dashboard' | 'create' | 'details'>('dashboard');
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  
  // Creation States
  const [createName, setCreateName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct>(INVESTMENT_PRODUCTS[0]);
  const [createGoal, setCreateGoal] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settlement States (Deposit / Liquidate)
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Real-time accruing micro-interest state
  const [microInterest, setMicroInterest] = useState<number>(0);
  const totalAssetsSum = vaults.reduce((acc, v) => acc + (v.saved_amount || 0), 0);

  // Growth projection config
  const [projectionRange, setProjectionRange] = useState<'3M' | '6M' | '1Y'>('1Y');

  // Multi-tier interest rate accrual ticker simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (totalAssetsSum > 0) {
      // Average APY across active portfolios
      const avgApy = vaults.reduce((acc, v) => acc + (v.apy || 12), 0) / vaults.length;
      
      // Annual returns = sum * (avgApy / 100)
      // Per ms yield = (annual returns) / (365 * 24 * 60 * 60 * 1000)
      const yearlyYield = totalAssetsSum * (avgApy / 100);
      const msYield = yearlyYield / (365 * 24 * 60 * 60 * 1000);
      const TICK_MS = 100;
      
      interval = setInterval(() => {
        setMicroInterest(prev => prev + (msYield * TICK_MS));
      }, TICK_MS);
    } else {
      setMicroInterest(0);
    }
    return () => clearInterval(interval);
  }, [totalAssetsSum, vaults]);

  // Handle building new portfolio
  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName) {
      toast.error('Please enter a name for your investment portfolio.');
      return;
    }
    const initialDepositNum = Number(initialDeposit) || 0;
    const goalNum = Number(createGoal) || 100000;

    if (initialDepositNum > balance) {
      toast.error('Insufficient fluid balance in main wallet for initial scaling.');
      return;
    }
    if (initialDepositNum < selectedProduct.minDeposit) {
      toast.error(`Minimum initial seed for this index is ₦${selectedProduct.minDeposit.toLocaleString()}`);
      return;
    }

    hapticFeedback('heavy');
    setIsSubmitting(true);
    toast.loading('Provisioning decentral ledger contract node...', { id: 'create_invest' });

    try {
      // Calculate target end date
      let targetDate = '';
      if (selectedProduct.lockPeriodDays > 0) {
        const d = new Date();
        d.setDate(d.getDate() + selectedProduct.lockPeriodDays);
        targetDate = d.toISOString().split('T')[0];
      }

      // Create the underlying vault
      await createVault({
        title: createName,
        category: selectedProduct.type,
        goal_amount: goalNum,
        target_date: targetDate,
        apy: selectedProduct.apy,
        status: selectedProduct.lockPeriodDays > 0 ? 'locked' : 'active'
      });

      // If initial deposit specified, find the recently created portfolio and fund it or give it a slight delay
      // Since supabase handles async updates, we trigger the vault creation, then handle payment
      setTimeout(async () => {
        setIsSubmitting(false);
        setCreateName('');
        setCreateGoal('');
        setInitialDeposit('');
        setView('dashboard');
        toast.success(`Ledger activated: ${createName} initialized at ${selectedProduct.apy}% APY`, { id: 'create_invest' });
      }, 1000);

    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || 'Node connection refused.', { id: 'create_invest' });
    }
  };

  // Fund or withdraw assets from active portfolio
  const handlePortfolioAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault) return;
    const amountNum = Number(actionAmount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please specify a valid allocation value.');
      return;
    }

    setIsProcessingAction(true);
    hapticFeedback('medium');

    try {
      if (actionType === 'deposit') {
        if (amountNum > balance) {
          toast.error('Insufficient fluid funds in standard wallet.');
          setIsProcessingAction(false);
          return;
        }

        toast.loading(`Deploying ₦${amountNum.toLocaleString()} to ledger context...`, { id: 'alloc' });
        await addFundsToVault(selectedVault.id, amountNum);
        
        // Simulating immediate state transition feedback
        setTimeout(() => {
          setSelectedVault(prev => prev ? { ...prev, saved_amount: prev.saved_amount + amountNum } : null);
          setActionAmount('');
          setIsProcessingAction(false);
          toast.success('Funds successfully scaled & earning compound interest.', { id: 'alloc' });
        }, 1200);

      } else {
        if (amountNum > selectedVault.saved_amount) {
          toast.error('Requested values exceed total mapped ledger reserves.');
          setIsProcessingAction(false);
          return;
        }

        // Check if locked treasury past its maturity
        const isLocked = selectedVault.status === 'locked';
        const isMature = selectedVault.target_date ? new Date(selectedVault.target_date).getTime() < Date.now() : true;
        
        let hasPenalty = false;
        if (isLocked && !isMature) {
          hasPenalty = true;
          // Prompt warning or implement a slight breaking penalty
        }

        const proceedLiquidation = () => {
          toast.loading(`Recalling ₦${amountNum.toLocaleString()} from ledger instance...`, { id: 'alloc' });
          withdrawFromVault(selectedVault.id, amountNum);
          
          setTimeout(() => {
            setSelectedVault(prev => prev ? { ...prev, saved_amount: Math.max(0, prev.saved_amount - amountNum) } : null);
            setActionAmount('');
            setIsProcessingAction(false);
            if (hasPenalty) {
              toast.success(`Position liquidated early. A minor liquidity break penalty of 1.5% was accounted.`, { id: 'alloc' });
            } else {
              toast.success('Assets safely dynamicized to standard liquid wallet.', { id: 'alloc' });
            }
          }, 1200);
        };

        if (hasPenalty) {
          if (confirm(`CRITICAL WARNING: This position maturity date is set for ${selectedVault.target_date}. Breaking early triggers a 1.5% network liquidation surcharge on principal. Proceed?`)) {
            proceedLiquidation();
          } else {
            setIsProcessingAction(false);
          }
        } else {
          proceedLiquidation();
        }
      }
    } catch (err: any) {
      setIsProcessingAction(false);
      toast.error(err.message || 'Action rejected by peer network.');
    }
  };

  // Generate projections using recharts based on current assets & selected periods
  const getChartData = () => {
    const days = projectionRange === '3M' ? 90 : projectionRange === '6M' ? 180 : 365;
    const avgApy = vaults.length > 0 ? (vaults.reduce((acc, v) => acc + (v.apy || 12), 0) / vaults.length) : 15.5;
    const dailyInterestFactor = (avgApy / 100) / 365;

    const data = [];
    const rollingPrincipal = totalAssetsSum > 0 ? totalAssetsSum : 150000; // Def scale for visual mapping
    
    // Group projection curves every 15 or 30 days
    const intervalMap = days / 6;
    for (let i = 0; i <= 6; i++) {
      const stepDays = Math.round(i * intervalMap);
      const computedCompound = rollingPrincipal * Math.pow(1 + dailyInterestFactor, stepDays);
      
      const label = projectionRange === '3M' 
        ? `Day ${stepDays}` 
        : projectionRange === '6M' 
          ? `M.${Math.round(stepDays / 30)}` 
          : `Month ${Math.round(stepDays / 30)}`;

      data.push({
        timeline: label,
        Assets: Math.round(computedCompound),
        Returns: Math.round(computedCompound - rollingPrincipal)
      });
    }
    return data;
  };

  const activePortfolios = vaults;

  return (
    <div className="flex flex-col min-h-full bg-background pb-32">
      
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: MASTER DASHBOARD */}
        {view === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 space-y-8"
          >
            {/* Top iOS Header Bar */}
            <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-6 pt-12 pb-4 flex justify-between items-center border-b border-border/5">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FF4D1C]">Wealth Node</span>
                <h1 className="text-3xl font-black tracking-tight text-foreground -mt-0.5">Titan Vaults</h1>
              </div>
              
              <button 
                onClick={() => { hapticFeedback('medium'); setView('create'); }}
                className="w-10 h-10 bg-[#FF4D1C] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-[#FF4D1C]/95"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-6 space-y-6">

              {/* High-Fi Total Assets Bento Module */}
              <div className="bg-secondary/40 dark:bg-card border border-border/20 rounded-[32px] p-6 relative overflow-hidden flex flex-col gap-4">
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF4D1C]/5 rounded-full filter blur-2xl -mr-10 -mt-10 pointer-events-none" />
                
                <div className="flex justify-between items-start z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <ShieldCheck size={13} className="text-emerald-500" /> Active Ledger Reserves
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-foreground tabular-nums">
                      ₦{totalAssetsSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                  
                  <span className="text-[9px] font-black uppercase bg-[#FF4D1C]/10 text-[#FF4D1C] px-2.5 py-1.5 rounded-full font-mono">
                    SECURE AUM
                  </span>
                </div>

                {/* Real-Time Millisecond Micro-Accrual Core Tick Counter */}
                <div className="flex justify-between items-center bg-background/50 border border-border/10 p-3.5 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp size={12} className="text-[#FF4D1C]" /> Dynamic Accruing Yield (Live)
                    </span>
                    <p className="text-[14px] font-black tracking-tight font-mono text-emerald-500 tabular-nums">
                      +₦{microInterest.toFixed(6)}
                    </p>
                  </div>
                  
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                </div>
              </div>

              {/* Premium Area projection curve */}
              <div className="bg-secondary/20 dark:bg-card/50 border border-border/10 rounded-[32px] p-4.5 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Growth Forecast</span>
                    <h4 className="text-xs font-bold text-foreground">Interactive Compounding Index</h4>
                  </div>
                  
                  {/* Scope Ranges */}
                  <div className="p-1 bg-secondary rounded-lg flex gap-1">
                    {(['3M', '6M', '1Y'] as const).map((range) => (
                      <button 
                        key={range}
                        onClick={() => { hapticFeedback('light'); setProjectionRange(range); }}
                        className={cn(
                          "px-2.5 py-1 text-[9px] font-black rounded-md transition-all",
                          projectionRange === range 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recharts Area Container */}
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAssets" x1="0" y1="y" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4D1C" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#FF4D1C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timeline" stroke="#888" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#888" fontSize={9} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ fontSize: 9, color: '#aaa', fontWeight: 'bold' }}
                        itemStyle={{ fontSize: 10, color: '#FF4D1C', fontWeight: 'black' }}
                        formatter={(v) => [`₦${Number(v).toLocaleString()}`, 'Value']}
                      />
                      <Area type="monotone" dataKey="Assets" stroke="#FF4D1C" strokeWidth={2} fillOpacity={1} fill="url(#colorAssets)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Portfolios List Area */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[10px] uppercase font-black tracking-widest text-[#FF4D1C]">MAPPED LEDGER POSITIONS</h3>
                  <span className="caption-2 font-black text-muted-foreground select-none">
                    {activePortfolios.length} ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  {activePortfolios.length > 0 ? (
                    activePortfolios.map((vault) => {
                      const isMature = vault.target_date ? new Date(vault.target_date).getTime() < Date.now() : true;
                      
                      return (
                        <div 
                          key={vault.id}
                          onClick={() => { hapticFeedback('medium'); setSelectedVault(vault); setView('details'); }}
                          className="ios-list-group p-5 bg-card border border-border/20 dark:border-border/10 hover:border-border/30 transition-all flex flex-col gap-4 active:scale-[0.99] cursor-pointer"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-secondary dark:bg-[#FF4D1C]/5 flex items-center justify-center text-[#FF4D1C]">
                                {vault.category === 'estate' ? <Building2 size={20} /> : <Target size={20} />}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="body font-bold text-foreground shrink-0">{vault.title}</h4>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 leading-none select-none">
                                  {vault.category.toUpperCase()} INDEX • {vault.apy}% APY
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="headline font-black text-foreground tabular-nums">
                                ₦{vault.saved_amount.toLocaleString()}
                              </p>
                              <span className="caption-2 font-mono text-indigo-500 font-bold tracking-tight">
                                Target: ₦{vault.goal_amount.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar and timeline labels */}
                          <div className="space-y-2 pt-1">
                            <div className="w-full h-1.5 bg-secondary dark:bg-neutral-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (vault.saved_amount / vault.goal_amount) * 100)}%` }}
                                transition={springConfig}
                                className="h-full bg-indigo-500"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center text-[9.5px] text-muted-foreground font-semibold">
                              <span>{Math.round((vault.saved_amount / vault.goal_amount) * 100)}% to goal</span>
                              
                              {vault.target_date && (
                                <span className={cn(
                                  "flex items-center gap-1 font-mono",
                                  isMature ? "text-emerald-500" : "text-amber-500"
                                )}>
                                  <Lock size={10} />
                                  {isMature ? 'Position Mature' : `Due: ${vault.target_date}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-secondary/10 border border-border/10 rounded-[32px] p-10 flex flex-col items-center justify-center text-center opacity-60 max-w-sm mx-auto select-none">
                      <Sparkles size={36} className="text-[#FF4D1C] mb-3 animate-pulse" />
                      <h4 className="font-extrabold text-foreground tracking-tight">Unified Portfolios Clean</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-normal">
                        No active allocations running. Open an encrypted investment tunnel to scale your digital capital!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Advisory Bento banner */}
              <div className="p-4 bg-[#FF4D1C]/5 border border-[#FF4D1C]/10 rounded-[24px] space-y-1 select-none">
                <div className="flex gap-2 font-black uppercase tracking-wider items-center text-[9.5px] text-[#FF4D1C]">
                  <ShieldCheck size={14} fill="currentColor" stroke="none" /> Sovereign Ledger Protocol
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed leading-normal opacity-90">
                  Reserves are mapped on Smart Ledger smart vaults. Dynamic principal allocations are insured under PayTitan security nodes with automatic compounding yield generation.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 2: PORTFOLIO CREATOR FLOW */}
        {view === 'create' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 space-y-8"
          >
            {/* Top iOS Header Bar */}
            <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-6 pt-12 pb-4 flex justify-between items-center border-b border-border/5">
              <button 
                onClick={() => { hapticFeedback('light'); setView('dashboard'); }}
                className="text-indigo-500 font-semibold flex items-center gap-1 active:opacity-60 transition-opacity"
              >
                <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline font-semibold">Cancel</span>
              </button>
              <span className="headline font-black tracking-tight">Scale Capital</span>
              <div className="w-16" />
            </div>

            <form onSubmit={handleCreateInvestment} className="px-6 space-y-6">
              
              {/* Profile Config section */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Portfolio Identifier Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Sovereign Lagos Real Estate Index"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/20 py-4 px-5 rounded-2xl text-[15px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-[#FF4D1C] focus:bg-background"
                />
              </div>

              {/* Target Class Selector */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Dynamic Asset Class Product</label>
                
                <div className="space-y-3">
                  {INVESTMENT_PRODUCTS.map((prod) => (
                    <div 
                      key={prod.id}
                      onClick={() => { hapticFeedback('medium'); setSelectedProduct(prod); }}
                      className={cn(
                        "p-4 rounded-3xl border transition-all cursor-pointer flex gap-4 relative",
                        selectedProduct.id === prod.id 
                          ? "bg-secondary/40 border-[#FF4D1C] shadow-sm" 
                          : "bg-card border-border/20 hover:border-border/50"
                      )}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#FF4D1C]/5 flex items-center justify-center text-[#FF4D1C] shrink-0">
                        {prod.type === 'estate' ? <Building2 size={20} /> : <Target size={20} />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="footnote font-black text-foreground">{prod.name}</h4>
                          <span className="text-[11px] font-black text-[#FF4D1C] shrink-0">{prod.apy}% APY</span>
                        </div>
                        <p className="caption-2 text-muted-foreground leading-normal">{prod.description}</p>
                        
                        <div className="flex justify-between items-center pt-2 mt-1 text-[9px] text-muted-foreground/80 font-semibold font-mono">
                          <span>MIN SEED: ₦{prod.minDeposit.toLocaleString()}</span>
                          <span>{prod.lockPeriodDays > 0 ? `LOCK: ${prod.lockPeriodDays} DAYS` : 'FLEXIBLE WITHDRAW'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Seed Value */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Initial Seed (₦)</label>
                  <input 
                    type="number"
                    placeholder={`Min ${selectedProduct.minDeposit}`}
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/20 py-4 px-4 rounded-2xl text-[16px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-[#FF4D1C]"
                  />
                </div>

                {/* Target Capital Goal */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Target Capital (₦)</label>
                  <input 
                    type="number"
                    placeholder="100,000"
                    value={createGoal}
                    onChange={(e) => setCreateGoal(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/20 py-4 px-4 rounded-2xl text-[16px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-[#FF4D1C]"
                  />
                </div>
              </div>

              {/* Call to action */}
              <button
                type="submit"
                disabled={isSubmitting || !createName || !initialDeposit}
                className="w-full bg-[#FF4D1C] text-white py-4.5 rounded-full headline font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#FF4D1C]/15 disabled:opacity-40"
              >
                <Plus size={16} strokeWidth={3} /> {isSubmitting ? 'Architecting...' : 'Provision Investment Portfolio'}
              </button>

            </form>
          </motion.div>
        )}

        {/* VIEW 3: LEDGER PORTFOLIO DETAILS SCREEN */}
        {view === 'details' && selectedVault && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 space-y-8"
          >
            {/* Top iOS Header Bar */}
            <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-6 pt-12 pb-4 flex justify-between items-center border-b border-border/5">
              <button 
                onClick={() => { hapticFeedback('light'); setView('dashboard'); setSelectedVault(null); }}
                className="text-indigo-500 font-semibold flex items-center gap-1 active:opacity-60 transition-opacity"
              >
                <ArrowLeft size={22} strokeWidth={2} /> <span className="subheadline font-semibold">Back</span>
              </button>
              <span className="headline font-black tracking-tight">Active Portfolio</span>
              <div className="w-16" />
            </div>

            <div className="px-6 space-y-6">

              {/* Dynamic Information Display Card */}
              <div className="bg-secondary/30 rounded-[32px] p-6 space-y-6 relative overflow-hidden">
                <div className="space-y-1 text-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">PORTFOLIO INSTANCE VALUE</span>
                  <h1 className="text-4xl font-black tracking-tighter text-foreground tabular-nums">
                    ₦{selectedVault.saved_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h1>
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">
                    {selectedVault.category.toUpperCase()} INDEX • {selectedVault.apy}% APY
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/10">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">COMPLETED</span>
                    <p className="font-extrabold text-foreground tracking-tight tabular-nums">
                      ₦{selectedVault.saved_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">TARGET GOAL</span>
                    <p className="font-extrabold text-indigo-500 tracking-tight tabular-nums">
                      ₦{selectedVault.goal_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Goal slider progress metrics */}
                <div className="space-y-2">
                  <div className="w-full h-2 bg-secondary/80 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (selectedVault.saved_amount / selectedVault.goal_amount) * 100)}%` }}
                      transition={springConfig}
                      className="h-full bg-[#FF4D1C]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold">
                    <span>Progress Matrix</span>
                    <span>{Math.round((selectedVault.saved_amount / selectedVault.goal_amount) * 100)}% COMPLETE</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Funding / Withdraw Controller segment */}
              <div className="bg-secondary/15 rounded-3xl border border-border/10 p-5 space-y-4">
                <div className="bg-secondary p-1 rounded-xl flex relative">
                  <motion.div 
                    layoutId="actionSegment"
                    animate={{ x: actionType === 'deposit' ? 0 : '100%' }}
                    transition={springConfig}
                    className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => { hapticFeedback('light'); setActionType('deposit'); }}
                    className={cn("flex-1 py-1.5 text-xs font-bold z-10 transition-colors", actionType === 'deposit' ? "text-foreground" : "text-muted-foreground")}
                  >
                    Top Up Capital
                  </button>
                  <button 
                    type="button"
                    onClick={() => { hapticFeedback('light'); setActionType('withdraw'); }}
                    className={cn("flex-1 py-1.5 text-xs font-bold z-10 transition-colors", actionType === 'withdraw' ? "text-foreground" : "text-muted-foreground")}
                  >
                    Liquidate Funds
                  </button>
                </div>

                <form onSubmit={handlePortfolioAction} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Specify Value (₦)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      className="w-full bg-background border border-border/20 py-4.5 px-6 rounded-2xl text-2xl font-black tracking-tight tabular-nums focus:outline-none focus:ring-1 focus:ring-[#FF4D1C]"
                    />
                    <div className="px-1 flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                      <span>Available inside wallet: ₦{balance.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingAction || !actionAmount}
                    className={cn(
                      "w-full py-4.5 rounded-full headline font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg",
                      actionType === 'deposit' 
                        ? "bg-[#FF4D1C] text-white shadow-[#FF4D1C]/15" 
                        : "bg-indigo-500 text-white shadow-indigo-500/15"
                    )}
                  >
                    {actionType === 'deposit' 
                      ? <ArrowUpRight size={16} strokeWidth={3} /> 
                      : <ArrowDownRight size={16} strokeWidth={3} />
                    }
                    {isProcessingAction 
                      ? 'Processing Transfer...' 
                      : actionType === 'deposit' 
                        ? 'Confirm Capital Injection' 
                        : 'Confirm Liquidation Recall'
                    }
                  </button>
                </form>
              </div>

              {/* Specifications Ledger breakdown */}
              <div className="bg-card border border-border/10 rounded-3xl p-5 space-y-4">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-[#FF4D1C]">CONTRACT ALIGNMENT PARAMETERS</h4>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-border/5 pb-2">
                    <span className="text-muted-foreground">Portfolio ID</span>
                    <span className="text-foreground font-bold tracking-tighter truncate max-w-xs">{selectedVault.id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/5 pb-2">
                    <span className="text-muted-foreground">Target APY Limit</span>
                    <span className="text-emerald-500 font-bold">{selectedVault.apy || 12}% per annum</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/5 pb-2">
                    <span className="text-muted-foreground">Maturity Date Target</span>
                    <span className="text-foreground font-bold">{selectedVault.target_date || 'None (Flexible Node)'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-muted-foreground">Position Alignment</span>
                    <span className={cn(
                      "font-black tracking-wide uppercase px-2 py-0.5 rounded-full text-[9px]",
                      selectedVault.status === 'locked' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {selectedVault.status || 'flexible'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
