
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, onClick, ...props }) => {
  const isClickable = !!onClick;
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-300/30 dark:border-slate-700/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg p-6 transition-all duration-300',
        isClickable && 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};