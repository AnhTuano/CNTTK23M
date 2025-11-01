import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../icons';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
            size === 'default' && 'p-4'
          )}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              "relative",
              size === 'default' ? 'w-full max-w-3xl' : 'w-full h-full'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn(
              "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg w-full h-full flex flex-col",
              size === 'default' ? 'rounded-2xl' : 'rounded-none'
            )}>
                <div className="flex-shrink-0 flex items-center justify-between mb-4 p-6 pb-0">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 pt-4">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
