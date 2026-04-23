'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { LAYOUT, ANIMATION, Z_INDEX } from '@/lib/constants';

interface FABProps {
  onClick: () => void;
  accentColor?: string;
  icon?: React.ReactNode;
}

export function FAB({
  onClick,
  accentColor,
  icon = <Plus className="h-6 w-6 text-white" />,
}: FABProps) {
  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={ANIMATION.SPRING_BOUNCY}
        onClick={onClick}
        className="fixed rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center md:rounded-xl"
        style={{
          bottom: LAYOUT.FAB_BOTTOM_OFFSET,
          right: LAYOUT.FAB_RIGHT_OFFSET,
          width: LAYOUT.FAB_SIZE,
          height: LAYOUT.FAB_SIZE,
          backgroundColor: accentColor || 'hsl(var(--primary))',
          zIndex: Z_INDEX.FAB,
        }}
      >
        {icon}
      </motion.button>
    </AnimatePresence>
  );
}
