// ==================== Module Types ====================
export type ModuleId =
  | 'feed'
  | 'diary'
  | 'shifts'
  | 'finance'
  | 'nutrition'
  | 'training'
  | 'habits'
  | 'collections'
  | 'genealogy'
  | 'health'
  | 'calendar'
  | 'looksmaxxing'
  | 'gamification'
  | 'reminders'
  | 'settings';

export interface ModuleConfig {
  id: ModuleId;
  nameKey: string;
  icon: string;
  accentHue: number;
  accentColor: string;
  accentColorLight: string;
  accentColorDark: string;
  navGroup: 'primary' | 'more';
  description: string;
}

// ==================== Settings Types ====================
export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'ru';
export type WaterUnit = 'ml' | 'fl_oz';
export type WeightUnit = 'kg' | 'lbs';
export type DistanceUnit = 'km' | 'mi';
export type CurrencyCode = 'USD' | 'EUR' | 'RUB' | 'GBP' | 'JPY' | 'CNY';
export type FirstDayOfWeek = 'monday' | 'sunday';

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  waterUnit: WaterUnit;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  currency: CurrencyCode;
  firstDayOfWeek: FirstDayOfWeek;
}

// ==================== Navigation Types ====================
export interface NavigationState {
  activeModule: ModuleId;
  moreMenuOpen: boolean;
}

// ==================== Stats Types ====================
export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

// ==================== Tab Types ====================
export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

// ==================== Analytics Types ====================
export type AnalyticsPeriod = 'week' | 'month' | 'year';

// ==================== RPG / Gamification Types ====================
export type RPGAttribute = 'strength' | 'agility' | 'intelligence' | 'endurance' | 'charisma';

export interface RPGStats {
  strength: number;
  agility: number;
  intelligence: number;
  endurance: number;
  charisma: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  characterClass: string;
}

// ==================== Common Types ====================
export interface DateRange {
  from: Date;
  to: Date;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: string;
}
