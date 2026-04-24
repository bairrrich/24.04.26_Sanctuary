'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Star, Check, Trash2, BookOpen } from 'lucide-react';
import { PageHeader, ModuleTabs, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useCollectionsStore, type CollectionData } from '@/store/collections-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ANIMATION, SPACING } from '@/lib/constants';
import type { TabItem } from '@/types';

const COLLECTION_TYPES = [
  { value: 'books', icon: '📚', labelEn: 'Books', labelRu: 'Книги', color: '#6366f1' },
  { value: 'movies', icon: '🎬', labelEn: 'Movies', labelRu: 'Фильмы', color: '#ef4444' },
  { value: 'games', icon: '🎮', labelEn: 'Games', labelRu: 'Игры', color: '#22c55e' },
  { value: 'music', icon: '🎵', labelEn: 'Music', labelRu: 'Музыка', color: '#a855f7' },
  { value: 'recipes', icon: '🍳', labelEn: 'Recipes', labelRu: 'Рецепты', color: '#f97316' },
  { value: 'general', icon: '📁', labelEn: 'General', labelRu: 'Общее', color: '#64748b' },
];

const STATUS_LABELS: Record<string, { en: string; ru: string }> = {
  planned: { en: 'Planned', ru: 'Запланировано' },
  in_progress: { en: 'In Progress', ru: 'В процессе' },
  completed: { en: 'Completed', ru: 'Завершено' },
};

export function CollectionsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.collections;
  const { collections, isLoading, loadCollections, addCollection, addItem, updateItem, deleteCollection, deleteItem } = useCollectionsStore();
  const [activeTab, setActiveTab] = useState('collections');
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | null>(null);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newColl, setNewColl] = useState({ name: '', description: '', type: 'general' });
  const [newItem, setNewItem] = useState({ name: '', description: '', status: 'planned', rating: 0, review: '' });

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const tabs: TabItem[] = [
    { id: 'collections', label: language === 'ru' ? 'Коллекции' : 'Collections' },
    { id: 'items', label: language === 'ru' ? 'Элементы' : 'Items' },
  ];

  const handleAddCollection = async () => {
    if (!newColl.name.trim()) return;
    const typeInfo = COLLECTION_TYPES.find((t) => t.value === newColl.type) ?? COLLECTION_TYPES[5];
    await addCollection({ name: newColl.name.trim(), description: newColl.description || undefined, type: newColl.type, icon: typeInfo.icon, color: typeInfo.color });
    setNewColl({ name: '', description: '', type: 'general' });
    setIsAddCollectionOpen(false);
  };

  const handleAddItem = async () => {
    if (!selectedCollection || !newItem.name.trim()) return;
    await addItem(selectedCollection.id, { name: newItem.name.trim(), description: newItem.description || undefined, status: newItem.status, rating: newItem.rating || undefined, review: newItem.review || undefined });
    setNewItem({ name: '', description: '', status: 'planned', rating: 0, review: '' });
    setIsAddItemOpen(false);
    await loadCollections();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={language === 'ru' ? 'Коллекции' : 'Collections'} icon={FolderOpen} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Книги, фильмы, игры...' : 'Books, movies, games...'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'collections' && (
          <div className="space-y-2">
            {collections.length === 0 ? (
              <EmptyState icon={FolderOpen} title={language === 'ru' ? 'Нет коллекций' : 'No collections'} description={language === 'ru' ? 'Создайте первую коллекцию' : 'Create your first collection'} accentColor={config.accentColor} />
            ) : collections.map((coll, i) => {
              const typeInfo = COLLECTION_TYPES.find((t) => t.value === coll.type) ?? COLLECTION_TYPES[5];
              const completedCount = coll.items.filter((it) => it.status === 'completed').length;
              return (
                <motion.div key={coll.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-4">
                  <button className="w-full text-left" onClick={() => { setSelectedCollection(coll); setActiveTab('items'); }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${typeInfo.color}15` }}>{coll.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{coll.name}</p>
                        <p className="text-[10px] text-muted-foreground">{coll.items.length} {language === 'ru' ? 'элементов' : 'items'} · {completedCount} ✅</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>{language === 'ru' ? typeInfo.labelRu : typeInfo.labelEn}</span>
                    </div>
                    {coll.items.length > 0 && (
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                        <div className="h-full rounded-full" style={{ width: `${(completedCount / coll.items.length) * 100}%`, backgroundColor: typeInfo.color }} />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-2">
            {!selectedCollection ? (
              <EmptyState icon={BookOpen} title={language === 'ru' ? 'Выберите коллекцию' : 'Select a collection'} description={language === 'ru' ? 'Нажмите на коллекцию для просмотра' : 'Tap a collection to view items'} accentColor={config.accentColor} />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedCollection.icon}</span>
                    <h3 className="text-sm font-semibold">{selectedCollection.name}</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsAddItemOpen(true)} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />{language === 'ru' ? 'Добавить' : 'Add'}</Button>
                </div>
                {selectedCollection.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">{language === 'ru' ? 'Пусто' : 'Empty'}</p>
                ) : selectedCollection.items.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-3.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateItem(item.id, { status: item.status === 'completed' ? 'planned' : 'completed' })} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${item.status === 'completed' ? 'border-green-500 bg-green-500/15' : 'border-muted-foreground/30'}`}>
                        {item.status === 'completed' && <Check className="h-3.5 w-3.5 text-green-600" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.status === 'completed' ? 'line-through opacity-60' : ''}`}>{item.name}</p>
                        {item.rating && <div className="flex items-center gap-0.5 mt-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= item.rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>}
                      </div>
                      <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted">{STATUS_LABELS[item.status]?.[language === 'ru' ? 'ru' : 'en'] ?? item.status}</span>
                      <button onClick={() => deleteItem(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
                    </div>
                    {item.review && <p className="text-xs text-muted-foreground mt-2 pl-9">{item.review}</p>}
                  </motion.div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Sheet open={isAddCollectionOpen} onOpenChange={setIsAddCollectionOpen}>
        <SheetTrigger asChild><FAB accentColor={config.accentColor} onClick={() => setIsAddCollectionOpen(true)} /></SheetTrigger>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Новая коллекция' : 'New Collection'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label><Input value={newColl.name} onChange={(e) => setNewColl({ ...newColl, name: e.target.value })} placeholder={language === 'ru' ? 'Мои книги...' : 'My books...'} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Input value={newColl.description} onChange={(e) => setNewColl({ ...newColl, description: e.target.value })} /></div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Тип' : 'Type'}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLLECTION_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setNewColl({ ...newColl, type: t.value })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newColl.type === t.value ? 'text-white' : 'bg-muted'}`} style={newColl.type === t.value ? { backgroundColor: t.color } : {}}>
                    <span>{t.icon}</span>{language === 'ru' ? t.labelRu : t.labelEn}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleAddCollection} disabled={!newColl.name.trim()} className="w-full">{language === 'ru' ? 'Создать' : 'Create'}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить элемент' : 'Add Item'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label><Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} /></div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Рейтинг' : 'Rating'}</label>
              <div className="flex gap-1 mt-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => setNewItem({ ...newItem, rating: newItem.rating === s ? 0 : s })} className="p-0.5"><Star className={`h-5 w-5 ${s <= newItem.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} /></button>)}</div>
            </div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Отзыв' : 'Review'}</label><Textarea value={newItem.review} onChange={(e) => setNewItem({ ...newItem, review: e.target.value })} rows={3} /></div>
            <Button onClick={handleAddItem} disabled={!newItem.name.trim()} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
