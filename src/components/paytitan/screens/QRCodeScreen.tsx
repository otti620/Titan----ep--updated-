"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2, ShieldCheck, Smartphone, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsQR from 'jsqr';
import { usePayTitan } from '../../../context/PayTitanContext';
import { safeShare, hapticFeedback } from '../../../lib/utils';

const QRCodeScreen = ({ onBack, onScan }: { onBack: () => void, onScan?: (handle: string) => void }) => {
  const { profile } = usePayTitan();
  const [activeTab, setActiveTab] = useState<'scan' | 'mycode'>('mycode');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handle = profile?.username || 'titan.user';
  const fullName = `${profile?.first_name} ${profile?.last_name}`;
  const qrValue = `paytitan:pay:${handle}`;

  const handleShare = async () => {
    const text = `Pay me on PayTitan! My handle is @${handle}. https://paytitan.com/pay/${handle}`;
    const result = await safeShare({
      title: 'TitanPay QR Code',
      text,
    }, text);

    if (result === 'copied') {
      toast.success("Payment handle copied!");
    }
  };

  const processScanData = (data: string) => {
    if (data.startsWith('paytitan:pay:')) {
      const scannedHandle = data.split(':')[2];
      toast.success(`Found handle: @${scannedHandle}`);
      hapticFeedback('success');
      if (onScan) onScan(scannedHandle);
    } else {
      hapticFeedback('error');
      toast.error("Invalid PayTitan QR Code");
    }
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      processScanData(result[0].rawValue);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          processScanData(code.data);
        } else {
          toast.error("No QR code found in image.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full w-full bg-[#1A2130] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-xl font-bold text-white">TitanPay QR</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-12">
        {/* Tabs */}
        <div className="bg-white/5 p-1.5 rounded-full flex gap-2 border border-white/10">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'scan' ? 'bg-[#FF4D1C] text-white shadow-lg' : 'text-white/40'}`}
          >
            SCAN QR
          </button>
          <button 
            onClick={() => setActiveTab('mycode')}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'mycode' ? 'bg-[#FF4D1C] text-white shadow-lg' : 'text-white/40'}`}
          >
            MY CODE
          </button>
        </div>

        {activeTab === 'mycode' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center space-y-8"
          >
            <div className="bg-white p-8 rounded-[48px] shadow-[0_0_60px_rgba(255,77,28,0.2)] relative">
              <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200 overflow-hidden p-2">
                <QRCode 
                  value={qrValue}
                  size={240}
                  level="H"
                  fgColor="#1A2130"
                  bgColor="#ffffff"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#FF4D1C] px-6 py-2 rounded-full shadow-lg">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">@{handle}</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-white text-xl font-bold">{fullName}</h3>
              <p className="text-white/40 text-sm">Show this code to receive instant payments.</p>
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(handle);
                  toast.success("Handle copied!");
                }}
                className="flex-1 bg-white/5 border border-white/10 py-5 rounded-[32px] flex items-center justify-center gap-3 text-white font-bold active:scale-95 transition-transform"
              >
                <Copy size={20} /> Copy Handle
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 bg-white/5 border border-white/10 py-5 rounded-[32px] flex items-center justify-center gap-3 text-white font-bold active:scale-95 transition-transform"
              >
                <Share2 size={20} /> Share Code
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-6"
          >
            <div className="w-full aspect-square max-w-xs rounded-[48px] relative overflow-hidden bg-black">
              <div className="absolute inset-0">
                 <Scanner 
                   onScan={handleScan}
                   components={{
                     zoom: false,
                     finder: false
                   }}
                 />
                 <div className="absolute inset-0 pointer-events-none border-4 border-[#FF4D1C] rounded-[48px]" />
                 <div className="absolute inset-0 pointer-events-none">
                   <div className="w-full h-1 bg-[#FF4D1C] absolute top-0 animate-[scan_2s_infinite] shadow-[0_0_20px_#FF4D1C]" />
                 </div>
              </div>
              <style>{`
                @keyframes scan {
                  0% { top: 0; }
                  100% { top: 100%; }
                }
              `}</style>
            </div>
            
            {/* Fallback button for Webviews where camera permission is denied */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-full flex items-center gap-2 text-white font-semibold text-sm active:bg-white/20 transition-colors"
            >
              <ImageIcon size={18} />
              Upload QR from Gallery
            </button>
          </motion.div>
        )}

        <div className="bg-white/5 p-6 rounded-[40px] flex items-center gap-4 border border-white/10 w-full">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">TitanShield™ Active</p>
            <p className="text-white/40 text-[10px] leading-relaxed">
              QR payments are encrypted and require biometric confirmation for amounts over ₦50,000.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScreen;