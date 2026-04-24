# Sanctuary — Roadmap улучшений по образцу популярных приложений

Дата анализа: 2026-04-24

## 1) Продуктовая стратегия уровня «топ-приложений»

### Что уже хорошо
- Модульная архитектура (финансы, питание, тренировки, привычки, календарь, дневник и т.д.).
- Геймификация (XP, квесты, достижения, классы), что даёт мощный retention-контур.

### Что добавить в первую очередь
1. **North Star-метрика + событийная аналитика (Amplitude/PostHog)**
   - Определить: Weekly Active Goal Completers (WAGC) или Daily Intent Completion Rate.
   - Считать: создание намерения, завершение задач, возврат на следующий день, 7/30-day retention.
2. **Персонализированный Home-экран (как Notion/Apple Fitness/TickTick)**
   - Блок «Сегодня» с 3 главными действиями вместо равнозначной выдачи модулей.
3. **Умная оркестрация модулей**
   - Пример: если нет сна + высокая усталость в health → мягкий тренировочный план + напоминание воды + адаптация квестов.

---

## 2) UX/UI улучшения (как у лидеров категории)

### 2.1 Навигация и IA (Information Architecture)
- **Adaptive navigation**: показывать 4-5 наиболее часто используемых модулей в нижнем меню динамически.
- **Global command palette** (как Linear/Notion): `Cmd/Ctrl+K` для быстрого перехода/действий.
- **Уровни глубины**: снизить число кликов до ключевого действия (добавить запись, лог тренировки, добавить транзакцию).

### 2.2 Онбординг и activation
- **Guided setup** за 60-90 сек:
  - выбрать цель (похудение, дисциплина, фин.подушка и т.д.),
  - подтянуть 1-2 стартовых шаблона.
- **Progressive disclosure**: новые функции открываются по мере готовности пользователя.
- **Activation checklist**: 3 шага до first success (например: 1 привычка + 1 тренировка + 1 финзапись).

### 2.3 Визуальная полировка
- Ввести **UI Audit Pass** каждую неделю:
  - проверка spacing/radius/typography token compliance,
  - единые empty/loading/error states.
- **Skeleton стандарты**: одинаковая высота, радиус, shimmer-скорость по всем экранам.

---

## 3) Геймификация (дифференциатор Sanctuary)

### Что внедрить
1. **Петли прогресса уровня Duolingo/Strava**
   - Ежедневная серия + grace-day + защита streak.
2. **Season Pass / Battle Pass**
   - 4-недельные сезоны с прогрессивными наградами.
3. **Social proof и челленджи**
   - Друзья/семья, private-лиги, weekly challenges.
4. **Dynamic quests**
   - Квесты формируются из слабых зон пользователя (например, пропуски воды/сна).

### Anti-burnout механики
- «Rest day XP», мягкие цели и recovery-scoring.
- Автокалибровка сложности задач по выполнению за последние 14 дней.

---

## 4) Модульные улучшения (по типу лучших вертикальных приложений)

## 4.1 Finance (YNAB/Monarch/Copilot)
- Zero-based budgeting + envelope-подход.
- Автокатегоризация трат (ML rules + user rules).
- Cashflow forecast на 30/90 дней.
- Goal tracking (подушка, отпуск) с projected completion date.
- Подписки/регулярные платежи + аномалии расходов.

## 4.2 Training (Strava/Hevy/Strong)
- Планировщик микроциклов (4-8 недель).
- PR-алерты и auto-suggest веса/повторов.
- Recovery readiness score (сон + самочувствие + стресс).
- Импорт из HealthKit/Google Fit/Garmin.

## 4.3 Nutrition (MyFitnessPal/Cronometer)
- Баркод-сканер + быстрый ввод «из истории».
- Macro coaching (динамические цели по дням недели/тренировкам).
- Meal templates + grocery suggestions.
- Correlation-инсайты (питание ↔ энергия/сон/вес).

## 4.4 Habits (Habitify/Streaks)
- Habit stacking и if-then планы.
- Anti-skip guardrails (tiny version привычки).
- Weekly reflection + auto-adjust frequency.

