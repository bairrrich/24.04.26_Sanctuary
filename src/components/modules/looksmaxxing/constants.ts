export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export const CATEGORIES = [
  { id: 'skincare', icon: '🧴', en: 'Skincare', ru: 'Уход за кожей' },
  { id: 'grooming', icon: '💇', en: 'Grooming', ru: 'Груминг' },
  { id: 'style', icon: '👔', en: 'Style', ru: 'Стиль' },
  { id: 'fitness', icon: '💪', en: 'Fitness', ru: 'Фитнес' },
  { id: 'nutrition', icon: '🥗', en: 'Nutrition', ru: 'Питание' },
  { id: 'posture', icon: '🧘', en: 'Posture', ru: 'Осанка' },
  { id: 'other', icon: '✨', en: 'Other', ru: 'Другое' },
] as const;

export const PHOTO_CATEGORIES = [
  { id: 'face', en: 'Face', ru: 'Лицо' },
  { id: 'body', en: 'Body', ru: 'Тело' },
  { id: 'style', en: 'Style', ru: 'Стиль' },
  { id: 'other', en: 'Other', ru: 'Другое' },
] as const;

export const FREQUENCIES = [
  { id: 'daily', en: 'Daily', ru: 'Ежедневно' },
  { id: 'weekly', en: 'Weekly', ru: 'Еженедельно' },
  { id: 'custom', en: 'Custom', ru: 'Другое' },
] as const;

export const ICON_OPTIONS = ['✨', '🧴', '💇', '👔', '💪', '🥗', '🧘', '🪥', '💧', '🪒', '🧹', '💆', '🦷', '👀', '🎯', '⭐'] as const;

export type LooksLanguage = 'en' | 'ru';
