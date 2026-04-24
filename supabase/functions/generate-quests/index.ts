// Supabase Edge Function: generate-quests
// Dynamically generates daily/weekly/challenge quests based on user activity
// Deployed at: https://hqqfebdcxiancvaloriq.supabase.co/functions/v1/generate-quests

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Quest templates by category
const QUEST_POOL = {
  daily: [
    { templateId: 'd_habit_1', title: 'Complete 3 habits', titleRu: 'Выполните 3 привычки', module: 'habits', action: 'habit_complete', target: 3, xp: 20, difficulty: 'easy', attribute: 'agility' },
    { templateId: 'd_water_1', title: 'Drink 6 glasses of water', titleRu: 'Выпейте 6 стаканов воды', module: 'nutrition', action: 'water_glass', target: 6, xp: 15, difficulty: 'easy', attribute: 'endurance' },
    { templateId: 'd_meal_1', title: 'Log 3 meals', titleRu: 'Запишите 3 приёма пищи', module: 'nutrition', action: 'meal_log', target: 3, xp: 15, difficulty: 'easy', attribute: 'endurance' },
    { templateId: 'd_diary_1', title: 'Write a diary entry', titleRu: 'Напишите запись в дневник', module: 'diary', action: 'entry_create', target: 1, xp: 10, difficulty: 'easy', attribute: 'charisma' },
    { templateId: 'd_workout_1', title: 'Complete a workout', titleRu: 'Завершите тренировку', module: 'training', action: 'workout_complete', target: 1, xp: 25, difficulty: 'medium', attribute: 'strength' },
    { templateId: 'd_routine_1', title: 'Complete 2 self-care routines', titleRu: 'Выполните 2 рутины ухода', module: 'looksmaxxing', action: 'routine_complete', target: 2, xp: 20, difficulty: 'easy', attribute: 'charisma' },
    { templateId: 'd_shift_1', title: 'Complete your shift', titleRu: 'Завершите смену', module: 'shifts', action: 'shift_complete', target: 1, xp: 15, difficulty: 'easy', attribute: 'endurance' },
    { templateId: 'd_reminder_1', title: 'Complete 3 reminders', titleRu: 'Выполните 3 напоминания', module: 'reminders', action: 'reminder_complete', target: 3, xp: 15, difficulty: 'easy', attribute: 'agility' },
  ],
  weekly: [
    { templateId: 'w_habit_1', title: 'Complete 20 habits this week', titleRu: 'Выполните 20 привычек за неделю', module: 'habits', action: 'habit_complete', target: 20, xp: 80, difficulty: 'medium', attribute: 'agility' },
    { templateId: 'w_workout_1', title: 'Complete 4 workouts this week', titleRu: 'Завершите 4 тренировки за неделю', module: 'training', action: 'workout_complete', target: 4, xp: 100, difficulty: 'hard', attribute: 'strength' },
    { templateId: 'w_diary_1', title: 'Write 5 diary entries', titleRu: 'Напишите 5 записей в дневник', module: 'diary', action: 'entry_create', target: 5, xp: 60, difficulty: 'medium', attribute: 'charisma' },
    { templateId: 'w_finance_1', title: 'Log 10 transactions', titleRu: 'Запишите 10 транзакций', module: 'finance', action: 'transaction_log', target: 10, xp: 50, difficulty: 'medium', attribute: 'intelligence' },
    { templateId: 'w_collection_1', title: 'Add 5 items to collections', titleRu: 'Добавьте 5 элементов в коллекции', module: 'collections', action: 'item_add', target: 5, xp: 40, difficulty: 'medium', attribute: 'intelligence' },
  ],
  challenge: [
    { templateId: 'c_pr_1', title: 'Set a new personal record', titleRu: 'Установите новый личный рекорд', module: 'training', action: 'exercise_pr', target: 1, xp: 75, difficulty: 'hard', attribute: 'strength' },
    { templateId: 'c_streak_1', title: 'Reach a 7-day habit streak', titleRu: 'Достигните 7-дневной серии привычек', module: 'habits', action: 'streak_milestone', target: 1, xp: 100, difficulty: 'hard', attribute: 'agility' },
    { templateId: 'c_review_1', title: 'Write 3 reviews', titleRu: 'Напишите 3 обзора', module: 'collections', action: 'review_write', target: 3, xp: 60, difficulty: 'medium', attribute: 'charisma' },
    { templateId: 'c_savings_1', title: 'Reach a savings goal', titleRu: 'Достигните цели накоплений', module: 'finance', action: 'savings_goal', target: 1, xp: 120, difficulty: 'hard', attribute: 'intelligence' },
  ],
};

// Difficulty XP multiplier
const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
};

// Shuffle array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { characterId, type } = await req.json();

    if (!characterId) {
      return new Response(
        JSON.stringify({ error: 'Missing characterId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get character's current stats for weighted quest selection
    const { data: attrs } = await supabase
      .from('CharacterAttribute')
      .select('attribute, xp')
      .eq('characterId', characterId);

    const statsMap: Record<string, number> = {};
    (attrs || []).forEach((a: { attribute: string; xp: number }) => {
      statsMap[a.attribute] = a.xp;
    });

    // Get existing active quests to avoid duplicates
    const { data: existingQuests } = await supabase
      .from('UserQuest')
      .select('questId')
      .eq('characterId', characterId)
      .eq('status', 'active');

    const existingIds = new Set((existingQuests || []).map((q: { questId: string }) => q.questId));

    // Generate quests based on type
    const questTypes = type ? [type] : ['daily', 'weekly', 'challenge'];
    const generated: Array<Record<string, unknown>> = [];

    const now = new Date();
    const dailyExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const weeklyExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const questType of questTypes) {
      const pool = QUEST_POOL[questType as keyof typeof QUEST_POOL];
      if (!pool) continue;

      const available = pool.filter(q => !existingIds.has(q.templateId));
      const shuffled = shuffle(available);

      // Pick 3 daily, 2 weekly, 1 challenge
      const count = questType === 'daily' ? 3 : questType === 'weekly' ? 2 : 1;
      const selected = shuffled.slice(0, count);

      for (const quest of selected) {
        const multiplier = DIFFICULTY_MULTIPLIER[quest.difficulty] || 1;
        const finalXP = Math.floor(quest.xp * multiplier);

        const expiresAt = questType === 'daily' ? dailyExpiry :
                         questType === 'weekly' ? weeklyExpiry :
                         null; // Challenges don't expire

        const questData = {
          characterId,
          questId: quest.templateId,
          status: 'active',
          progress: 0,
          target: quest.target,
          expiresAt: expiresAt?.toISOString() || null,
        };

        const { data, error } = await supabase
          .from('UserQuest')
          .upsert(questData, { onConflict: 'characterId,questId' })
          .select()
          .single();

        if (!error && data) {
          generated.push({
            ...data,
            title: quest.title,
            titleRu: quest.titleRu,
            module: quest.module,
            action: quest.action,
            difficulty: quest.difficulty,
            xpReward: finalXP,
            attribute: quest.attribute,
            type: questType,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, quests: generated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('generate-quests error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
