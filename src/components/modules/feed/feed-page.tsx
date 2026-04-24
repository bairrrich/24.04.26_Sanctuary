'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useAppStore } from '@/store/app-store';
import { useFeedStore } from '@/store/feed-store';
import { SPACING } from '@/lib/constants';
import { FeedPostCard, NewPostSheet, TodayFocusCard } from './components/feed-sections';

export function FeedPage() {
  const language = useSettingsStore((s) => s.language);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const checklist = useAppStore((s) => s.activationChecklist);
  const checklistDismissed = useAppStore((s) => s.activationChecklistDismissed);
  const markChecklistDone = useAppStore((s) => s.markChecklistDone);
  const dismissChecklist = useAppStore((s) => s.dismissChecklist);
  const resetChecklist = useAppStore((s) => s.resetChecklist);

  const config = MODULE_REGISTRY.feed;
  const { posts, loadPosts, addPost, togglePin, deletePost } = useFeedStore();

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const activationDoneCount = [checklist.feedNote, checklist.firstWorkout, checklist.firstExpense].filter(Boolean).length;
  const isActivationChecklistComplete = activationDoneCount === 3;

  const triggerFab = () => {
    requestAnimationFrame(() => {
      const fab = document.querySelector<HTMLButtonElement>('[data-fab="true"]');
      fab?.click();
    });
  };

  const handleAdd = async () => {
    if (!content.trim()) return;
    await addPost({ content: content.trim(), mood: mood ?? undefined });
    markChecklistDone('feedNote');
    setContent('');
    setMood(null);
    setIsOpen(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return language === 'ru' ? 'сейчас' : 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return d.toLocaleDateString();
  };

  const doneCount = [checklist.feedNote, checklist.firstWorkout, checklist.firstExpense].filter(Boolean).length;
  const checklistCompleted = doneCount === 3;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={language === 'ru' ? 'Лента' : 'Feed'} icon={MessageSquare} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Мысли и моменты' : 'Thoughts and moments'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-3`}>
        <TodayFocusCard
          language={language}
          doneCount={activationDoneCount}
          checklistCompleted={isActivationChecklistComplete}
          checklistDismissed={checklistDismissed}
          onQuickNote={triggerFab}
          onWorkout={() => {
            markChecklistDone('firstWorkout');
            setActiveModule('training');
            triggerFab();
          }}
          onExpense={() => {
            markChecklistDone('firstExpense');
            setActiveModule('finance');
            triggerFab();
          }}
          onDismissChecklist={dismissChecklist}
          onResetChecklist={resetChecklist}
        />

        {posts.length === 0
          ? <EmptyState icon={MessageSquare} title={language === 'ru' ? 'Лента пуста' : 'Feed is empty'} description={language === 'ru' ? 'Поделитесь первой мыслью' : 'Share your first thought'} accentColor={config.accentColor} />
          : posts.map((post, i) => (
            <FeedPostCard
              key={post.id}
              post={post}
              index={i}
              language={language}
              formatTime={formatTime}
              onTogglePin={togglePin}
              onDelete={deletePost}
            />
          ))}
      </div>

      <NewPostSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        accentColor={config.accentColor}
        language={language}
        content={content}
        mood={mood}
        onContentChange={setContent}
        onMoodChange={setMood}
        onSubmit={handleAdd}
      />
    </div>
  );
}
