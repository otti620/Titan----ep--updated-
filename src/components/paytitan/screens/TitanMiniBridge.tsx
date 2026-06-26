
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, X, Sparkles } from 'lucide-react';
import { usePayTitan } from '../../../context/PayTitanContext';
import { hapticFeedback, cn } from '../../../lib/utils';

export default function TitanMiniBridge({ onOpenFull }: { onOpenFull: () => void }) {
  const { executeAiAction } = usePayTitan();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const prompt = input;
    setInput('');
    setIsProcessing(true);
    hapticFeedback('medium');

    const result = await executeAiAction(prompt);
    
    setLastResponse(result.message);
    setIsProcessing(false);
    hapticFeedback(result.success ? 'success' : 'error');

    // Auto-clear response after 5 seconds
    setTimeout(() => setLastResponse(null), 5000);
  };

  return (
    <div className="fixed bottom-32 inset-x-6 z-[60] pointer-events-none">
      <div className="max-w-md mx-auto w-full pointer-events-auto">
        <AnimatePresence>
          {lastResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 bg-white/30 dark:bg-black/40 backdrop-blur-3xl text-foreground p-4 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 relative"
            >
              <button 
                onClick={() => setLastResponse(null)}
                className="absolute top-2 right-2 text-foreground/40 hover:text-foreground"
              >
                <X size={14} />
              </button>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <Sparkles size={16} />
                </div>
                <p className="text-xs font-bold leading-relaxed pr-4 text-foreground">{lastResponse}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[32px] blur opacity-25 group-focus-within:opacity-40 transition duration-500"></div>
          <form 
            onSubmit={handleSubmit}
            className="relative bg-white/40 dark:bg-black/30 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/50 dark:border-white/10 p-2 flex items-center gap-2"
          >
            <button 
              type="button"
              onClick={onOpenFull}
              className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 duration-150"
            >
              <Brain size={20} />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak to Titan..."
              className="flex-1 bg-transparent border-none text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-gray-500 text-foreground focus:ring-0 outline-none px-2"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
