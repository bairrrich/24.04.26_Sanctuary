export const MOODS = [
  { value: 'great', icon: '😄', labelEn: 'Great', labelRu: 'Отлично', color: '#22c55e' },
  { value: 'good', icon: '🙂', labelEn: 'Good', labelRu: 'Хорошо', color: '#84cc16' },
  { value: 'neutral', icon: '😐', labelEn: 'Neutral', labelRu: 'Нормально', color: '#f59e0b' },
  { value: 'bad', icon: '😟', labelEn: 'Bad', labelRu: 'Плохо', color: '#ef4444' },
] as const;

export type FeedLanguage = 'en' | 'ru';
