"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PayTitanLogo from './PayTitanLogo';
import { Zap, ShieldCheck, Globe, Wifi } from 'lucide-react';
import { hapticFeedback } from '../../lib/utils';

const GREETINGS = [
  { text: "Hello", lang: "English" },
  { text: "Sannu", lang: "Hausa" },
  { text: "Bawo ni", lang: "Yoruba" },
  { text: "Kedu", lang: "Igbo" },
  { text: "Ndewo", lang: "Igbo" },
  { text: "Ekaabo", lang: "Yoruba" },
  { text: "Ahalan", lang: "Arabic" },
  { text: "Hola", lang: "Spanish" },
  { text: "Bonjour", lang: "French" },
  { text: "Ciao", lang: "Italian" },
  { text: "Namaste", lang: "Hindi" },
  { text: "Konnichiwa", lang: "Japanese" },
  { text: "Nǐ Hǎo", lang: "Chinese" },
  { text: "Welcome", lang: "English" }
];

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    hapticFeedback('heavy');

    const greetingInterval = setInterval(() => {
      setGreetingIndex((prev) => {
        if (prev < GREETINGS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(greetingInterval);
          setTimeout(() => {
            onComplete();
          }, 3000);
          return prev;
        }
      });
    }, 850);

    return () => clearInterval(greetingInterval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden text-white font-sans select-none">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.1, 1],
          opacity: 1,
          rotate: 360 * 4
        }}
        transition={{ 
          scale: { duration: 1.5, ease: "easeOut" },
          opacity: { duration: 1 },
          rotate: { duration: 12, ease: [0.16, 1, 0.3, 1], repeat: Infinity }
        }}
        className="mb-16"
      >
        <div className="w-24 h-24 rounded-[28%] bg-indigo-500 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)]">
          <Zap size={48} className="text-white fill-white" />
        </div>
      </motion.div>

      <div className="h-24 flex items-center justify-center text-center w-full px-6">
        <AnimatePresence mode="wait">
          <motion.h1
            key={greetingIndex}
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(12px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[48px] md:text-[64px] font-light tracking-[-0.03em] text-white"
          >
            {GREETINGS[greetingIndex].text}
          </motion.h1>
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-16"
      >
        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/50">Titan Core</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
