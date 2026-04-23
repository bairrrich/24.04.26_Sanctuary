'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LAYOUT, ANIMATION } from '@/lib/constants';
import type { StatItem } from '@/types';

interface StatCardProps {
  stat: StatItem;
  accentColor?: string;
  index?: number;
}

export function StatCard({ stat, accentColor, index = 0 }: StatCardProps) {
  const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const TrendIcon = stat.trend ? trendIcon[stat.trend] : null;

  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }}
      className="flex items-center gap-3 rounded-xl border bg-card px-3"
      style={{ height: LAYOUT.STAT_CARD_HEIGHT }}
    >
      {accentColor && (
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight truncate">{stat.label}</p>
        <p className="text-sm font-semibold leading-tight truncate">{stat.value}</p>
      </div>
      {TrendIcon && stat.trendValue && (
        <div className={`flex items-center gap-0.5 text-[10px] shrink-0 ${
          stat.trend === 'up' ? 'text-emerald-500' :
          stat.trend === 'down' ? 'text-red-500' :
          'text-muted-foreground'
        }`}>
          <TrendIcon className="h-3 w-3" />
          <span>{stat.trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}

interface StatCardGridProps {
  stats: StatItem[];
  accentColor?: string;
}

export function StatCardGrid({ stats, accentColor }: StatCardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} accentColor={accentColor} index={i} />
      ))}
    </div>
  );
}
