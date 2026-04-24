'use client';

import { create } from 'zustand';

export interface FeedPostItem {
  id: string;
  content: string;
  mood: string | null;
  tags: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeedState {
  posts: FeedPostItem[];
  isLoading: boolean;
  loadPosts: () => Promise<void>;
  addPost: (data: { content: string; mood?: string; tags?: string }) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>()((set) => ({
  posts: [],
  isLoading: false,

  loadPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/feed/posts');
      if (res.ok) {
        const data = await res.json();
        set({ posts: data.posts ?? [] });
      }
    } catch { /* empty */ }
    set({ isLoading: false });
  },

  addPost: async (data) => {
    try {
      const res = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({ posts: [d.post, ...s.posts] }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  togglePin: async (id, isPinned) => {
    try {
      const res = await fetch(`/api/feed/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned }),
      });
      if (res.ok) {
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, isPinned } : p)),
        }));
      }
    } catch { /* empty */ }
  },

  deletePost: async (id) => {
    try {
      const res = await fetch(`/api/feed/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
      }
    } catch { /* empty */ }
  },
}));
