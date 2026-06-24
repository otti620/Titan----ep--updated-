import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-[#0F172A] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-8 animate-pulse">
        <Construction size={48} strokeWidth={1.5} />
      </div>
      
      <div className="space-y-4 max-w-xs">
        <h2 className="text-3xl font-bold text-white tracking-tight">404 Lost in the Architect</h2>
        <p className="text-white/60 text-sm font-medium leading-relaxed">
          The page you are looking for has been moved or doesn't exist in our financial landscape.
        </p>
      </div>

      <Link href="/" className="mt-12 group">
        <div className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-xl">
          <ArrowLeft size={18} /> Return to Hub
        </div>
      </Link>
    </div>
  );
}

