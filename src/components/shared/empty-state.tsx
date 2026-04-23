'use client';

import { motion } from 'framer-motion';
import { Inbox, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ANIMATION } from '@/lib/constants';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  accentColor,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      transition={ANIMATION.SPRING_GENTLE}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
        style={{ backgroundColor: accentColor ? `${accentColor}15` : undefined }}
      >
        <Icon
          className="h-8 w-8"
          style={{ color: accentColor }}
        />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          style={accentColor ? { backgroundColor: accentColor } : undefined}
          className="text-primary-foreground"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
