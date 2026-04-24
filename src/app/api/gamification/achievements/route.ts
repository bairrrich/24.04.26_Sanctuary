import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ACHIEVEMENTS } from '@/lib/gamification/achievement-engine';

// ==================== GET /api/gamification/achievements ====================

/**
 * Return all achievements for the character with unlocked status.
 * Query params:
 *  - characterId (optional, defaults to first character)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    // Find character
    let character;
    if (characterId) {
      character = await db.character.findUnique({
        where: { id: characterId },
        include: { achievements: true },
      });
    } else {
      character = await db.character.findFirst({
        include: { achievements: true },
      });
    }

    if (!character) {
      return NextResponse.json({ achievements: [] });
    }

    // Build a set of unlocked achievement IDs
    const unlockedIds = new Set(character.achievements.map(a => a.achievementId));

    // Map unlocked info by ID for quick lookup
    const unlockedMap = new Map(
      character.achievements.map(a => [a.achievementId, a])
    );

    // Merge all definitions with unlock status
    const allAchievements = ACHIEVEMENTS.map((def) => {
      const isUnlocked = unlockedIds.has(def.id);
      const userAchievement = unlockedMap.get(def.id);

      return {
        id: def.id,
        nameEn: def.nameEn,
        nameRu: def.nameRu,
        descriptionEn: def.descriptionEn,
        descriptionRu: def.descriptionRu,
        icon: def.icon,
        isUnlocked,
        unlockedAt: userAchievement?.unlockedAt?.toISOString() ?? null,
      };
    });

    // Count stats
    const total = allAchievements.length;
    const unlocked = allAchievements.filter(a => a.isUnlocked).length;

    return NextResponse.json({
      achievements: allAchievements,
      stats: {
        total,
        unlocked,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}
