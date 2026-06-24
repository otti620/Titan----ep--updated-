"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0F172A] flex flex-col items-center justify-center z-[100]">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-16 h-16 relative"
      >
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-white/40 text-xs font-bold uppercase tracking-[0.3em]"
      >
        Architecting...
      </motion.p>
    </div>
  );
}
