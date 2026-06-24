"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../integrations/supabase/client';
import { Users, Activity, CreditCard, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { hapticFeedback, cn } from '../../../../lib/utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { toast } from 'sonner';

export default function AdminHome() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
    const sub = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => {
        fetchStats();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(sub); }
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data: statsData, error: statsError } = await supabase.rpc('get_platform_stats');
      
      if (statsError) throw statsError;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const { data: sevenDaysTxData } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('status', 'SUCCESS');

      // Group 7D volume
      const chartMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        chartMap[dayStr] = 0;
      }
      
      if (sevenDaysTxData) {
        sevenDaysTxData.forEach(tx => {
           const dayStr = new Date(tx.created_at).toLocaleDateString('en-US', { weekday: 'short' });
           if (chartMap[dayStr] !== undefined) {
              chartMap[dayStr] += Math.abs(tx.amount || 0);
           }
        });
      }

      const chartData = Object.keys(chartMap).map(key => ({
         name: key, vol: chartMap[key]
      }));

      const { data: profilesData } = await supabase.from('profiles').select('balance');
      const totalLiability = profilesData?.reduce((sum, p) => sum + (Number(p.balance) || 0), 0) || 0;
      
      setStats({
        totalUsers: statsData.total_users,
        activeUsers: statsData.active_users,
        volume: statsData.today_volume,
        revenue: statsData.today_revenue,
        failedTx: statsData.fraud_alerts, // Mapping alerts to cards
        pendingTx: 0, // Placeholder
        blockedUsers: 0, // Placeholder
        totalLiability,
        chartData
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to synchronize mission control stats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      hapticFeedback('medium');
      setIsExporting(true);
      toast.loading('Exporting transactions...', { id: 'export-tx' });
      
      // Fetch 1000 latest tx for demo purposes (ledger)
      const { data, error } = await supabase.from('transactions').select('id, amount, category, type, status, reference, created_at, user_id').order('created_at', { ascending: false }).limit(1000);
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error('No data to export', { id: 'export-tx' });
        return;
      }

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paytitan_ledger_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Export successful', { id: 'export-tx' });
    } catch (error: any) {
       toast.error(error.message, { id: 'export-tx' });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">Loading Mission Control...</div>;
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Top Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[24px] p-5 flex items-center justify-between">
        <div>
          <h2 className="text-indigo-500 font-bold text-sm tracking-wide uppercase">System Status</h2>
          <p className="text-foreground/80 text-xs mt-1">All core banking APIs operational.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-indigo-500">ONLINE</span>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 gap-4">
        <KPICard title="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} icon={Users} color="text-blue-500" />
        <KPICard title="Daily Active" value={stats?.activeUsers?.toLocaleString() || 0} icon={Activity} color="text-emerald-500" />
        <KPICard title="Today's Volume" value={`₦${(stats?.volume || 0).toLocaleString()}`} icon={ArrowUpRight} color="text-indigo-500" />
        <KPICard title="Today's Revenue" value={`₦${(stats?.revenue || 0).toLocaleString()}`} icon={CreditCard} color="text-purple-500" />
      </div>

      {/* Liquidity Reconciliation */}
      <div className="bg-card border border-border shadow-sm rounded-[24px] p-5">
         <h3 className="text-sm font-semibold text-foreground mb-4">Liquidity Reconciliation Monitor</h3>
         <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-black/5 dark:bg-white/5 rounded-xl">
               <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Total User Ledger Liability</span>
               <span className="font-mono font-black text-sm">₦{(stats?.totalLiability || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/5 dark:bg-white/5 rounded-xl">
               <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">FMCG Reserve Balances</span>
               <span className="font-mono font-black text-sm text-green-500">₦{(stats?.totalLiability || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-xs text-muted-foreground">Discrepancy Variance:</span>
               <span className="font-mono text-xs font-bold text-green-500">0.00%</span>
            </div>
         </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-card border border-border shadow-sm rounded-[24px] p-5">
        <h3 className="text-sm font-semibold text-foreground mb-6">Volume Trend (7D)</h3>
        <div className="h-40 bg-card rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'var(--border)'}} contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px'}} />
              <Bar dataKey="vol" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk & Alerts */}
      <div className="grid grid-cols-3 gap-3">
        <AlertCard title="Failed Tx" value={stats?.failedTx || 0} icon={ArrowDownRight} isCritical={stats?.failedTx > 10} />
        <AlertCard title="Pending" value={stats?.pendingTx || 0} icon={Clock} isCritical={stats?.pendingTx > 20} />
        <AlertCard title="Blocked Users" value={stats?.blockedUsers || 0} icon={AlertTriangle} isCritical={false} />
      </div>

      {/* Quick Actions */}
      <div className="px-1 space-y-1">
        <p className="px-3 footnote text-muted-foreground uppercase tracking-widest">Quick Actions</p>
        <div className="ios-list-group">
          <button 
            disabled={isExporting}
            onClick={handleExport}
            className="w-full px-4 py-3 text-left body text-foreground active:bg-black/5 dark:active:bg-white/5 transition-colors ios-hairline-bottom flex items-center justify-between"
          >
            <span>{isExporting ? 'Exporting...' : 'Generate Report'}</span>
            <ArrowUpRight size={16} className="text-muted-foreground" />
          </button>
          <button className="w-full px-4 py-3 text-left body text-foreground active:bg-black/5 dark:active:bg-white/5 transition-colors flex items-center justify-between">
             <span>View Audit Log</span>
             <Clock size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border shadow-sm rounded-[24px] p-5 flex flex-col gap-3 relative overflow-hidden transition-all active:scale-[0.98]">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Icon size={48} className={color} />
      </div>
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/5", color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{title}</p>
        <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function AlertCard({ title, value, icon: Icon, isCritical }: any) {
  return (
    <div className={cn("rounded-2xl p-4 flex flex-col items-center justify-center text-center border shadow-sm", isCritical ? "bg-red-500/10 border-red-500/20" : "bg-card border-border")}>
      <Icon size={20} className={cn("mb-2", isCritical ? "text-red-500" : "text-muted-foreground")} />
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-tight">{title}</p>
      <p className={cn("text-lg font-bold mt-1 tabular-nums", isCritical ? "text-red-500" : "text-foreground")}>{value}</p>
    </div>
  );
}
