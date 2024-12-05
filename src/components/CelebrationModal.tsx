'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

type CelebrationModalProps = {
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CelebrationModal({ playerName, isOpen, onClose }: CelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Dispara confetes
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E84C5C', '#ff718d', '#ffa1b3']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E84C5C', '#ff718d', '#ffa1b3']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="bg-[#251F2A] p-8 rounded-lg border-2 border-[#E84C5C] shadow-[0_0_30px_rgba(232,76,92,0.3)] max-w-2xl w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="pixel-text text-[#E84C5C] text-xl mb-4">🏆 PARABÉNS! 🏆</h2>
            <div className="pixel-text text-4xl md:text-6xl text-white mb-6 break-words">
              {playerName}
            </div>
            <p className="pixel-text text-gray-400 text-sm mb-6">
              PRIMEIRO LUGAR NO RANKING!
            </p>
            <button
              onClick={onClose}
              className="pixel-text bg-[#E84C5C] text-white px-6 py-3 rounded hover:bg-[#ff718d] transition-colors"
            >
              FECHAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 