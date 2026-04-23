/**
 * Design tokens and constants for the Sanctuary app.
 * All sizes, spacing, and timing values are centralized here
 * to prevent hardcoding across the application.
 */

// ==================== Layout Sizes ====================
export const LAYOUT = {
  /** Page header height */
  HEADER_HEIGHT: 56,
  /** Stat card height */
  STAT_CARD_HEIGHT: 40,
  /** Tabs height */
  TABS_HEIGHT: 40,
  /** Search/filter bar height */
  SEARCH_FILTER_HEIGHT: 40,
  /** Bottom navbar height on mobile */
  MOBILE_NAV_HEIGHT: 64,
  /** Sidebar width on desktop */
  SIDEBAR_WIDTH: 240,
  /** Sidebar collapsed width */
  SIDEBAR_COLLAPSED_WIDTH: 64,
  /** FAB size */
  FAB_SIZE: 56,
  /** FAB bottom offset (above mobile nav) */
  FAB_BOTTOM_OFFSET: 80,
  /** FAB right offset */
  FAB_RIGHT_OFFSET: 16,
} as const;

// ==================== Animation ====================
export const ANIMATION = {
  /** Standard spring config for page transitions */
  SPRING_GENTLE: { type: 'spring' as const, stiffness: 300, damping: 30 },
  /** Snappy spring for buttons/interactive */
  SPRING_SNAPPY: { type: 'spring' as const, stiffness: 400, damping: 25 },
  /** Bouncy spring for FAB and modals */
  SPRING_BOUNCY: { type: 'spring' as const, stiffness: 400, damping: 20 },
  /** Standard duration in seconds */
  DURATION_FAST: 0.15,
  DURATION_NORMAL: 0.25,
  DURATION_SLOW: 0.4,
  /** Stagger delay between list items */
  STAGGER_DELAY: 0.05,
  /** Page transition variants */
  PAGE_TRANSITION: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  /** Fade transition */
  FADE_TRANSITION: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
} as const;

// ==================== Spacing ====================
export const SPACING = {
  /** Page horizontal padding */
  PAGE_PX: 'px-4 sm:px-6',
  /** Page vertical padding */
  PAGE_PY: 'py-4 sm:py-6',
  /** Card padding */
  CARD_P: 'p-4 sm:p-6',
  /** Section gap */
  SECTION_GAP: 'gap-4 sm:gap-6',
  /** Item gap */
  ITEM_GAP: 'gap-2 sm:gap-3',
} as const;

// ==================== Z-Index ====================
export const Z_INDEX = {
  BASE: 0,
  SIDEBAR: 30,
  MOBILE_NAV: 40,
  FAB: 50,
  SHEET: 50,
  DIALOG: 60,
  TOAST: 70,
  TOOLTIP: 80,
} as const;

// ==================== Breakpoints ====================
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

// ==================== Date/Time ====================
export const TIME = {
  /** Format string for short time display */
  TIME_FORMAT_12: 'h:mm a',
  TIME_FORMAT_24: 'HH:mm',
  /** Date format */
  DATE_FORMAT_SHORT: 'dd MMM',
  DATE_FORMAT_FULL: 'dd MMM yyyy',
  /** Days of week starting Monday */
  DAYS_MON: [1, 2, 3, 4, 5, 6, 0] as const,
  /** Days of week starting Sunday */
  DAYS_SUN: [0, 1, 2, 3, 4, 5, 6] as const,
} as const;

// ==================== Currency Symbols ====================
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
} as const;

// ==================== RPG Constants ====================
export const RPG = {
  /** XP required per level (formula: base * level^1.5) */
  XP_BASE: 100,
  XP_EXPONENT: 1.5,
  /** Starting level */
  START_LEVEL: 1,
  /** RPG attribute keys */
  ATTRIBUTES: ['strength', 'agility', 'intelligence', 'endurance', 'charisma'] as const,
  /** Attribute display names (i18n keys) */
  ATTRIBUTE_NAMES: {
    strength: 'rpg.strength',
    agility: 'rpg.agility',
    intelligence: 'rpg.intelligence',
    endurance: 'rpg.endurance',
    charisma: 'rpg.charisma',
  } as const,
  /** Attribute icons */
  ATTRIBUTE_ICONS: {
    strength: 'Sword',
    agility: 'Zap',
    intelligence: 'Brain',
    endurance: 'Shield',
    charisma: 'Star',
  } as const,
} as const;

// ==================== Locale ====================
export const LOCALES = {
  en: {
    name: 'English',
    flag: '🇬🇧',
  },
  ru: {
    name: 'Русский',
    flag: '🇷🇺',
  },
} as const;

// ==================== Collections Types ====================
export const COLLECTION_TYPES = [
  'books',
  'movies',
  'anime',
  'recipes',
  'medicines',
  'vitamins',
  'supplements',
  'herbs',
  'healthyProducts',
  'cosmetics',
  'games',
  'music',
  'podcasts',
  'courses',
] as const;
