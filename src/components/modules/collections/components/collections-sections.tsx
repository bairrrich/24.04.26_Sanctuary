'use client';

import { motion } from 'framer-motion';
import { BookOpen, Check, Plus, Star, Trash2, FolderOpen } from 'lucide-react';
import { EmptyState, FAB } from '@/components/shared';
import type { CollectionData } from '@/store/collections-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { COLLECTION_TYPES, STATUS_LABELS, type CollectionsLanguage, type NewCollectionForm, type NewItemForm } from '../constants';

export function CollectionsListSection({
  collections,
  language,
  accentColor,
  onSelect,
}: {
  collections: CollectionData[];
  language: CollectionsLanguage;
  accentColor: string;
  onSelect: (collection: CollectionData) => void;
}) {
  if (collections.length === 0) {
    return <EmptyState icon={FolderOpen} title={language === 'ru' ? 'Нет коллекций' : 'No collections'} description={language === 'ru' ? 'Создайте первую коллекцию' : 'Create your first collection'} accentColor={accentColor} />;
  }

  return (
    <div className="space-y-2">
      {collections.map((collection, i) => {
        const typeInfo = COLLECTION_TYPES.find((t) => t.value === collection.type) ?? COLLECTION_TYPES[5];
        const completedCount = collection.items.filter((item) => item.status === 'completed').length;

        return (
          <motion.div key={collection.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-4">
            <button className="w-full text-left" onClick={() => onSelect(collection)}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${typeInfo.color}15` }}>{collection.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{collection.name}</p>
                  <p className="text-[10px] text-muted-foreground">{collection.items.length} {language === 'ru' ? 'элементов' : 'items'} · {completedCount} ✅</p>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>{language === 'ru' ? typeInfo.labelRu : typeInfo.labelEn}</span>
              </div>
              {collection.items.length > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(completedCount / collection.items.length) * 100}%`, backgroundColor: typeInfo.color }} />
                </div>
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

export function CollectionItemsSection({
  selectedCollection,
  language,
  accentColor,
  onAdd,
  onToggleStatus,
  onDeleteItem,
}: {
  selectedCollection: CollectionData | null;
  language: CollectionsLanguage;
  accentColor: string;
  onAdd: () => void;
  onToggleStatus: (itemId: string, nextStatus: 'planned' | 'completed') => void;
  onDeleteItem: (itemId: string) => void;
}) {
  if (!selectedCollection) {
    return <EmptyState icon={BookOpen} title={language === 'ru' ? 'Выберите коллекцию' : 'Select a collection'} description={language === 'ru' ? 'Нажмите на коллекцию для просмотра' : 'Tap a collection to view items'} accentColor={accentColor} />;
  }

  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-lg">{selectedCollection.icon}</span><h3 className="text-sm font-semibold">{selectedCollection.name}</h3></div>
        <Button variant="outline" size="sm" onClick={onAdd} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" />{language === 'ru' ? 'Добавить' : 'Add'}</Button>
      </div>

      {selectedCollection.items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{language === 'ru' ? 'Пусто' : 'Empty'}</p>
      ) : selectedCollection.items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-3.5">
          <div className="flex items-center gap-3">
            <button onClick={() => onToggleStatus(item.id, item.status === 'completed' ? 'planned' : 'completed')} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${item.status === 'completed' ? 'border-green-500 bg-green-500/15' : 'border-muted-foreground/30'}`}>
              {item.status === 'completed' && <Check className="h-3.5 w-3.5 text-green-600" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${item.status === 'completed' ? 'line-through opacity-60' : ''}`}>{item.name}</p>
              {item.rating && <div className="mt-0.5 flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= item.rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>}
            </div>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider">{STATUS_LABELS[item.status]?.[language === 'ru' ? 'ru' : 'en'] ?? item.status}</span>
            <button onClick={() => onDeleteItem(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
          </div>
          {item.review && <p className="mt-2 pl-9 text-xs text-muted-foreground">{item.review}</p>}
        </motion.div>
      ))}
    </div>
  );
}

export function AddCollectionSheet({
  open,
  onOpenChange,
  language,
  accentColor,
  form,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: CollectionsLanguage;
  accentColor: string;
  form: NewCollectionForm;
  onChange: (patch: Partial<NewCollectionForm>) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild><FAB accentColor={accentColor} onClick={() => onOpenChange(true)} /></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Новая коллекция' : 'New Collection'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label><Input value={form.name} onChange={(e) => onChange({ name: e.target.value })} placeholder={language === 'ru' ? 'Мои книги...' : 'My books...'} /></div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Input value={form.description} onChange={(e) => onChange({ description: e.target.value })} /></div>
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Тип' : 'Type'}</label>
            <div className="mt-1 flex flex-wrap gap-2">{COLLECTION_TYPES.map((t) => <button key={t.value} onClick={() => onChange({ type: t.value })} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.type === t.value ? 'text-white' : 'bg-muted'}`} style={form.type === t.value ? { backgroundColor: t.color } : {}}><span>{t.icon}</span>{language === 'ru' ? t.labelRu : t.labelEn}</button>)}</div>
          </div>
          <Button onClick={onSubmit} disabled={!form.name.trim()} className="w-full">{language === 'ru' ? 'Создать' : 'Create'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AddItemSheet({
  open,
  onOpenChange,
  language,
  form,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: CollectionsLanguage;
  form: NewItemForm;
  onChange: (patch: Partial<NewItemForm>) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить элемент' : 'Add Item'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label><Input value={form.name} onChange={(e) => onChange({ name: e.target.value })} /></div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Input value={form.description} onChange={(e) => onChange({ description: e.target.value })} /></div>
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Рейтинг' : 'Rating'}</label>
            <div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => onChange({ rating: form.rating === s ? 0 : s })} className="p-0.5"><Star className={`h-5 w-5 ${s <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} /></button>)}</div>
          </div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Отзыв' : 'Review'}</label><Textarea value={form.review} onChange={(e) => onChange({ review: e.target.value })} rows={3} /></div>
          <Button onClick={onSubmit} disabled={!form.name.trim()} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
