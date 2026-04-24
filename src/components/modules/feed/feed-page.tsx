'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Pin, Trash2, Heart } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useFeedStore } from '@/store/feed-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ANIMATION } from '@/lib/constants';

const MOODS = [
  { value: 'great', icon: '😄', labelEn: 'Great', labelRu: 'Отлично', color: '#22c55e' },
  { value: 'good', icon: '🙂', labelEn: 'Good', labelRu: 'Хорошо', color: '#84cc16' },
  { value: 'neutral', icon: '😐', labelEn: 'Neutral', labelRu: 'Нормально', color: '#f59e0b' },
  { value: 'bad', icon: '😟', labelEn: 'Bad', labelRu: 'Плохо', color: '#ef4444' },
];

export function FeedPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.feed;
  const { posts, isLoading, loadPosts, addPost, togglePin, deletePost } = useFeedStore();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleAdd = async () => {
    if (!content.trim()) return;
    await addPost({ content: content.trim(), mood: mood ?? undefined });
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={language === 'ru' ? 'Лента' : 'Feed'} icon={MessageSquare} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Мысли и моменты' : 'Thoughts and moments'} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {posts.length === 0 ? (
          <EmptyState icon={MessageSquare} title={language === 'ru' ? 'Лента пуста' : 'Feed is empty'} description={language === 'ru' ? 'Поделитесь первой мыслью' : 'Share your first thought'} accentColor={config.accentColor} />
        ) : posts.map((post, i) => {
          const moodInfo = MOODS.find((m) => m.value === post.mood);
          return (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`rounded-xl border bg-card p-4 ${post.isPinned ? 'ring-1 ring-primary/20' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {moodInfo && <span className="text-lg mr-1">{moodInfo.icon}</span>}
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.isPinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                  <button onClick={() => togglePin(post.id, !post.isPinned)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"><Pin className={`h-3.5 w-3.5 ${post.isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} /></button>
                  <button onClick={() => deletePost(post.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">{formatTime(post.createdAt)}</span>
                {post.tags && <span className="text-[10px] text-primary">#{post.tags}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <FAB accentColor={config.accentColor} onClick={() => setIsOpen(true)} />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Новая запись' : 'New Post'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button key={m.value} onClick={() => setMood(mood === m.value ? null : m.value)} className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${mood === m.value ? 'ring-2 scale-110' : 'opacity-50 hover:opacity-80'}`} style={mood === m.value ? { ringColor: m.color } : {}}>
                  {m.icon}
                </button>
              ))}
            </div>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={language === 'ru' ? 'Что на уме?' : "What's on your mind?"} rows={4} autoFocus />
            <Button onClick={handleAdd} disabled={!content.trim()} className="w-full">{language === 'ru' ? 'Опубликовать' : 'Post'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
