export type NutritionLanguage = 'en' | 'ru';

export const NUTRITION_TABS = {
  diary: { en: 'Diary', ru: 'Дневник' },
  water: { en: 'Water', ru: 'Вода' },
  analytics: { en: 'Analytics', ru: 'Аналитика' },
} as const;

export const MEAL_TYPES = [
  { id: 'breakfast', icon: '🌅', en: 'Breakfast', ru: 'Завтрак' },
  { id: 'lunch', icon: '☀️', en: 'Lunch', ru: 'Обед' },
  { id: 'dinner', icon: '🌙', en: 'Dinner', ru: 'Ужин' },
  { id: 'snack', icon: '🍎', en: 'Snack', ru: 'Перекус' },
] as const;

export const WATER_PRESETS = [250, 500, 750] as const;

export const DAY_LABELS = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
} as const;

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function shiftDateByDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateLabel(dateStr: string, language: NutritionLanguage): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return language === 'ru' ? 'Сегодня' : 'Today';
  if (diff === -1) return language === 'ru' ? 'Вчера' : 'Yesterday';
  if (diff === 1) return language === 'ru' ? 'Завтра' : 'Tomorrow';

  const weekdays = language === 'ru'
    ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = language === 'ru'
    ? ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}