## 4.5 Diary/Feed (Day One/Reflectly)
- Prompts, guided journaling, sentiment trends.
- Voice-to-text и фото-моменты.
- Search + tags + semantic highlights.

## 4.6 Calendar/Reminders (TickTick/Todoist)
- Natural language input ("завтра 19:00 тренировка").
- Smart rescheduling + priority matrix.
- Deep links между событиями и модулями Sanctuary.

---

## 5) AI-функции (как у современных top apps)

1. **AI Coach**
   - Ежедневный brief: что важно сегодня, почему и какой минимальный шаг.
2. **Weekly Review Copilot**
   - Авто-ретроспектива: победы, провалы, рекомендации на следующую неделю.
3. **Predictive nudges**
   - Предсказывать риск срыва по привычкам/тренировкам и заранее вмешиваться.
4. **Natural language analytics**
   - Вопросы вида: «почему в последние 2 недели упала продуктивность?»

---

## 6) Производительность и инженерные улучшения

### Frontend performance
- Ввести perf budgets (LCP, INP, CLS) и мониторинг Web Vitals.
- Виртуализация длинных списков (история, ленты, транзакции).
- Разделение тяжёлых графиков/редакторов на lazy chunks.

### Data layer
- Оптимизировать повторные fetch-паттерны, унифицировать кэш-стратегию (TanStack Query).
- Нормализовать optimistic updates и конфликт-резолв при оффлайн-режиме.

### Offline-first
- Локальная очередь мутаций + retry/backoff.
- Синхронизация и merge-стратегии (last-write-wins + domain rules).

---

## 7) Retention/монетизация

1. **Retention loops**
   - Daily plan + evening recap + weekly milestone.
2. **Premium tier**
   - AI coach, advanced analytics, integrations, export, season pass.
3. **Lifecycle communication**
   - Win-back сценарии на 3/7/14 день неактивности.

---

## 8) Безопасность и доверие
- Ясный privacy center: какие данные, где, зачем.
- Экспорт/удаление данных в 1 клик.
- Шифрование чувствительных полей и audit trails.

---

## 9) Приоритизированный план внедрения (90 дней)

## Фаза 1 (0-30 дней): Foundation
- Event taxonomy + аналитика воронок.
- Home «Today Focus».
- Unified loading/empty/error states.
- 3 ключевых интеграции (календарь, health, финансы — хотя бы 1-2).

## Фаза 2 (31-60 дней): Differentiation
- AI daily brief + weekly review.
- Dynamic quests + streak protection.
- Finance cashflow forecast + subscription detection.

## Фаза 3 (61-90 дней): Growth
- Social challenges.
- Premium paywall A/B.
- Win-back и реферальные механики.

---

## 10) KPI для контроля качества изменений
- D1/D7/D30 retention
- WAU/MAU
- Intent completion rate
- Average streak length
- Time-to-first-value
- NPS / CSAT
- Crash-free sessions

---

## 11) Статус реализации (текущий спринт)
- ✅ Реализован **Global command palette** (`Cmd/Ctrl + K`) для быстрого переключения модулей и базовых быстрых действий.
- ✅ Добавлен **Quick Create** из command palette: запуск FAB активного модуля.
- ✅ Реализована базовая **adaptive mobile navigation**: нижние 4 модуля формируются динамически по локальной частоте использования.
- ✅ Добавлены **deep-link модулей** (`?module=...`) и быстрый `copy link` из command palette.
- ✅ Добавлен блок **Recent modules** в command palette (последние 5 модулей).
- ✅ Добавлен блок **Today Focus** в Feed с быстрыми действиями (заметка/тренировка/расход).
- ✅ Добавлена кнопка-активатор command palette на desktop (discoverability + shortcut hint).
- ✅ Добавлен базовый **Activation checklist** (3 шага) в Feed с прогресс-баром.
- ✅ Для activation checklist добавлены **dismiss/reset** сценарии.
- ⏭️ AI-направление и retention/монетизация намеренно пропущены в этой итерации.
