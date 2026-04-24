export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const MOODS = [
  { id: 'great', emoji: '😄', labelEn: 'Great', labelRu: 'Отлично' },
  { id: 'good', emoji: '🙂', labelEn: 'Good', labelRu: 'Хорошо' },
  { id: 'neutral', emoji: '😐', labelEn: 'Neutral', labelRu: 'Нормально' },
  { id: 'bad', emoji: '😟', labelEn: 'Bad', labelRu: 'Плохо' },
  { id: 'terrible', emoji: '😢', labelEn: 'Terrible', labelRu: 'Ужасно' },
] as const;

export const SYMPTOMS_EN = ['Headache', 'Fatigue', 'Sore throat', 'Cough', 'Fever', 'Nausea', 'Dizziness', 'Back pain', 'Stomach ache', 'Insomnia'];
export const SYMPTOMS_RU = ['Головная боль', 'Усталость', 'Боль в горле', 'Кашель', 'Температура', 'Тошнота', 'Головокружение', 'Боль в спине', 'Боль в животе', 'Бессонница'];

export const GOAL_TYPES = [
  { id: 'weight', labelEn: 'Weight (kg)', labelRu: 'Вес (кг)', icon: '⚖️' },
  { id: 'body_fat', labelEn: 'Body Fat (%)', labelRu: 'Жир (%)', icon: '📊' },
  { id: 'waist', labelEn: 'Waist (cm)', labelRu: 'Талия (см)', icon: '📏' },
  { id: 'sleep', labelEn: 'Sleep (hours)', labelRu: 'Сон (часы)', icon: '😴' },
  { id: 'energy', labelEn: 'Energy (1-10)', labelRu: 'Энергия (1-10)', icon: '⚡' },
  { id: 'stress', labelEn: 'Stress (1-10)', labelRu: 'Стресс (1-10)', icon: '🧘' },
] as const;

export const MOOD_COLORS: Record<string, string> = {
  great: '#22c55e',
  good: '#84cc16',
  neutral: '#eab308',
  bad: '#f97316',
  terrible: '#ef4444',
};
