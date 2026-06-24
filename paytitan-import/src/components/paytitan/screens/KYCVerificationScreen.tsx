"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, FileText, Camera, CheckCircle2, ArrowRight, Upload } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback } from '../../../lib/utils';
import { toast } from 'sonner';

const KYCVerificationScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, submitKYC } = usePayTitan();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        hapticFeedback('medium');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!previewImage) {
      toast.error("Please upload a document first.");
      return;
    }
    setIsUploading(true);
    try {
      await submitKYC(); 
      setStep(3);
    } catch (error) {
      toast.error("Failed to submit documents.");
    } finally {
      setIsUploading(false);
    }
  };

  const hasKYC = profile?.bvn || profile?.nin;

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <span className="text-xl font-bold text-[#1A2130] dark:text-white">Identity Verification</span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-8 space-y-8 overflow-y-auto pb-8">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#FF4D1C]' : 'w-4 bg-[#FF4D1C]/20'}`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {hasKYC ? (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Tier 1 Verified
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white mt-2">Instant Banking Active.</h2>
                    <p className="text-sm text-[#1A2130]/60">Your virtual accounts are fully set up through our banking partners.</p>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-indigo-500/10 p-5 rounded-[28px] space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">COMPLIANCE SIGNUP DATA</p>
                        <p className="text-sm font-bold text-[#1A2130] dark:text-white">
                          Verified via {profile?.bvn ? `BVN (Bank Verification)` : `NIN (National ID)`}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-black/[0.05] dark:bg-white/5" />

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-0.5">Assigned Bank Partner</span>
                        <span className="text-sm font-bold text-[#1A2130] dark:text-white">
                          {profile?.bvn ? 'Wema Bank (Monnify Partner)' : 'Nomba Microfinance Bank'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-0.5">Your Virtual Account Number</span>
                        <span className="text-lg font-mono font-bold tracking-widest text-[#FF4D1C]">
                          {profile?.bvn 
                            ? `824${profile.bvn.slice(-7)}` 
                            : profile?.nin 
                              ? `110${profile.nin.slice(-7)}` 
                              : '8237492104'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <KYCRequirement icon={<CheckCircle2 className="text-green-500" />} label="Daily Limit: ₦5,000,000" />
                    <KYCRequirement icon={<CheckCircle2 className="text-green-500" />} label="Virtual Dollar cards unlocked" />
                    <KYCRequirement icon={<CheckCircle2 className="text-green-500" />} label="Full TitanShield™ protection active" />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20"
                  >
                    Upgrade to Tier 2 (Government ID)
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Tier 1 Access.</h2>
                    <p className="text-sm text-[#1A2130]/60">Verify your identity to unlock higher transaction limits and premium features.</p>
                  </div>

                  <div className="space-y-4">
                    <KYCRequirement icon={<CheckCircle2 className="text-green-500" />} label="Daily Limit: ₦5,000,000" />
                    <KYCRequirement icon={<CheckCircle2 className="text-green-500" />} label="Virtual Dollar Cards" />
                    <KYCRequirement icon={<CheckCircle2 className="text-green-500" />} label="TitanShield™ Protection" />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20"
                  >
                    Start Verification
                  </button>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Upload ID.</h2>
                <p className="text-sm text-[#1A2130]/60">Take a clear photo of your government-issued ID.</p>
              </div>

              <div className="aspect-[3/2] w-full bg-white dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Document Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">Tap to Change</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={48} className="text-gray-300" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Front of Document</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full bg-[#FF4D1C] text-white py-5 rounded-[32px] font-bold text-lg shadow-lg shadow-[#FF4D1C]/20 flex items-center justify-center gap-2"
              >
                {isUploading ? "Uploading..." : "Submit Documents"} <Upload size={20} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-[#1A2130] dark:text-white">Under Review.</h2>
                <p className="text-sm text-gray-400 px-8">Our compliance team is reviewing your documents. This typically takes 2-4 hours.</p>
              </div>
              <button
                onClick={onBack}
                className="w-full bg-[#1A2130] text-white py-5 rounded-[32px] font-bold text-lg"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const KYCRequirement = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-50 dark:border-white/5">
    {icon}
    <span className="text-sm font-bold text-[#1A2130] dark:text-white">{label}</span>
  </div>
);

export default KYCVerificationScreen;