// Supabase Edge Function: check-achievements
// Checks and unlocks achievements based on user progress
// Deployed at: https://hqqfebdcxiancvaloriq.supabase.co/functions/v1/check-achievements

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Achievement definitions
const ACHIEVEMENTS = [
  // General
  { id: 'first_xp', name: 'First Steps', nameRu: 'Первые шаги', description: 'Earn your first XP', descriptionRu: 'Получите первый опыт', category: 'general', condition: { type: 'total_xp', min: 1 } },
  { id: 'level_5', name: 'Rising Star', nameRu: 'Восходящая звезда', description: 'Reach level 5', descriptionRu: 'Достигните 5 уровня', category: 'general', condition: { type: 'level', min: 5 } },
  { id: 'level_10', name: 'Experienced', nameRu: 'Опытный', description: 'Reach level 10', descriptionRu: 'Достигните 10 уровня', category: 'general', condition: { type: 'level', min: 10 } },
  { id: 'level_25', name: 'Veteran', nameRu: 'Ветеран', description: 'Reach level 25', descriptionRu: 'Достигните 25 уровня', category: 'general', condition: { type: 'level', min: 25 } },
  { id: 'level_50', name: 'Legend', nameRu: 'Легенда', description: 'Reach level 50', descriptionRu: 'Достигните 50 уровня', category: 'general', condition: { type: 'level', min: 50 } },
  // Strength
  { id: 'first_workout', name: 'Iron Initiate', nameRu: 'Новичок железа', description: 'Complete your first workout', descriptionRu: 'Завершите первую тренировку', category: 'strength', condition: { type: 'module_actions', module: 'training', action: 'workout_complete', min: 1 } },
  { id: 'workout_10', name: 'Fitness Warrior', nameRu: 'Воин фитнеса', description: 'Complete 10 workouts', descriptionRu: 'Завершите 10 тренировок', category: 'strength', condition: { type: 'module_actions', module: 'training', action: 'workout_complete', min: 10 } },
  { id: 'first_pr', name: 'Personal Best', nameRu: 'Личный рекорд', description: 'Set your first PR', descriptionRu: 'Установите первый личный рекорд', category: 'strength', condition: { type: 'module_actions', module: 'training', action: 'exercise_pr', min: 1 } },
  // Agility
  { id: 'first_habit', name: 'Habit Starter', nameRu: 'Начинающий привычек', description: 'Complete your first habit', descriptionRu: 'Выполните первую привычку', category: 'agility', condition: { type: 'module_actions', module: 'habits', action: 'habit_complete', min: 1 } },
  { id: 'habit_50', name: 'Habit Master', nameRu: 'Мастер привычек', description: 'Complete 50 habits', descriptionRu: 'Выполните 50 привычек', category: 'agility', condition: { type: 'module_actions', module: 'habits', action: 'habit_complete', min: 50 } },
  { id: 'streak_7', name: 'Week Warrior', nameRu: 'Воин недели', description: 'Reach a 7-day streak', descriptionRu: 'Достигните 7-дневной серии', category: 'agility', condition: { type: 'module_actions', module: 'habits', action: 'streak_milestone', min: 1 } },
  // Intelligence
  { id: 'first_transaction', name: 'Money Tracker', nameRu: 'Финансовый трекер', description: 'Log your first transaction', descriptionRu: 'Запишите первую транзакцию', category: 'intelligence', condition: { type: 'module_actions', module: 'finance', action: 'transaction_log', min: 1 } },
  { id: 'transaction_50', name: 'Finance Guru', nameRu: 'Финансовый гуру', description: 'Log 50 transactions', descriptionRu: 'Запишите 50 транзакций', category: 'intelligence', condition: { type: 'module_actions', module: 'finance', action: 'transaction_log', min: 50 } },
  // Endurance
  { id: 'first_meal', name: 'Nutrition Start', nameRu: 'Начало питания', description: 'Log your first meal', descriptionRu: 'Запишите первый приём пищи', category: 'endurance', condition: { type: 'module_actions', module: 'nutrition', action: 'meal_log', min: 1 } },
  { id: 'water_goal', name: 'Hydrated', nameRu: 'Гидратация', description: 'Reach daily water goal', descriptionRu: 'Достигните дневной нормы воды', category: 'endurance', condition: { type: 'module_actions', module: 'nutrition', action: 'water_goal', min: 1 } },
  // Charisma
  { id: 'first_diary', name: 'Diary Writer', nameRu: 'Писатель дневника', description: 'Write your first diary entry', descriptionRu: 'Напишите первую запись в дневник', category: 'charisma', condition: { type: 'module_actions', module: 'diary', action: 'entry_create', min: 1 } },
  { id: 'diary_20', name: 'Chronicler', nameRu: 'Летописец', description: 'Write 20 diary entries', descriptionRu: 'Напишите 20 записей', category: 'charisma', condition: { type: 'module_actions', module: 'diary', action: 'entry_create', min: 20 } },
  { id: 'first_routine', name: 'Self-Care Start', nameRu: 'Начало ухода', description: 'Complete your first routine', descriptionRu: 'Завершите первую рутину', category: 'charisma', condition: { type: 'module_actions', module: 'looksmaxxing', action: 'routine_complete', min: 1 } },
  // Quests
  { id: 'first_quest', name: 'Quest Taker', nameRu: 'Искатель', description: 'Complete your first quest', descriptionRu: 'Завершите первый квест', category: 'general', condition: { type: 'quests_completed', min: 1 } },
  { id: 'quest_10', name: 'Adventurer', nameRu: 'Авантюрист', description: 'Complete 10 quests', descriptionRu: 'Завершите 10 квестов', category: 'general', condition: { type: 'quests_completed', min: 10 } },
  { id: 'quest_50', name: 'Quest Legend', nameRu: 'Легенда квестов', description: 'Complete 50 quests', descriptionRu: 'Завершите 50 квестов', category: 'general', condition: { type: 'quests_completed', min: 50 } },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { characterId } = await req.json();

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

    // Get character data
    const { data: character } = await supabase
      .from('Character')
      .select('totalXP, level')
      .eq('id', characterId)
      .single();

    if (!character) {
      return new Response(
        JSON.stringify({ error: 'Character not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing achievements
    const { data: existingAchievements } = await supabase
      .from('UserAchievement')
      .select('achievementId')
      .eq('characterId', characterId);

    const unlockedIds = new Set(
      (existingAchievements || []).map((a: { achievementId: string }) => a.achievementId)
    );

    // Get module action counts
    const { data: xpEvents } = await supabase
      .from('XPEvent')
      .select('module, action')
      .eq('characterId', characterId);

    // Count actions by module:action
    const actionCounts: Record<string, number> = {};
    (xpEvents || []).forEach((e: { module: string; action: string }) => {
      const key = `${e.module}:${e.action}`;
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    });

    // Get completed quest count
    const { count: questsCompleted } = await supabase
      .from('UserQuest')
      .select('*', { count: 'exact', head: true })
      .eq('characterId', characterId)
      .eq('status', 'completed');

    // Check each achievement
    const newlyUnlocked: Array<Record<string, unknown>> = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      let conditionMet = false;
      const cond = achievement.condition;

      switch (cond.type) {
        case 'total_xp':
          conditionMet = character.totalXP >= cond.min;
          break;
        case 'level':
          conditionMet = character.level >= cond.min;
          break;
        case 'module_actions': {
          const key = `${cond.module}:${cond.action}`;
          conditionMet = (actionCounts[key] || 0) >= cond.min;
          break;
        }
        case 'quests_completed':
          conditionMet = (questsCompleted || 0) >= cond.min;
          break;
      }

      if (conditionMet) {
        const { data, error } = await supabase
          .from('UserAchievement')
          .insert({
            characterId,
            achievementId: achievement.id,
          })
          .select()
          .single();

        if (!error && data) {
          newlyUnlocked.push({
            ...data,
            name: achievement.name,
            nameRu: achievement.nameRu,
            description: achievement.description,
            descriptionRu: achievement.descriptionRu,
            category: achievement.category,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkedCount: ACHIEVEMENTS.length,
        alreadyUnlocked: unlockedIds.size,
        newlyUnlocked: newlyUnlocked.length,
        achievements: newlyUnlocked,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('check-achievements error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
