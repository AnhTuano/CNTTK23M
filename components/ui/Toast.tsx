
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../icons';
import { cn } from '../../lib/utils';
import { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: number) => void;
}

const toastIcons = {
  success: <Icons.Sparkles className="w-5 h-5 text-green-500" />,
  error: <Icons.X className="w-5 h-5 text-red-500" />,
  info: <Icons.Bell className="w-5 h-5 text-blue-500" />,
};

const toastColors = {
  success: 'border-green-500/50',
  error: 'border-red-500/50',
  info: 'border-blue-500/50',
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'relative flex items-start w-full max-w-sm p-4 space-x-4 overflow-hidden rounded-2xl shadow-lg border bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg',
        toastColors[toast.type || 'info']
      )}
    >
        <div className="flex-shrink-0">
            {toastIcons[toast.type || 'info']}
        </div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-gray-100">{toast.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{toast.message}</p>
        </div>
         <button onClick={() => onRemove(toast.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Icons.X className="w-4 h-4 text-gray-500" />
        </button>
    </motion.div>
  );
};
