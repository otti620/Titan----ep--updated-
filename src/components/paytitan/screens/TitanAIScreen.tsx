"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, TrendingUp, ShieldCheck, Brain, Target, ChevronRight, MessageSquare, Send, CheckCircle2, History } from 'lucide-react';
import PayTitanLogo from '../PayTitanLogo';
import { usePayTitan } from '../../../context/PayTitanContext';
import { cn, hapticFeedback } from '../../../lib/utils';

const TitanAIScreen = ({ onBack }: { onBack: () => void }) => {
  const { profile, executeAiAction } = usePayTitan();
  const [userInput, setUserInput] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState<{role: 'user' | 'titan', text: string}[]>([
    { role: 'titan', text: `PayTitan Assistant initialized. I am here to help you manage your money, ${profile?.first_name}. Use commands like:\n\n• "Analyze my food spending then move 5k to Rent"\n• "Is my merchant mode active?"\n• "What was my last transaction?"` }
  ]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    const prompt = userInput;
    setUserInput('');
    const newMsg = { role: 'user' as const, text: prompt };
    setChatMessages(prev => [...prev, newMsg]);
    setIsProcessing(true);
    hapticFeedback('medium');

    const result = await executeAiAction(prompt, [...chatMessages, newMsg]);
    
    setChatMessages(prev => [...prev, { role: 'titan', text: result.message }]);
    setIsProcessing(false);
    hapticFeedback(result.success ? 'success' : 'error');
  };

  return (
    <div className="h-full w-full bg-[#F8F9FC] dark:bg-[#0F172A] flex flex-col overflow-hidden">
      {/* AI Assistant Header */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0F172A] z-20">
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-gray-50 dark:border-white/5">
          <ArrowLeft className="w-5 h-5 text-[#1A2130] dark:text-white" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.4em] text-indigo-500 uppercase italic">TITAN SMART MODE</span>
          </div>
          <h2 className="text-sm font-bold text-[#1A2130] dark:text-white mt-0.5">PayTitan Assistant</h2>
        </div>
        <div className="w-10 h-10 flex items-center justify-center opacity-20">
           <MessageSquare size={20} className="text-indigo-500" />
        </div>
      </div>

      {/* Chat Space */}
      <div className="flex-1 flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar scroll-smooth"
        >
          {chatMessages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              key={i} 
              className={cn(
                "flex flex-col max-w-[90%] space-y-2",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "px-6 py-5 rounded-[32px] shadow-2xl relative overflow-hidden",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-[#1A2130] text-[#1A2130] dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-white/5"
              )}>
                {msg.role === 'titan' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                )}
                <p className="text-[13px] font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
              <div className="flex items-center gap-2 px-3">
                 {msg.role === 'titan' && <Brain size={10} className="text-indigo-500" />}
                 <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                  {msg.role === 'user' ? (profile?.first_name || 'MEMBER') : 'TITAN CONCIERGE'}
                 </span>
              </div>
            </motion.div>
          ))}
          {isProcessing && (
            <div className="flex flex-col items-start space-y-2 max-w-[85%]">
              <div className="px-5 py-4 rounded-[28px] rounded-tl-none bg-white dark:bg-[#1A2130] border border-gray-100 dark:border-white/5">
                <div className="flex gap-1.5 py-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 italic">Thinking...</span>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="px-6 py-8 pb-12 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC] to-transparent dark:from-[#0F172A] dark:via-[#0F172A]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[32px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
            <div className="relative flex items-center gap-2 bg-white dark:bg-[#1A2130] p-2 rounded-[32px] shadow-xl border border-gray-100 dark:border-white/10">
              <div className="w-10 h-10 hidden sm:flex items-center justify-center text-indigo-500">
                <PayTitanLogo size={20} />
              </div>
              <input 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Ask PayTitan...'
                className="flex-1 bg-transparent border-none px-4 py-3 text-sm font-bold text-[#1A2130] dark:text-white placeholder:text-gray-400 outline-none"
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!userInput.trim() || isProcessing}
                className="w-12 h-12 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-lg disabled:opacity-50 transition-all"
              >
                <Send size={20} />
              </motion.button>
            </div>
            <div className="flex justify-center gap-6 mt-4">
               {['Recent', 'Balance', 'Analyze'].map((tag) => (
                 <button 
                  key={tag}
                  onClick={() => setUserInput(tag)}
                  className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
                 >
                   {tag}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitanAIScreen;