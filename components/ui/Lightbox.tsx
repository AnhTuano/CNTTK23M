import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../icons';
import { Memory, User } from '../../types';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  uploader: User | null;
  onNext: () => void;
  onPrev: () => void;
  onReact: (reaction: string) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const reactionEmojis = ['❤️', '😆', '😢'];

export const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, memory, uploader, onNext, onPrev, onReact, hasNext, hasPrev }) => {
  return (
    <AnimatePresence>
      {isOpen && memory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Main Image */}
          <motion.div
            layoutId={`memory-${memory.id}`}
            className="relative w-full h-full flex items-center justify-center p-4"
          >
            <img src={memory.url} alt="Memory" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </motion.div>

          {/* Close Button */}
          <Button variant="ghost" size="icon" onClick={onClose} className="!absolute top-4 right-4 text-white bg-black/30 hover:bg-black/50">
            <Icons.X className="w-6 h-6" />
          </Button>

          {/* Prev Button */}
           {hasPrev && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onPrev(); }} className="!absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50">
            <Icons.ChevronLeft className="w-8 h-8" />
          </Button>}

          {/* Next Button */}
          {hasNext && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onNext(); }} className="!absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50">
            <Icons.ChevronRight className="w-8 h-8" />
          </Button>}

          {/* Info & Reactions Panel */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto text-white flex justify-between items-end">
                <div>
                    <p className="font-bold">{memory.semester}</p>
                    {uploader && <p className="text-sm text-gray-300">Đăng bởi {uploader.name}</p>}
                </div>
                <div className="flex items-center gap-2 p-2 rounded-full bg-black/40 backdrop-blur-sm">
                    {reactionEmojis.map(emoji => (
                         <button key={emoji} onClick={() => onReact(emoji)} className="flex items-center gap-1 text-lg px-2 py-1 rounded-full hover:bg-white/20 transition-colors">
                            <span>{emoji}</span>
                            <span className="text-sm font-semibold">{memory.reactions[emoji] || 0}</span>
                        </button>
                    ))}
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};