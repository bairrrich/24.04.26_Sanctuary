export const RELATIONS = [
  { value: 'mother', icon: '👩', labelEn: 'Mother', labelRu: 'Мать' },
  { value: 'father', icon: '👨', labelEn: 'Father', labelRu: 'Отец' },
  { value: 'sister', icon: '👧', labelEn: 'Sister', labelRu: 'Сестра' },
  { value: 'brother', icon: '👦', labelEn: 'Brother', labelRu: 'Брат' },
  { value: 'spouse', icon: '💍', labelEn: 'Spouse', labelRu: 'Супруг(а)' },
  { value: 'child', icon: '👶', labelEn: 'Child', labelRu: 'Ребёнок' },
  { value: 'grandparent', icon: '🧓', labelEn: 'Grandparent', labelRu: 'Бабушка/Дедушка' },
  { value: 'other', icon: '👤', labelEn: 'Other', labelRu: 'Другой' },
] as const;

export const EVENT_TYPES = [
  { value: 'birthday', icon: '🎂', labelEn: 'Birthday', labelRu: 'День рождения', color: '#f97316' },
  { value: 'anniversary', icon: '💕', labelEn: 'Anniversary', labelRu: 'Годовщина', color: '#ec4899' },
  { value: 'holiday', icon: '🎄', labelEn: 'Holiday', labelRu: 'Праздник', color: '#22c55e' },
  { value: 'reunion', icon: '🤝', labelEn: 'Reunion', labelRu: 'Встреча', color: '#6366f1' },
  { value: 'other', icon: '📅', labelEn: 'Other', labelRu: 'Другое', color: '#94a3b8' },
] as const;

export type GenealogyLanguage = 'en' | 'ru';

export type MemberFormValues = {
  name: string;
  relation: string;
  birthDate: string;
  notes: string;
};

export type EventFormValues = {
  title: string;
  description: string;
  date: string;
  type: string;
  memberId: string;
};
