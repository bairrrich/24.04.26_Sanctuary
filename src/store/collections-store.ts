'use client';

import { create } from 'zustand';

export interface CollectionItem {
  id: string;
  collectionId: string;
  name: string;
  description: string | null;
  rating: number | null;
  status: string;
  review: string | null;
  tags: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionData {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  type: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  items: CollectionItem[];
}

interface CollectionsState {
  collections: CollectionData[];
  isLoading: boolean;
  loadCollections: () => Promise<void>;
  addCollection: (data: { name: string; description?: string; icon?: string; color?: string; type?: string }) => Promise<void>;
  addItem: (collectionId: string, data: { name: string; description?: string; rating?: number; status?: string; review?: string }) => Promise<void>;
  updateItem: (id: string, data: Partial<CollectionItem>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>()((set) => ({
  collections: [],
  isLoading: false,

  loadCollections: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/collections/collections');
      if (res.ok) {
        const data = await res.json();
        set({ collections: data.collections ?? [] });
      }
    } catch { /* empty */ }
    set({ isLoading: false });
  },

  addCollection: async (data) => {
    try {
      const res = await fetch('/api/collections/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({ collections: [d.collection, ...s.collections] }));
      }
    } catch { /* empty */ }
  },

  addItem: async (collectionId, data) => {
    try {
      const res = await fetch('/api/collections/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, ...data }),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId ? { ...c, items: [...c.items, d.item] } : c
          ),
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  updateItem: async (id, data) => {
    try {
      const res = await fetch(`/api/collections/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        set((s) => ({
          collections: s.collections.map((c) => ({
            ...c,
            items: c.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
          })),
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  deleteCollection: async (id) => {
    try {
      const res = await fetch(`/api/collections/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }));
      }
    } catch { /* empty */ }
  },

  deleteItem: async (id) => {
    try {
      const res = await fetch(`/api/collections/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({
          collections: s.collections.map((c) => ({
            ...c,
            items: c.items.filter((i) => i.id !== id),
          })),
        }));
      }
    } catch { /* empty */ }
  },
}));
