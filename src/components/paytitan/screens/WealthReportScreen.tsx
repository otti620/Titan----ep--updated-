"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, PieChart, Wallet, ArrowUpRight, ShieldCheck, Sparkles, BarChart3, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { usePayTitan } from '../../../context/PayTitanContext';
import { cn } from '../../../lib/utils';

const WealthReportScreen = ({ onBack }: { onBack: () => void }) => {
  const { transactions, balance, vaults } = usePayTitan();

  const reportData = useMemo(() => {
    const categories: Record<string, { value: number, color: string }> = {
      'Airtime': { value: 0, color: '#FF4D1C' },
      'Data': { value: 0, color: '#2962FF' },
      'Electricity': { value: 0, color: '#FFD600' },
      'Cable TV': { value: 0, color: '#AA00FF' },
      'Transfer': { value: 0, color: '#00C853' },
      'Others': { value: 0, color: '#757575' },
    };

    let totalOutflow = 0;
    let totalInflow = 0;

    transactions.forEach(tx => {
      if (tx.type === 'out') {
        const cat = categories[tx.category] ? tx.category : 'Others';
        categories[cat].value += Math.abs(tx.amount);
        totalOutflow += Math.abs(tx.amount);
      } else {
        totalInflow += Math.abs(tx.amount);
      }
    });

    const chartData = Object.entries(categories)
      .filter(([_, data]) => data.value > 0)
      .map(([name, data]) => ({
        name,
        value: data.value,
        color: data.color
      }))
      .sort((a, b) => b.value - a.value);

    // Titan Score Metrics
    const volume = totalInflow + totalOutflow;
    const savingsRatio = (vaults.reduce((acc, v) => acc + (v.saved_amount || 0), 0) / (balance + 1)) * 100;
    const activityFactor = Math.min(100, (transactions.length / 20) * 100);
    
    let grade = 'F9';
    let gradeColor = 'text-gray-400';
    if (volume > 1000000) { grade = 'A1'; gradeColor = 'text-amber-500'; }
    else if (volume > 500000) { grade = 'B2'; gradeColor = 'text-blue-500'; }
    else if (volume > 100000) { grade = 'C4'; gradeColor = 'text-emerald-500'; }
    else if (volume > 10000) { grade = 'D7'; gradeColor = 'text-sky-500'; }

    return { chartData, totalOutflow, totalInflow, volume, savingsRatio, activityFactor, grade, gradeColor };
  }, [transactions, balance, vaults]);

  const { chartData, totalOutflow, totalInflow, volume, savingsRatio, activityFactor, grade, gradeColor } = reportData;

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Financial Grade</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-12 pt-4 no-scrollbar">
        {/* Grade Section */}
        <div className="flex flex-col items-center justify-center space-y-2 py-4">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Current WAEC Rating</p>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("text-9xl font-black italic tracking-tighter drop-shadow-sm", gradeColor)}
          >
            {grade}
          </motion.div>
          <div className="px-4 py-1.5 bg-background border border-border rounded-full flex items-center gap-2">
            <Award size={14} className="text-[#FF4D1C]" />
            <span className="text-xs font-bold uppercase tracking-widest">Titan Architect Status</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard title="SAVINGS RATIO" value={`${Math.round(savingsRatio)}%`} subtitle="vs Liquid Cash" progress={savingsRatio} />
          <MetricCard title="ACTIVITY" value={`${Math.round(activityFactor)}%`} subtitle="Titan Loop usage" progress={activityFactor} />
        </div>

        {/* Summary Card */}
        <div className="bg-[#1A2130] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-10 blur-[60px] rounded-full -mr-10 -mt-10" />
          <div className="relative z-10 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">CASH OUT</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">₦{totalOutflow.toLocaleString()}</h3>
              </div>
              <div>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">CASH IN</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">₦{totalInflow.toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="h-px bg-white/5" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#FF4D1C] w-4 h-4" />
                <span className="text-[10px] font-bold text-white/60 uppercase">TitanAI Insight</span>
              </div>
              <p className="text-[10px] text-white/40">
                {volume > 100000 ? "High ecosystem contribution." : "Growth phase detected."}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Spending Blueprint</h3>
             <BarChart3 size={16} className="text-gray-400" />
          </div>
          {chartData.length > 0 ? (
            <div className="h-64 w-full bg-white dark:bg-[#1A2130] rounded-[40px] p-6 shadow-sm border border-gray-50 dark:border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1A2130] rounded-[40px] p-12 text-center opacity-40 border border-gray-50 dark:border-white/5">
               <p className="text-sm font-bold">No expenditure recorded yet.</p>
            </div>
          )}
        </div>

        {/* Breakdown List */}
        {chartData.length > 0 && (
          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.name} className="bg-white dark:bg-[#1A2130] p-5 rounded-[32px] flex items-center justify-between shadow-sm border border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/5">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <span className="text-sm font-bold text-[#1A2130] dark:text-white">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#1A2130] dark:text-white">₦{item.value.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{Math.round((item.value / totalOutflow) * 100)}% weight</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={onBack}
          className="w-full bg-[#1A2130] dark:bg-white text-white dark:text-[#1A2130] py-5 rounded-[32px] font-bold text-sm uppercase tracking-widest shadow-xl"
        >
          Confirm Recap
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, progress }: { title: string, value: string, subtitle: string, progress: number }) => (
  <div className="bg-white dark:bg-[#1A2130] p-6 rounded-[32px] space-y-4 shadow-sm border border-gray-50 dark:border-white/5">
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-[#1A2130] dark:text-white tracking-tighter">{value}</p>
    </div>
    <div className="space-y-2">
      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-[#FF4D1C]"
        />
      </div>
      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tight">{subtitle}</p>
    </div>
  </div>
);

export default WealthReportScreen;