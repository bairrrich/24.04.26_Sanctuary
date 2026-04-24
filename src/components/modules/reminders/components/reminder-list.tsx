import type { ReminderItem } from '@/store/reminders-store';
import { ReminderCard } from './reminder-card';

export function ReminderList({
  reminders,
  language,
  emptyMessage,
  onComplete,
  onDelete,
  onReschedule,
  isOverdue,
}: {
  reminders: ReminderItem[];
  language: 'en' | 'ru';
  emptyMessage: string;
  onComplete: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onReschedule?: (reminder: ReminderItem) => void | Promise<void>;
  isOverdue?: boolean;
}) {
  if (reminders.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          language={language}
          isOverdue={isOverdue}
          onComplete={onComplete}
          onDelete={onDelete}
          onReschedule={onReschedule}
        />
      ))}
    </div>
  );
}
