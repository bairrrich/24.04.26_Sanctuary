// Supabase Edge Function: emit-xp
// Handles XP emission with achievement checking and quest progress updates
// Deployed at: https://hqqfebdcxiancvaloriq.supabase.co/functions/v1/emit-xp

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// XP rules per module:action
const XP_RULES: Record<string, { attribute: string; amount: number }> = {
  // Habits
  'habits:habit_complete': { attribute: 'agility', amount: 8 },
  'habits:streak_milestone': { attribute: 'agility', amount: 15 },
  'habits:all_daily_complete': { attribute: 'agility', amount: 30 },
  // Nutrition
  'nutrition:meal_log': { attribute: 'endurance', amount: 3 },
  'nutrition:water_glass': { attribute: 'endurance', amount: 2 },
  'nutrition:water_goal': { attribute: 'endurance', amount: 15 },
  'nutrition:daily_macros': { attribute: 'endurance', amount: 20 },
  'nutrition:daily_calories': { attribute: 'endurance', amount: 20 },
  // Training
  'training:workout_complete': { attribute: 'strength', amount: 15 },
  'training:exercise_pr': { attribute: 'strength', amount: 25 },
  'training:weekly_goal': { attribute: 'strength', amount: 40 },
  // Finance
  'finance:transaction_log': { attribute: 'intelligence', amount: 3 },
  'finance:budget_created': { attribute: 'intelligence', amount: 15 },
  'finance:savings_goal': { attribute: 'intelligence', amount: 25 },
  // Diary
  'diary:entry_create': { attribute: 'charisma', amount: 5 },
  'diary:entry_long': { attribute: 'charisma', amount: 12 },
  'diary:daily_reflection': { attribute: 'charisma', amount: 15 },
  // Calendar
  'calendar:event_create': { attribute: 'intelligence', amount: 3 },
  'calendar:event_attend': { attribute: 'charisma', amount: 5 },
  // Health
  'health:body_measurements': { attribute: 'endurance', amount: 5 },
  'health:mood_log': { attribute: 'charisma', amount: 3 },
  'health:wellbeing_good': { attribute: 'endurance', amount: 5 },
  // Looksmaxxing
  'looksmaxxing:routine_complete': { attribute: 'charisma', amount: 8 },
  'looksmaxxing:progress_photo': { attribute: 'charisma', amount: 5 },
  'looksmaxxing:rating_improve': { attribute: 'charisma', amount: 20 },
  // Shifts
  'shifts:shift_complete': { attribute: 'endurance', amount: 10 },
  'shifts:overtime_logged': { attribute: 'strength', amount: 5 },
  // Feed
  'feed:post_create': { attribute: 'charisma', amount: 8 },
  // Collections
  'collections:item_add': { attribute: 'intelligence', amount: 5 },
  'collections:review_write': { attribute: 'charisma', amount: 10 },
  'collections:collection_complete': { attribute: 'intelligence', amount: 30 },
  // Reminders
  'reminders:reminder_complete': { attribute: 'agility', amount: 3 },
  // Genealogy
  'genealogy:member_add': { attribute: 'charisma', amount: 10 },
  'genealogy:event_add': { attribute: 'charisma', amount: 5 },
};

// Exponential level scaling: level N requires base * 1.2^(N-1) XP
function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Get level from total XP
function getLevel(totalXP: number): number {
  let level = 1;
  let xpNeeded = xpForLevel(1);
  while (totalXP >= xpNeeded) {
    totalXP -= xpNeeded;
    level++;
    xpNeeded = xpForLevel(level);
  }
  return level;
}

// Determine class from stats
function getClass(stats: Record<string, number>): string {
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const secondary = sorted[1];

  const classMap: Record<string, string> = {
    strength: 'Warrior',
    agility: 'Rogue',
    intelligence: 'Scholar',
    endurance: 'Survivor',
    charisma: 'Leader',
  };

  // If dominant stat is less than 30% more than secondary, it's hybrid
  if (dominant[1] > 0 && secondary[1] / dominant[1] > 0.7) {
    return `${classMap[secondary[0]]}-${classMap[dominant[0]]}`;
  }

  return classMap[dominant[0]] || 'Novice';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { module, action, characterId, metadata } = await req.json();

    if (!module || !action || !characterId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: module, action, characterId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ruleKey = `${module}:${action}`;
    const rule = XP_RULES[ruleKey];

    if (!rule) {
      return new Response(
        JSON.stringify({ error: `No XP rule for ${ruleKey}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Create XP event
    const { data: xpEvent, error: xpError } = await supabase
      .from('XPEvent')
      .insert({
        characterId,
        module,
        action,
        attribute: rule.attribute,
        amount: rule.amount,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .select()
      .single();

    if (xpError) throw xpError;

    // 2. Update character attribute XP and level
    const { data: attr } = await supabase
      .from('CharacterAttribute')
      .select('xp, level')
      .eq('characterId', characterId)
      .eq('attribute', rule.attribute)
      .single();

    const currentXP = (attr?.xp || 0) + rule.amount;
    const newAttrLevel = getLevel(currentXP);

    await supabase
      .from('CharacterAttribute')
      .upsert({
        characterId,
        attribute: rule.attribute,
        xp: currentXP,
        level: newAttrLevel,
      }, { onConflict: 'characterId,attribute' });

    // 3. Update total character XP and level
    const { data: character } = await supabase
      .from('Character')
      .select('totalXP, level')
      .eq('id', characterId)
      .single();

    const newTotalXP = (character?.totalXP || 0) + rule.amount;
    const newLevel = getLevel(newTotalXP);
    const leveledUp = newLevel > (character?.level || 1);

    // 4. Recalculate class from all attributes
    const { data: allAttrs } = await supabase
      .from('CharacterAttribute')
      .select('attribute, xp')
      .eq('characterId', characterId);

    const statsMap: Record<string, number> = {};
    (allAttrs || []).forEach((a: { attribute: string; xp: number }) => {
      statsMap[a.attribute] = a.xp;
    });
    const newClass = getClass(statsMap);

    // 5. Update character
    await supabase
      .from('Character')
      .update({
        totalXP: newTotalXP,
        level: newLevel,
        currentClassId: newClass.toLowerCase(),
      })
      .eq('id', characterId);

    // 6. Check quest progress (non-blocking)
    const { data: activeQuests } = await supabase
      .from('UserQuest')
      .select('*')
      .eq('characterId', characterId)
      .eq('status', 'active');

    const questUpdates: Array<{ id: string; completed: boolean }> = [];

    for (const quest of (activeQuests || [])) {
      // Simple matching: quest's module:action matches current action
      try {
        const questData = JSON.parse(quest.questId);
        if (questData.module === module && questData.action === action) {
          const newProgress = (quest.progress || 0) + 1;
          const completed = newProgress >= quest.target;

          await supabase
            .from('UserQuest')
            .update({
              progress: newProgress,
              status: completed ? 'completed' : 'active',
              completedAt: completed ? new Date().toISOString() : null,
            })
            .eq('id', quest.id);

          questUpdates.push({ id: quest.id, completed });
        }
      } catch {
        // questId might not be JSON, skip
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        xpEvent,
        attribute: rule.attribute,
        xpAmount: rule.amount,
        newLevel,
        leveledUp,
        newClass,
        questUpdates,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('emit-xp error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
