"use client";

import React from 'react';

export default function NativeAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] w-full bg-black overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
}
