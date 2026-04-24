import type { Exercise } from '@/store/training-store';

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string, language: 'en' | 'ru'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const months = language === 'ru'
    ? ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function formatFullDate(dateStr: string, language: 'en' | 'ru'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const weekdays = language === 'ru'
    ? ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = language === 'ru'
    ? ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const WORKOUT_TYPES = [
  { id: 'strength', emoji: '🏋️', labelEn: 'Strength', labelRu: 'Силовая' },
  { id: 'cardio', emoji: '🏃', labelEn: 'Cardio', labelRu: 'Кардио' },
  { id: 'flexibility', emoji: '🧘', labelEn: 'Flexibility', labelRu: 'Гибкость' },
  { id: 'other', emoji: '⚡', labelEn: 'Other', labelRu: 'Другое' },
] as const;

export function getTypeLabel(type: string, language: 'en' | 'ru'): string {
  const found = WORKOUT_TYPES.find((t) => t.id === type);
  if (!found) return type;
  return language === 'ru' ? found.labelRu : found.labelEn;
}

export function getTypeEmoji(type: string): string {
  const found = WORKOUT_TYPES.find((t) => t.id === type);
  return found?.emoji ?? '💪';
}

export function formatVolume(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * ex.weight, 0);
}
