import type { ModuleConfig, ModuleId } from '@/types';

/**
 * Module registry - defines all application modules with their
 * accent colors, icons, and navigation grouping.
 *
 * Colors use oklch format for consistency with the design system.
 * Each module has a distinct hue to provide visual identity.
 */
export const MODULE_REGISTRY: Record<ModuleId, ModuleConfig> = {
  feed: {
    id: 'feed',
    nameKey: 'modules.feed',
    icon: 'Rss',
    accentHue: 30,
    accentColor: 'oklch(0.705 0.213 47.604)',
    accentColorLight: 'oklch(0.88 0.12 47.604)',
    accentColorDark: 'oklch(0.55 0.2 47.604)',
    navGroup: 'primary',
    description: 'Social feed to share records from any module',
  },
  diary: {
    id: 'diary',
    nameKey: 'modules.diary',
    icon: 'BookOpen',
    accentHue: 290,
    accentColor: 'oklch(0.606 0.25 292.717)',
    accentColorLight: 'oklch(0.85 0.12 292.717)',
    accentColorDark: 'oklch(0.45 0.22 292.717)',
    navGroup: 'more',
    description: 'Personal journal for thoughts and reflections',
  },
  shifts: {
    id: 'shifts',
    nameKey: 'modules.shifts',
    icon: 'CalendarClock',
    accentHue: 175,
    accentColor: 'oklch(0.657 0.145 175.5)',
    accentColorLight: 'oklch(0.85 0.08 175.5)',
    accentColorDark: 'oklch(0.5 0.13 175.5)',
    navGroup: 'more',
    description: 'Work shift schedule with overtime tracking',
  },
  finance: {
    id: 'finance',
    nameKey: 'modules.finance',
    icon: 'Wallet',
    accentHue: 160,
    accentColor: 'oklch(0.696 0.17 162.48)',
    accentColorLight: 'oklch(0.87 0.08 162.48)',
    accentColorDark: 'oklch(0.52 0.15 162.48)',
    navGroup: 'primary',
    description: 'Personal finance control with budgets and goals',
  },
  nutrition: {
    id: 'nutrition',
    nameKey: 'modules.nutrition',
    icon: 'Apple',
    accentHue: 130,
    accentColor: 'oklch(0.768 0.189 142.495)',
    accentColorLight: 'oklch(0.9 0.1 142.495)',
    accentColorDark: 'oklch(0.58 0.16 142.495)',
    navGroup: 'primary',
    description: 'Nutrition tracking with macros, water, and meal plans',
  },
  training: {
    id: 'training',
    nameKey: 'modules.training',
    icon: 'Dumbbell',
    accentHue: 350,
    accentColor: 'oklch(0.645 0.246 16.439)',
    accentColorLight: 'oklch(0.85 0.12 16.439)',
    accentColorDark: 'oklch(0.48 0.2 16.439)',
    navGroup: 'primary',
    description: 'Workout log with exercises and progress tracking',
  },
  habits: {
    id: 'habits',
    nameKey: 'modules.habits',
    icon: 'Target',
    accentHue: 195,
    accentColor: 'oklch(0.695 0.152 195)',
    accentColorLight: 'oklch(0.87 0.08 195)',
    accentColorDark: 'oklch(0.52 0.13 195)',
    navGroup: 'more',
    description: 'Track positive and negative habits',
  },
  collections: {
    id: 'collections',
    nameKey: 'modules.collections',
    icon: 'Library',
    accentHue: 330,
    accentColor: 'oklch(0.656 0.241 339.5)',
    accentColorLight: 'oklch(0.85 0.12 339.5)',
    accentColorDark: 'oklch(0.48 0.2 339.5)',
    navGroup: 'more',
    description: 'Curated collections of books, movies, recipes, and more',
  },
  genealogy: {
    id: 'genealogy',
    nameKey: 'modules.genealogy',
    icon: 'GitBranch',
    accentHue: 80,
    accentColor: 'oklch(0.769 0.188 70.08)',
    accentColorLight: 'oklch(0.9 0.1 70.08)',
    accentColorDark: 'oklch(0.58 0.16 70.08)',
    navGroup: 'more',
    description: 'Family tree with life events',
  },
  health: {
    id: 'health',
    nameKey: 'modules.health',
    icon: 'Heart',
    accentHue: 25,
    accentColor: 'oklch(0.637 0.237 25.331)',
    accentColorLight: 'oklch(0.85 0.12 25.331)',
    accentColorDark: 'oklch(0.47 0.2 25.331)',
    navGroup: 'more',
    description: 'Health tracking: wellbeing and illness log',
  },
  calendar: {
    id: 'calendar',
    nameKey: 'modules.calendar',
    icon: 'Calendar',
    accentHue: 220,
    accentColor: 'oklch(0.585 0.15 220)',
    accentColorLight: 'oklch(0.82 0.07 220)',
    accentColorDark: 'oklch(0.43 0.13 220)',
    navGroup: 'more',
    description: 'Unified calendar with all events',
  },
  looksmaxxing: {
    id: 'looksmaxxing',
    nameKey: 'modules.looksmaxxing',
    icon: 'Sparkles',
    accentHue: 300,
    accentColor: 'oklch(0.666 0.265 303.9)',
    accentColorLight: 'oklch(0.85 0.12 303.9)',
    accentColorDark: 'oklch(0.48 0.22 303.9)',
    navGroup: 'more',
    description: 'Look optimization tracking and routines',
  },
  gamification: {
    id: 'gamification',
    nameKey: 'modules.gamification',
    icon: 'Trophy',
    accentHue: 95,
    accentColor: 'oklch(0.795 0.184 102)',
    accentColorLight: 'oklch(0.92 0.1 102)',
    accentColorDark: 'oklch(0.6 0.16 102)',
    navGroup: 'more',
    description: 'RPG-style progression with achievements and quests',
  },
  reminders: {
    id: 'reminders',
    nameKey: 'modules.reminders',
    icon: 'Bell',
    accentHue: 40,
    accentColor: 'oklch(0.768 0.189 84.429)',
    accentColorLight: 'oklch(0.9 0.1 84.429)',
    accentColorDark: 'oklch(0.58 0.16 84.429)',
    navGroup: 'more',
    description: 'Aggregated reminders and notifications from all modules',
  },
  settings: {
    id: 'settings',
    nameKey: 'modules.settings',
    icon: 'Settings',
    accentHue: 240,
    accentColor: 'oklch(0.551 0.027 240)',
    accentColorLight: 'oklch(0.8 0.015 240)',
    accentColorDark: 'oklch(0.4 0.025 240)',
    navGroup: 'more',
    description: 'App configuration and preferences',
  },
};

/** Get module config by ID */
export function getModuleConfig(id: ModuleId): ModuleConfig {
  return MODULE_REGISTRY[id];
}

/** Get all module IDs */
export function getAllModuleIds(): ModuleId[] {
  return Object.keys(MODULE_REGISTRY) as ModuleId[];
}

/** Get primary nav modules (shown in bottom navbar) */
export function getPrimaryNavModules(): ModuleConfig[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.navGroup === 'primary');
}

/** Get secondary nav modules (shown in "More" menu) */
export function getMoreNavModules(): ModuleConfig[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.navGroup === 'more');
}

/** Module display order */
export const MODULE_ORDER: ModuleId[] = [
  'feed',
  'diary',
  'shifts',
  'finance',
  'nutrition',
  'training',
  'habits',
  'collections',
  'genealogy',
  'health',
  'calendar',
  'looksmaxxing',
  'gamification',
  'reminders',
  'settings',
];
