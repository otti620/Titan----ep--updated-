import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton = ({ className, variant = 'rectangular' }: SkeletonProps) => {
  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    rounded: 'rounded-[16px]'
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-muted/10 dark:bg-white/5 ${variantClasses[variant]} ${className}`}
    />
  );
};

export const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-muted/5 dark:bg-white/5 rounded-[20px] mb-3">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="space-y-2">
        <Skeleton className="w-32 h-4 rounded-full" />
        <Skeleton className="w-20 h-3 rounded-full" />
      </div>
    </div>
    <Skeleton className="w-24 h-5 rounded-full" />
  </div>
);

export const BalanceSkeleton = () => (
   <div className="space-y-4 px-6 pt-10">
      <Skeleton className="w-24 h-4 rounded-full" />
      <Skeleton className="w-48 h-10 rounded-full" />
      <div className="flex gap-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <Skeleton variant="circular" className="w-12 h-12" />
        <Skeleton variant="circular" className="w-12 h-12" />
      </div>
   </div>
);
