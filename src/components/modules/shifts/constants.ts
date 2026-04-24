export const SHIFT_TYPES = [
  { value: 'regular', labelEn: 'Regular', labelRu: 'Обычная', color: '#3b82f6', icon: '💼' },
  { value: 'overtime', labelEn: 'Overtime', labelRu: 'Переработка', color: '#f97316', icon: '⏰' },
  { value: 'holiday', labelEn: 'Holiday', labelRu: 'Праздничная', color: '#22c55e', icon: '🎉' },
  { value: 'sick', labelEn: 'Sick leave', labelRu: 'Больничный', color: '#ef4444', icon: '🤒' },
  { value: 'vacation', labelEn: 'Vacation', labelRu: 'Отпуск', color: '#a855f7', icon: '🏖️' },
] as const;

export type ShiftsLanguage = 'en' | 'ru';

export type ShiftFormValues = {
  date: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  role: string;
  location: string;
  note: string;
};

export function defaultShiftForm(): ShiftFormValues {
  return {
    date: new Date().toISOString().split('T')[0],
    timeStart: '09:00',
    timeEnd: '17:00',
    type: 'regular',
    role: '',
    location: '',
    note: '',
  };
}
