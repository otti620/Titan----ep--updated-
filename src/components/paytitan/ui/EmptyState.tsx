import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-10 text-center space-y-4"
    >
      <div className="w-20 h-20 bg-muted/10 dark:bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/50">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h3 className="headline text-foreground">{title}</h3>
        <p className="footnote text-muted-foreground max-w-[240px] mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="bg-indigo-500 text-white px-6 py-2.5 rounded-full headline active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};
