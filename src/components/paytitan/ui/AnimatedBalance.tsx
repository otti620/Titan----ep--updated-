"use client";

import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedBalanceProps {
  value: number;
  className?: string;
  currency?: string;
  fontSize?: string;
  showSymbol?: boolean;
}

export const AnimatedBalance: React.FC<AnimatedBalanceProps> = ({ 
  value, 
  className = "", 
  currency = "₦", 
  fontSize = "text-4xl",
  showSymbol = true
}) => {
  const springValue = useSpring(value, {
    stiffness: 80,
    damping: 18,
    mass: 1
  });

  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [springValue]);

  const formattedValue = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayValue);

  return (
    <div className={`flex items-baseline gap-1 tabular-nums ${className}`}>
      {showSymbol && (
        <span className={`${fontSize} font-medium opacity-50`}>{currency}</span>
      )}
      <span className={`${fontSize} font-bold tracking-tight text-foreground`}>
        {formattedValue}
      </span>
    </div>
  );
};
