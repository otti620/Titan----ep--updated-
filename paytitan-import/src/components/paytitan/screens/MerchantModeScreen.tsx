"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, LayoutDashboard, Share2, Plus, ArrowUpRight, 
  TrendingUp, Users, FileText, QrCode, Building2, 
  ChevronRight, Download, Link2, Sparkles, Send, Receipt, AtSign
} from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { toast } from 'sonner';

const MerchantModeScreen = ({ onBack }: { onBack: () => void }) => {
  const [showQR, setShowQR] = useState(false);
  const { profile, balance, toggleMerchantMode } = usePayTitan();

  const businessName = `${profile?.first_name}'s Architect Store`;

  const storeSales = [
    { id: 1, customer: "Folake", amount: 4500, time: "2m ago", status: "Paid" },
    { id: 2, customer: "Tunde Titan", amount: 12000, time: "1h ago", status: "Paid" },
    { id: 3, customer: "Emeka", amount: 2500, time: "3h ago", status: "Pending" },
  ];

  const handleShareStore = () => {
    hapticFeedback('medium');
    setShowQR(true);
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#000000] flex flex-col relative">
      {/* Merchant Header */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white dark:bg-black/50 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black tracking-widest text-[#FF4D1C] uppercase italic">MERCHANT CORE</span>
          <span className="text-lg font-bold text-[#1A2130] dark:text-white">{businessName}</span>
        </div>
        <button onClick={toggleMerchantMode} className="w-10 h-10 bg-[#FF4D1C]/10 text-[#FF4D1C] rounded-full flex items-center justify-center border border-[#FF4D1C]/20">
          <AtSign size={18} />
        </button>
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-32 no-scrollbar pt-6">
        {/* Business Stats */}
        <div className="bg-[#1A2130] p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D1C] opacity-20 blur-[60px] rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">BUSINESS REVENUE</p>
                <h3 className="text-4xl font-bold text-white tracking-tighter">₦{(balance * 1.82).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-[#FF4D1C]" size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatItem label="Sales/Week" value="₦450,000" />
              <StatItem label="Customers" value="2,401" />
            </div>
          </div>
        </div>

        {/* QR Overlay */}
        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
              onClick={() => setShowQR(false)}
            >
              <div 
                className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#1A2130] dark:text-white italic">Store POS QR</h3>
                  <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-red-500"><Plus className="rotate-45" /></button>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-inner inline-block mx-auto border-4 border-[#FF4D1C]/20">
                  <QrCode size={180} className="text-[#1A2130]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A2130] dark:text-white uppercase tracking-widest">{businessName}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">SCAN TO SETTLE INVOICE</p>
                </div>
                <button 
                  onClick={() => { hapticFeedback('success'); toast.success('QR Code saved to gallery'); setShowQR(false); }}
                  className="w-full bg-[#FF4D1C] py-4 rounded-2xl text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Download Store QR
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store QR & Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
           <MerchantAction 
              icon={<QrCode size={24} />} 
              label="Store QR" 
              color="bg-blue-500" 
              onClick={handleShareStore} 
           />
           <MerchantAction 
              icon={<Link2 size={24} />} 
              label="Pay Link" 
              color="bg-[#FF4D1C]" 
              onClick={() => toast.success('Payment link copied to clipboard!')} 
           />
        </div>

        {/* Sales Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">RECENT SALES</h3>
            <span className="text-[10px] font-bold text-[#FF4D1C] uppercase tracking-widest">Live Loop</span>
          </div>

          <div className="space-y-3">
            {storeSales.map((sale) => (
              <div key={sale.id} className="bg-white dark:bg-white/5 p-5 rounded-[32px] border border-gray-50 dark:border-white/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sale.customer}`} 
                      className="w-full h-full rounded-2xl opacity-80" 
                      alt="Customer" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A2130] dark:text-white">Customer: {sale.customer}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{sale.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#1A2130] dark:text-white">₦{sale.amount.toLocaleString()}</p>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                    sale.status === 'Paid' ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                  )}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Tools Ticker */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[40px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-10 -mt-10" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-black tracking-widest text-white/60 uppercase">Titan Business Advice</p>
              <p className="text-[13px] font-bold text-white leading-tight">
                "Small Business Owners who use Payment Links see a 40% faster settlement rate. Generate yours today."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white/5 p-4 rounded-3xl">
    <p className="text-white/40 text-[9px] font-black uppercase mb-1 tracking-widest">{label}</p>
    <p className="text-lg font-bold text-white tracking-tight">{value}</p>
  </div>
);

const MerchantAction = ({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) => (
  <button 
    onClick={() => { hapticFeedback('medium'); onClick(); }}
    className={cn(
      "w-full p-6 rounded-[40px] flex flex-col items-center gap-3 transition-all active:scale-95 shadow-lg",
      color, "text-white"
    )}
  >
    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
      {icon}
    </div>
    <span className="text-[11px] font-black uppercase tracking-widest italic">{label}</span>
  </button>
);

export default MerchantModeScreen;
