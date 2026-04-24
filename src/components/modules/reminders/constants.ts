export const PRIORITIES = [
  { value: 'low', labelEn: 'Low', labelRu: 'Низкий', color: '#94a3b8', icon: '🟢' },
  { value: 'normal', labelEn: 'Normal', labelRu: 'Обычный', color: '#3b82f6', icon: '🔵' },
  { value: 'high', labelEn: 'High', labelRu: 'Высокий', color: '#f97316', icon: '🟠' },
  { value: 'urgent', labelEn: 'Urgent', labelRu: 'Срочный', color: '#ef4444', icon: '🔴' },
] as const;

export const CATEGORIES = [
  { value: 'general', icon: '📌', labelEn: 'General', labelRu: 'Общее' },
  { value: 'health', icon: '❤️', labelEn: 'Health', labelRu: 'Здоровье' },
  { value: 'finance', icon: '💰', labelEn: 'Finance', labelRu: 'Финансы' },
  { value: 'work', icon: '💼', labelEn: 'Work', labelRu: 'Работа' },
  { value: 'personal', icon: '👤', labelEn: 'Personal', labelRu: 'Личное' },
] as const;

export const PRESETS = [
  { key: 'water', icon: '💧', titleEn: 'Drink water', titleRu: 'Выпить воду', category: 'health', priority: 'normal' },
  { key: 'training', icon: '🏋️', titleEn: 'Workout', titleRu: 'Тренировка', category: 'health', priority: 'high' },
  { key: 'bill', icon: '🧾', titleEn: 'Pay bill', titleRu: 'Оплатить счет', category: 'finance', priority: 'high' },
  { key: 'call', icon: '📞', titleEn: 'Call', titleRu: 'Позвонить', category: 'personal', priority: 'normal' },
] as const;

export type ReminderLanguage = 'en' | 'ru';

export type ReminderFormValues = {
  title: string;
  description: string;
  date: string;
  time: string;
  priority: string;
  category: string;
};
