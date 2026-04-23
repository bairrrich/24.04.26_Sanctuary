'use client';

import { create } from 'zustand';
import type { RPGAttribute, RPGStats } from '@/types';

export interface CharacterState {
  id: string | null;
  name: string;
  avatar: string | null;
  level: number;
  totalXP: number;
  currentClassId: string;
  isHybrid: boolean;
  hybridClassId: string | null;
  isSetupComplete: boolean;
  attributes: Record<RPGAttribute, { xp: number; level: number }>;
  recentXPEvents: XPEventItem[];
  isLoading: boolean;
}

export interface XPEventItem {
  id: string;
  module: string;
  action: string;
  attribute: RPGAttribute;
  amount: number;
  createdAt: string;
}

interface GamificationState extends CharacterState {
  // Actions
  loadCharacter: () => Promise<void>;
  createCharacter: (name: string) => Promise<void>;
  updateSetup: (data: Record<string, unknown>) => Promise<void>;
  completeSetup: () => Promise<void>;
  emitXP: (module: string, action: string) => Promise<void>;
  setCharacter: (data: Partial<CharacterState>) => void;
}

const DEFAULT_ATTRIBUTES: Record<RPGAttribute, { xp: number; level: number }> = {
  strength: { xp: 0, level: 1 },
  agility: { xp: 0, level: 1 },
  intelligence: { xp: 0, level: 1 },
  endurance: { xp: 0, level: 1 },
  charisma: { xp: 0, level: 1 },
};

const INITIAL_STATE: CharacterState = {
  id: null,
  name: '',
  avatar: null,
  level: 1,
  totalXP: 0,
  currentClassId: 'novice',
  isHybrid: false,
  hybridClassId: null,
  isSetupComplete: false,
  attributes: { ...DEFAULT_ATTRIBUTES },
  recentXPEvents: [],
  isLoading: true,
};

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  ...INITIAL_STATE,

  loadCharacter: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/gamification/character');
      if (res.ok) {
        const data = await res.json();
        if (data.character) {
          set({
            id: data.character.id,
            name: data.character.name,
            avatar: data.character.avatar,
            level: data.character.level,
            totalXP: data.character.totalXP,
            currentClassId: data.character.currentClassId,
            isHybrid: data.character.isHybrid ?? false,
            hybridClassId: data.character.hybridClassId ?? null,
            isSetupComplete: data.character.isSetupComplete,
            attributes: data.character.attributes ?? { ...DEFAULT_ATTRIBUTES },
            recentXPEvents: data.character.recentXPEvents ?? [],
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createCharacter: async (name: string) => {
    try {
      const res = await fetch('/api/gamification/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          id: data.character.id,
          name: data.character.name,
          level: data.character.level,
          totalXP: data.character.totalXP,
          currentClassId: data.character.currentClassId,
          isSetupComplete: data.character.isSetupComplete,
          attributes: { ...DEFAULT_ATTRIBUTES },
          isLoading: false,
        });
      } else if (res.status === 409) {
        // Character already exists — load it so setup can continue
        const loadRes = await fetch('/api/gamification/character');
        if (loadRes.ok) {
          const loadData = await loadRes.json();
          if (loadData.character) {
            set({
              id: loadData.character.id,
              name: loadData.character.name,
              avatar: loadData.character.avatar,
              level: loadData.character.level,
              totalXP: loadData.character.totalXP,
              currentClassId: loadData.character.currentClassId,
              isHybrid: loadData.character.isHybrid ?? false,
              hybridClassId: loadData.character.hybridClassId ?? null,
              isSetupComplete: loadData.character.isSetupComplete,
              attributes: loadData.character.attributes ?? { ...DEFAULT_ATTRIBUTES },
              recentXPEvents: loadData.character.recentXPEvents ?? [],
              isLoading: false,
            });
          }
        }
      }
    } catch {
      // Handle error
    }
  },

  updateSetup: async (setupData) => {
    const { id } = get();
    if (!id) return;
    try {
      await fetch('/api/gamification/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: id, ...setupData }),
      });
    } catch {
      // Handle error
    }
  },

  completeSetup: async () => {
    const { id } = get();
    if (!id) return;
    try {
      const res = await fetch('/api/gamification/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: id }),
      });
      if (res.ok) {
        set({ isSetupComplete: true });
      }
    } catch {
      // Handle error
    }
  },

  emitXP: async (module, action) => {
    const { id } = get();
    if (!id) return;
    try {
      const res = await fetch('/api/gamification/emit-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: id, module, action }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state with server response
        set({
          level: data.character.level,
          totalXP: data.character.totalXP,
          currentClassId: data.character.currentClassId,
          isHybrid: data.character.isHybrid ?? false,
          hybridClassId: data.character.hybridClassId ?? null,
          attributes: data.character.attributes ?? get().attributes,
          recentXPEvents: data.character.recentXPEvents
            ? [data.character.recentXPEvents, ...get().recentXPEvents].slice(0, 20)
            : get().recentXPEvents,
        });
      }
    } catch {
      // Handle error
    }
  },

  setCharacter: (data) => set(data),
}));
