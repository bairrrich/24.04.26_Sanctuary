'use client';

import { useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { ModuleTabs, PageHeader } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useCollectionsStore, type CollectionData } from '@/store/collections-store';
import { SPACING } from '@/lib/constants';
import type { TabItem } from '@/types';
import { AddCollectionSheet, AddItemSheet, CollectionItemsSection, CollectionsListSection } from './components/collections-sections';
import { COLLECTION_TYPES, type NewCollectionForm, type NewItemForm } from './constants';

function defaultCollectionForm(): NewCollectionForm {
  return { name: '', description: '', type: 'general' };
}

function defaultItemForm(): NewItemForm {
  return { name: '', description: '', status: 'planned', rating: 0, review: '' };
}

export function CollectionsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.collections;
  const { collections, loadCollections, addCollection, addItem, updateItem, deleteItem } = useCollectionsStore();

  const [activeTab, setActiveTab] = useState('collections');
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | null>(null);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newCollection, setNewCollection] = useState<NewCollectionForm>(defaultCollectionForm());
  const [newItem, setNewItem] = useState<NewItemForm>(defaultItemForm());

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const tabs: TabItem[] = [
    { id: 'collections', label: language === 'ru' ? 'Коллекции' : 'Collections' },
    { id: 'items', label: language === 'ru' ? 'Элементы' : 'Items' },
  ];

  const handleAddCollection = async () => {
    if (!newCollection.name.trim()) return;
    const typeInfo = COLLECTION_TYPES.find((t) => t.value === newCollection.type) ?? COLLECTION_TYPES[5];

    await addCollection({ name: newCollection.name.trim(), description: newCollection.description || undefined, type: newCollection.type, icon: typeInfo.icon, color: typeInfo.color });
    setNewCollection(defaultCollectionForm());
    setIsAddCollectionOpen(false);
  };

  const handleAddItem = async () => {
    if (!selectedCollection || !newItem.name.trim()) return;

    await addItem(selectedCollection.id, { name: newItem.name.trim(), description: newItem.description || undefined, status: newItem.status, rating: newItem.rating || undefined, review: newItem.review || undefined });
    setNewItem(defaultItemForm());
    setIsAddItemOpen(false);
    await loadCollections();
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={language === 'ru' ? 'Коллекции' : 'Collections'} icon={FolderOpen} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Книги, фильмы, игры...' : 'Books, movies, games...'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'collections' && (
          <CollectionsListSection
            collections={collections}
            language={language}
            accentColor={config.accentColor}
            onSelect={(collection) => {
              setSelectedCollection(collection);
              setActiveTab('items');
            }}
          />
        )}

        {activeTab === 'items' && (
          <CollectionItemsSection
            selectedCollection={selectedCollection}
            language={language}
            accentColor={config.accentColor}
            onAdd={() => setIsAddItemOpen(true)}
            onToggleStatus={(itemId, nextStatus) => updateItem(itemId, { status: nextStatus })}
            onDeleteItem={deleteItem}
          />
        )}
      </div>

      <AddCollectionSheet
        open={isAddCollectionOpen}
        onOpenChange={setIsAddCollectionOpen}
        language={language}
        accentColor={config.accentColor}
        form={newCollection}
        onChange={(patch) => setNewCollection((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleAddCollection}
      />

      <AddItemSheet
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        language={language}
        form={newItem}
        onChange={(patch) => setNewItem((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleAddItem}
      />
    </div>
  );
}
