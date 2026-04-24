import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateDailyQuestSet } from '@/lib/gamification/quest-generator';
import { QUEST_POOL } from '@/lib/gamification/quest-pool';

// ==================== GET /api/gamification/quests ====================

/**
 * Return active quests for the character.
 * Query params:
 *  - characterId (optional, defaults to first character)
 *  - status (optional, defaults to "active")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const status = searchParams.get('status') ?? 'all';

    // Find character
    let character;
    if (characterId) {
      character = await db.character.findUnique({ where: { id: characterId } });
    } else {
      character = await db.character.findFirst();
    }

    if (!character) {
      return NextResponse.json({ quests: [] });
    }

    // Fetch quests with optional status filter
    const where: Record<string, unknown> = { characterId: character.id };
    if (status !== 'all') {
      where.status = status;
    }

    const quests = await db.userQuest.findMany({
      where,
      orderBy: [{ status: 'asc' }, { expiresAt: 'asc' }],
    });

    // Enrich with template data
    const enriched = quests.map((q) => {
      const template = QUEST_POOL.find(t => t.id === q.questId);
      return {
        id: q.id,
        questId: q.questId,
        status: q.status,
        progress: q.progress,
        target: q.target,
        completedAt: q.completedAt?.toISOString() ?? null,
        expiresAt: q.expiresAt?.toISOString() ?? null,
        template: template ? {
          titleEn: template.titleEn,
          titleRu: template.titleRu,
          descriptionEn: template.descriptionEn,
          descriptionRu: template.descriptionRu,
          type: template.type,
          category: template.category,
          difficulty: template.difficulty,
          rewardXP: template.rewardXP,
          stat: template.stat,
        } : null,
      };
    });

    return NextResponse.json({ quests: enriched });
  } catch (error) {
    console.error('Error getting quests:', error);
    return NextResponse.json({ error: 'Failed to get quests' }, { status: 500 });
  }
}

// ==================== POST /api/gamification/quests ====================

/**
 * Generate new daily quests for the character.
 * Body:
 *  - characterId (optional, defaults to first character)
 *  - type (optional): "daily" | "full" — daily generates dailies only, full generates the full set
 *
 * Existing active daily/weekly quests are expired before generating new ones.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId } = body;
    const questType = body.type ?? 'full';

    // Find character
    let character;
    if (characterId) {
      character = await db.character.findUnique({ where: { id: characterId } });
    } else {
      character = await db.character.findFirst();
    }

    if (!character) {
      return NextResponse.json({ error: 'No character found' }, { status: 404 });
    }

    // Expire existing active quests
    await db.userQuest.updateMany({
      where: {
        characterId: character.id,
        status: 'active',
      },
      data: { status: 'expired' },
    });

    // Generate new quests
    const templates = questType === 'daily'
      ? generateDailyQuestSet().slice(0, 4) // just the 4 daily quests
      : generateDailyQuestSet();

    // Calculate expiry times
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

    // Create UserQuest records
    const created = [];
    for (const template of templates) {
      // Skip if already exists (completed or otherwise) — use try/catch for unique constraint
      try {
        const quest = await db.userQuest.create({
          data: {
            characterId: character.id,
            questId: template.id,
            status: 'active',
            progress: 0,
            target: template.target,
            expiresAt: template.type === 'daily' ? endOfDay : endOfWeek,
          },
        });
        created.push(quest);
      } catch {
        // Skip duplicate quest (unique constraint on characterId + questId)
      }
    }

    return NextResponse.json({
      generated: created.length,
      quests: created.map(q => ({
        id: q.id,
        questId: q.questId,
        status: q.status,
        progress: q.progress,
        target: q.target,
        expiresAt: q.expiresAt?.toISOString() ?? null,
      })),
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating quests:', error);
    return NextResponse.json({ error: 'Failed to generate quests' }, { status: 500 });
  }
}
