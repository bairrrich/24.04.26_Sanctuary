'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Trash2 } from 'lucide-react';
import type { ReminderItem } from '@/store/reminders-store';
import { CATEGORIES, PRIORITIES, type ReminderLanguage } from '../constants';

interface ReminderCardProps {
  reminder: ReminderItem;
  language: ReminderLanguage;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isOverdue?: boolean;
  onReschedule?: (reminder: ReminderItem) => Promise<void>;
}

export function ReminderCard({ reminder, language, onComplete, onDelete, isOverdue, onReschedule }: ReminderCardProps) {
  const prio = PRIORITIES.find((p) => p.value === reminder.priority) ?? PRIORITIES[1];
  const cat = CATEGORIES.find((c) => c.value === reminder.category) ?? CATEGORIES[0];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border bg-card p-3 ${reminder.isCompleted ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <button onClick={() => !reminder.isCompleted && onComplete(reminder.id)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${reminder.isCompleted ? 'border-green-500 bg-green-500/15' : 'border-muted-foreground/30 hover:border-primary/50'}`}>
          {reminder.isCompleted && <Check className="h-3.5 w-3.5 text-green-600" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${reminder.isCompleted ? 'line-through' : ''}`}>{reminder.title}</p>
          {reminder.description && <p className="line-clamp-1 text-[10px] text-muted-foreground">{reminder.description}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{reminder.date}{reminder.time ? ` ${reminder.time}` : ''}</span>
            <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${prio.color}15`, color: prio.color }}>{prio.icon}</span>
            <span className="text-[10px]">{cat.icon}</span>
            {isOverdue && onReschedule && (
              <button onClick={() => onReschedule(reminder)} className="rounded-md border border-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-50">
                {language === 'ru' ? '+1 день' : 'Reschedule +1 day'}
              </button>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(reminder.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
      </div>
    </motion.div>
  );
}
