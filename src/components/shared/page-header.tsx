'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LAYOUT, ANIMATION } from '@/lib/constants';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accentColor,
  onBack,
  rightAction,
}: PageHeaderProps) {
  return (
    <motion.header
      initial={ANIMATION.FADE_TRANSITION.initial}
      animate={ANIMATION.FADE_TRANSITION.animate}
      className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6"
      style={{ height: LAYOUT.HEADER_HEIGHT }}
    >
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 -ml-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {Icon && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: accentColor ? `${accentColor}20` : undefined }}
        >
          <Icon
            className="h-4.5 w-4.5"
            style={{ color: accentColor }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight truncate">{subtitle}</p>
        )}
      </div>
      {rightAction && (
        <div className="shrink-0">{rightAction}</div>
      )}
    </motion.header>
  );
}
