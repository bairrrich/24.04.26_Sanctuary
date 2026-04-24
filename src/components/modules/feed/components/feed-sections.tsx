'use client';

import { motion } from 'framer-motion';
import { Pin, RotateCcw, Trash2, X } from 'lucide-react';
import { FAB } from '@/components/shared';
import type { FeedPostItem } from '@/store/feed-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { MOODS, type FeedLanguage } from '../constants';

export function TodayFocusCard({
  language,
  doneCount,
  checklistCompleted,
  checklistDismissed,
  onQuickNote,
  onWorkout,
  onExpense,
  onDismissChecklist,
  onResetChecklist,
}: {
  language: FeedLanguage;
  doneCount: number;
  checklistCompleted: boolean;
  checklistDismissed: boolean;
  onQuickNote: () => void;
  onWorkout: () => void;
  onExpense: () => void;
  onDismissChecklist: () => void;
  onResetChecklist: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Фокус на сегодня' : 'Today Focus'}</p>
      <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Быстрые действия для ежедневного прогресса' : 'Quick actions for daily progress'}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onQuickNote}>{language === 'ru' ? 'Запись' : 'Note'}</Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onWorkout}>{language === 'ru' ? 'Тренировка' : 'Workout'}</Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onExpense}>{language === 'ru' ? 'Расход' : 'Expense'}</Button>
      </div>

      {!checklistDismissed && (
        <div className="mt-3 rounded-lg bg-muted/50 p-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Чеклист запуска' : 'Activation checklist'}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">{doneCount}/3</span>
              <button onClick={onDismissChecklist} className="rounded p-0.5 text-muted-foreground hover:bg-muted" aria-label={language === 'ru' ? 'Скрыть чеклист' : 'Hide checklist'}><X className="h-3 w-3" /></button>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(doneCount / 3) * 100}%` }} /></div>

          {checklistCompleted && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{language === 'ru' ? 'Отличный старт! Чеклист можно пройти заново.' : 'Great start! You can run the checklist again.'}</span>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={onResetChecklist}><RotateCcw className="mr-1 h-3 w-3" />{language === 'ru' ? 'Сброс' : 'Reset'}</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FeedPostCard({
  post,
  index,
  language,
  formatTime,
  onTogglePin,
  onDelete,
}: {
  post: FeedPostItem;
  index: number;
  language: FeedLanguage;
  formatTime: (iso: string) => string;
  onTogglePin: (postId: string, nextPinned: boolean) => void;
  onDelete: (postId: string) => void;
}) {
  const moodInfo = MOODS.find((m) => m.value === post.mood);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`rounded-xl border bg-card p-4 ${post.isPinned ? 'ring-1 ring-primary/20' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {moodInfo && <span className="mr-1 text-lg">{moodInfo.icon}</span>}
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {post.isPinned && <Pin className="h-3 w-3 fill-primary text-primary" />}
          <button onClick={() => onTogglePin(post.id, !post.isPinned)} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-muted"><Pin className={`h-3.5 w-3.5 ${post.isPinned ? 'fill-primary text-primary' : 'text-muted-foreground'}`} /></button>
          <button onClick={() => onDelete(post.id)} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">{formatTime(post.createdAt)}</span>
        {post.tags && <span className="text-[10px] text-primary">#{post.tags}</span>}
      </div>
    </motion.div>
  );
}

export function NewPostSheet({
  open,
  onOpenChange,
  accentColor,
  language,
  content,
  mood,
  onContentChange,
  onMoodChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accentColor: string;
  language: FeedLanguage;
  content: string;
  mood: string | null;
  onContentChange: (content: string) => void;
  onMoodChange: (mood: string | null) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild><FAB accentColor={accentColor} onClick={() => onOpenChange(true)} /></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Новая запись' : 'New Post'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button key={m.value} onClick={() => onMoodChange(mood === m.value ? null : m.value)} className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${mood === m.value ? 'scale-110' : 'opacity-50 hover:opacity-80'}`} style={mood === m.value ? { boxShadow: `0 0 0 2px ${m.color}` } : undefined}>{m.icon}</button>
            ))}
          </div>
          <Textarea value={content} onChange={(e) => onContentChange(e.target.value)} placeholder={language === 'ru' ? 'Что на уме?' : "What's on your mind?"} rows={4} autoFocus />
          <Button onClick={onSubmit} disabled={!content.trim()} className="w-full">{language === 'ru' ? 'Опубликовать' : 'Post'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
