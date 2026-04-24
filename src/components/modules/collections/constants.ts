export const COLLECTION_TYPES = [
  { value: 'books', icon: '📚', labelEn: 'Books', labelRu: 'Книги', color: '#6366f1' },
  { value: 'movies', icon: '🎬', labelEn: 'Movies', labelRu: 'Фильмы', color: '#ef4444' },
  { value: 'games', icon: '🎮', labelEn: 'Games', labelRu: 'Игры', color: '#22c55e' },
  { value: 'music', icon: '🎵', labelEn: 'Music', labelRu: 'Музыка', color: '#a855f7' },
  { value: 'recipes', icon: '🍳', labelEn: 'Recipes', labelRu: 'Рецепты', color: '#f97316' },
  { value: 'general', icon: '📁', labelEn: 'General', labelRu: 'Общее', color: '#64748b' },
] as const;

export const STATUS_LABELS: Record<string, { en: string; ru: string }> = {
  planned: { en: 'Planned', ru: 'Запланировано' },
  in_progress: { en: 'In Progress', ru: 'В процессе' },
  completed: { en: 'Completed', ru: 'Завершено' },
};

export type CollectionsLanguage = 'en' | 'ru';

export type NewCollectionForm = {
  name: string;
  description: string;
  type: string;
};

export type NewItemForm = {
  name: string;
  description: string;
  status: string;
  rating: number;
  review: string;
};
