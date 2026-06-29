"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Coins, Sparkles, RefreshCw, Zap, Flame, Trophy,
  ArrowRight, ShieldCheck, HelpCircle, AlertCircle, Play, Percent
} from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';
import { toast } from 'sonner';

// 8 segments on our custom low-yield rewards wheel
const WHEEL_SECTIONS = [
  { label: "₦0.02 Cashback", value: 0.02, color: "from-amber-500 to-yellow-500 text-black" },
  { label: "Spin Again", value: 0, color: "from-zinc-800 to-zinc-900 text-white" },
  { label: "₦0.05 Booster", value: 0.05, color: "from-rose-500 to-pink-500 text-white" },
  { label: "Better Luck", value: 0, color: "from-zinc-800 to-zinc-900 text-white" },
  { label: "₦0.01 Yield", value: 0.01, color: "from-emerald-500 to-teal-500 text-black" },
  { label: "Try Again", value: 0, color: "from-zinc-800 to-zinc-900 text-white" },
  { label: "₦0.03 Rebate", value: 0.03, color: "from-indigo-500 to-purple-500 text-white" },
  { label: "₦0.08 JACKPOT", value: 0.08, color: "from-violet-500 to-fuchsia-500 text-white" }
];

export default function RewardsScreen() {
  const { profile, fundUserWallet, showNotification, mysteryBoxes, claimMysteryBox } = usePayTitan();
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [result, setResult] = useState<typeof WHEEL_SECTIONS[0] | null>(null);
  const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: string; duration: number; delay: number }>>([]);

  // Generate bubbling liquid blobs in the background
  useEffect(() => {
    const list = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 80) + 40,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4
    }));
    setBubbles(list);
  }, []);

  const handleSpin = async () => {
    if (isSpinning) return;
    
    hapticFeedback('heavy');
    setIsSpinning(true);
    setResult(null);

    // Pick a random reward index, all prizes are below ₦1.00!
    const targetIdx = Math.floor(Math.random() * WHEEL_SECTIONS.length);
    const selectedReward = WHEEL_SECTIONS[targetIdx];

    // Calculate a rotation to land on targetIdx
    // 360 degrees / 8 segments = 45 degrees per segment
    // We rotate multiple full circles plus the sector offset
    const sectorAngle = 45;
    const offsetAngle = sectorAngle * targetIdx + (sectorAngle / 2);
    const extraSpins = 3600; // 10 full spins
    const totalRotation = extraSpins + (360 - offsetAngle);

    setSpinRotation(totalRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      setResult(selectedReward);
      
      if (selectedReward.value > 0) {
        hapticFeedback('success');
        // Actually add the tiny reward to the user's wallet!
        if (profile?.id) {
          try {
            await fundUserWallet(profile.id, selectedReward.value);
            toast.success(`🎉 Won ₦${selectedReward.value.toFixed(2)}!`, {
              description: "Directly settled to your transaction wallet.",
              duration: 5000
            });
            showNotification({
              type: 'success',
              title: 'Lava Spin Reward',
              description: `₦${selectedReward.value.toFixed(2)} credited to your personal ledger!`
            });
          } catch (e) {
            console.error("Funding error", e);
          }
        }
      } else {
        hapticFeedback('medium');
        toast.info(selectedReward.label === "Spin Again" ? "🔄 Spin Again!" : "😔 Close, try next time!");
      }
    }, 5100); // matches the css transition duration below
  };

  const handleClaimCashback = (title: string, amt: string) => {
    hapticFeedback('medium');
    toast.success(`Active Cashback Boost: ${title}`, {
      description: `Complete your next transfer/bill payment to instantly receive ${amt}.`,
      duration: 4000
    });
  };

  return (
    <div className="h-full w-full bg-black flex flex-col relative text-white overflow-hidden select-none">
      
      {/* 1. LIQUID BUBBLING BACKGROUND CANVAS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-indigo-950/20 via-black to-black">
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full bg-indigo-500/15 blur-[6px] dark:bg-indigo-600/10"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              bottom: '-120px',
            }}
            animate={{
              y: [0, -900],
              x: [0, Math.random() * 60 - 30, Math.random() * 40 - 20, 0],
              scale: [1, 1.4, 0.9, 0],
              borderRadius: ["40%", "60%", "50%", "40%"]
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Lava Lamp Glass overlay blur */}
        <div className="absolute inset-0 backdrop-blur-[1px] saturate-150" />
      </div>

      {/* 2. REWARDS HEADER */}
      <div className="relative z-10 px-6 pt-[env(safe-area-inset-top,14px)] pb-3 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase italic">LAVA POOL</span>
          <h2 className="title-2 font-bold tracking-tight text-white">Titan Rewards</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-500/15 px-3 py-1.5 rounded-full border border-indigo-500/20">
          <Coins size={15} className="text-yellow-400" />
          <span className="text-xs font-black tracking-wide text-indigo-200">SPIN MODE</span>
        </div>
      </div>

      {/* 3. SCROLLABLE REWARDS SYSTEM */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 relative z-10">
        <div className="px-5 pt-6 pb-6 space-y-8">
          
          {/* Header promo card */}
          <div className="bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-black p-5 rounded-[24px] border border-white/5 relative overflow-hidden text-center">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 blur-[50px] rounded-full -z-10" />
             <Flame className="text-orange-500 mx-auto w-8 h-8 animate-bounce" strokeWidth={1.5} />
             <h3 className="headline font-bold text-white mt-2">Interactive Liquidity Pool</h3>
             <p className="footnote text-zinc-400 mt-1 max-w-xs mx-auto">
               Spin the active Lava Wheel to win micro-yield dividends directly. Boost your transactions with instant nano-rebates!
             </p>
          </div>

          {/* 3.5 Mystery Rewards (Mystery Boxes) */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Mystery Nodes</h4>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Tap to Reveal</span>
             </div>
             
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {mysteryBoxes.length > 0 ? (
                  mysteryBoxes.map((box: any) => (
                    <motion.button
                      key={box.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={async () => {
                        hapticFeedback('heavy');
                        const reward = await claimMysteryBox(box.id);
                        toast.success(reward.title, { description: reward.message });
                      }}
                      className="w-32 h-32 shrink-0 glass-card rounded-[32px] border-2 border-dashed border-amber-500/30 flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                       <motion.div
                         animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                         transition={{ repeat: Infinity, duration: 2 }}
                       >
                         <Gift size={32} className="text-amber-500" />
                       </motion.div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{box.title}</span>
                    </motion.button>
                  ))
                ) : (
                  <div className="w-full p-8 text-center glass-card rounded-[32px] border-dashed border-white/10 opacity-40">
                     <p className="text-[11px] font-black uppercase tracking-widest">No Active Boxes</p>
                  </div>
                )}
             </div>
          </div>

          {/* 4. THE INTERACTIVE LIQUID SPIN WHEEL */}
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative w-72 h-72 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-black shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              
              {/* Center pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-red-500" />
              </div>

              {/* Glowing outer bezel */}
              <div className="absolute inset-1 rounded-full border-2 border-white/10 animate-pulse pointer-events-none" />

              {/* Rotating Wheel Canvas */}
              <div 
                className="w-full h-full rounded-full overflow-hidden relative"
                style={{
                  transform: `rotate(${spinRotation}deg)`,
                  transition: isSpinning ? 'transform 5000ms cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none',
                }}
              >
                {WHEEL_SECTIONS.map((sec, idx) => {
                  const angle = idx * 45;
                  return (
                    <div 
                      key={idx}
                      className="absolute top-0 left-0 w-full h-full origin-center flex justify-center pt-4"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      {/* Segment Border Dividers */}
                      <div className="absolute inset-0 h-1/2 w-0.5 bg-white/5 left-1/2 origin-bottom" />
                      
                      {/* Section label display rotated */}
                      <span className="text-[9px] font-black uppercase tracking-wider absolute pt-3 select-none text-center max-w-[50px] leading-tight text-white/90">
                        {sec.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center button trigger */}
              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 border-2 border-white/20 shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform z-20 disabled:opacity-80"
              >
                {isSpinning ? (
                  <RefreshCw size={24} className="animate-spin text-white" />
                ) : (
                  <>
                    <Play size={20} fill="currentColor" className="ml-1 text-white" />
                    <span className="text-[9px] font-black text-white/90 tracking-widest mt-0.5 uppercase">SPIN</span>
                  </>
                )}
              </button>
            </div>

            {/* Results display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mt-6 text-center z-20"
                >
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">SPIN RESULTS</p>
                  <div className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl mt-1.5 flex items-center gap-2">
                     <Trophy size={16} className="text-amber-500 animate-bounce" />
                     <span className="text-sm font-extrabold tracking-wide text-white">
                       {result.value > 0 ? `You won ₦${result.value.toFixed(2)}!` : result.label}
                     </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. NANO-CASHBACKS BOOSTERS AREA (VERY LOW YIELD REWARDS) */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Nano Cashback Boosters</h4>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Guaranteed Live</span>
             </div>

             <div className="grid grid-cols-1 gap-3">
                <BoostCard 
                  title="Airtime Nano Cashback"
                  desc="Fund your airtime lines and get instant fractional cashback settles."
                  rate="0.001%"
                  maxReward="₦0.02 max"
                  onClick={() => handleClaimCashback("Airtime Nano", "0.001% up to ₦0.02")}
                />
                <BoostCard 
                  title="Tribe Transfer Rebate"
                  desc="Send money to saving tribes and cash out mini rebates."
                  rate="₦0.01 fix"
                  maxReward="₦0.01 per day"
                  onClick={() => handleClaimCashback("Tribe Transfer", "₦0.01 fix reward")}
                />
                <BoostCard 
                  title="DSTV/Bills Smart Bonus"
                  desc="Pay cable or electric bills through our utility nodes."
                  rate="0.002%"
                  maxReward="₦0.05 max"
                  onClick={() => handleClaimCashback("Bills Smart", "0.002% up to ₦0.05")}
                />
             </div>
          </div>

          {/* Regulatory Disclaimer */}
          <div className="bg-[#1C1C1E]/40 border border-white/5 p-4 rounded-2xl flex items-start gap-3 mt-4">
             <ShieldCheck className="text-indigo-400 w-5 h-5 shrink-0 mt-0.5" />
             <p className="text-[10px] text-zinc-400 leading-normal font-medium">
               Titan Rewards are computed deterministically within our server ledger architecture. Fractional payouts undergo micro-settlement rounds instantly and are 100% real. Play responsibly.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}

const BoostCard = ({ 
  title, desc, rate, maxReward, onClick 
}: { 
  title: string, desc: string, rate: string, maxReward: string, onClick: () => void 
}) => (
  <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-500/20 transition-all active:scale-98 duration-150">
     <div className="space-y-1 pr-4">
        <h5 className="text-xs font-bold text-white">{title}</h5>
        <p className="text-[11px] text-zinc-400 leading-snug">{desc}</p>
        <div className="flex gap-2 pt-1">
           <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{rate}</span>
           <span className="text-[9px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{maxReward}</span>
        </div>
     </div>
     <button 
       onClick={onClick}
       className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white shrink-0 active:scale-90 transition-transform"
     >
        <Gift size={16} />
     </button>
  </div>
);
