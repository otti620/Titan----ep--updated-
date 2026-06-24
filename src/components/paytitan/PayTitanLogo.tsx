import React from 'react';
import { cn } from '../../lib/utils';

interface PayTitanLogoProps {
  className?: string;
  size?: number | string;
  showTm?: boolean;
}

const PayTitanLogo = ({ className, size = 40, showTm = false }: PayTitanLogoProps) => {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Top Bar - Widest */}
        <path 
          d="M15 25H85L78 43H8L15 25Z" 
          fill="currentColor" 
        />
        {/* Middle Bar */}
        <path 
          d="M28 48H75L68 66H21L28 48Z" 
          fill="currentColor" 
        />
        {/* Bottom Bar - Shortest */}
        <path 
          d="M42 71H65L58 89H35L42 71Z" 
          fill="currentColor" 
        />
        
        {showTm && (
          <text 
            x="62" 
            y="95" 
            fill="currentColor" 
            fontSize="10" 
            fontWeight="bold"
            className="opacity-60"
          >
            TM
          </text>
        )}
      </svg>
    </div>
  );
};

export default PayTitanLogo;
