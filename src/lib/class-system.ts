/**
 * Modern Class System — realistic lifestyle archetypes.
 *
 * Classes are AUTO-ASSIGNED based on dominant attributes.
 * No manual class selection — your behavior defines your archetype.
 *
 * Tiers reflect real-world progression:
 *   Trainee → Specialist → Expert → Master → Legend
 */
import type { RPGAttribute } from '@/types';

// ==================== Class Definitions ====================

export interface CharacterClass {
  id: string;
  nameRu: string;
  nameEn: string;
  icon: string; // emoji
  descriptionRu: string;
  descriptionEn: string;
  primaryAttribute: RPGAttribute | null; // null = balanced/no preference
  tier: number; // 0=novice, 1=specialist, 2=expert, 3=master, 4=legend
  requiredLevel: number;
}

/** All available classes ordered by tier */
export const CHARACTER_CLASSES: CharacterClass[] = [
  // ── Tier 0: Novice (Level 1-4) ──
  {
    id: 'novice',
    nameRu: 'Стажёр',
    nameEn: 'Trainee',
    icon: '🌱',
    descriptionRu: 'Начало пути. Каждое действие формирует твою судьбу.',
    descriptionEn: 'The beginning. Every action shapes your destiny.',
    primaryAttribute: null,
    tier: 0,
    requiredLevel: 1,
  },

  // ── Tier 1: Specialist (Level 5-9) ──
  {
    id: 'athlete',
    nameRu: 'Атлет',
    nameEn: 'Athlete',
    icon: '🏋️',
    descriptionRu: 'Тело — храм. Дисциплина и физическая сила определяют твой путь.',
    descriptionEn: 'Body is a temple. Discipline and physical strength define your path.',
    primaryAttribute: 'strength',
    tier: 1,
    requiredLevel: 5,
  },
  {
    id: 'trailblazer',
    nameRu: 'Первооткрыватель',
    nameEn: 'Trailblazer',
    icon: '🧭',
    descriptionRu: 'Ловкость ума и тела. Привычки формируют твою свободу.',
    descriptionEn: 'Agility of mind and body. Habits shape your freedom.',
    primaryAttribute: 'agility',
    tier: 1,
    requiredLevel: 5,
  },
  {
    id: 'strategist',
    nameRu: 'Стратег',
    nameEn: 'Strategist',
    icon: '🧠',
    descriptionRu: 'Финансы, знания, планирование. Интеллект — твой главный ресурс.',
    descriptionEn: 'Finance, knowledge, planning. Intelligence is your main resource.',
    primaryAttribute: 'intelligence',
    tier: 1,
    requiredLevel: 5,
  },
  {
    id: 'guardian',
    nameRu: 'Страж',
    nameEn: 'Guardian',
    icon: '🛡️',
    descriptionRu: 'Здоровье, питание, выносливость. Ты стоишь твёрдо.',
    descriptionEn: 'Health, nutrition, endurance. You stand firm.',
    primaryAttribute: 'endurance',
    tier: 1,
    requiredLevel: 5,
  },
  {
    id: 'leader',
    nameRu: 'Лидер',
    nameEn: 'Leader',
    icon: '⭐',
    descriptionRu: 'Дневник, лента, общение. Харизма открывает двери.',
    descriptionEn: 'Diary, feed, social. Charisma opens doors.',
    primaryAttribute: 'charisma',
    tier: 1,
    requiredLevel: 5,
  },

  // ── Tier 2: Expert (Level 10-19) ──
  {
    id: 'champion',
    nameRu: 'Чемпион',
    nameEn: 'Champion',
    icon: '🏆',
    descriptionRu: 'Непревзойдённая сила. Твои результаты говорят сами за себя.',
    descriptionEn: 'Unmatched strength. Your results speak for themselves.',
    primaryAttribute: 'strength',
    tier: 2,
    requiredLevel: 10,
  },
  {
    id: 'ranger',
    nameRu: 'Рейнджер',
    nameEn: 'Ranger',
    icon: '🏃',
    descriptionRu: 'Быстрый, адаптивный, непредсказуемый. Ловкость — твой козырь.',
    descriptionEn: 'Fast, adaptive, unpredictable. Agility is your trump card.',
    primaryAttribute: 'agility',
    tier: 2,
    requiredLevel: 10,
  },
  {
    id: 'mastermind',
    nameRu: 'Мастер-ум',
    nameEn: 'Mastermind',
    icon: '💡',
    descriptionRu: 'Мастер стратегий. Твой интеллект решает исход любых задач.',
    descriptionEn: 'Strategy master. Your intellect decides the outcome of any challenge.',
    primaryAttribute: 'intelligence',
    tier: 2,
    requiredLevel: 10,
  },
  {
    id: 'balancer',
    nameRu: 'Балансёр',
    nameEn: 'Balancer',
    icon: '⚖️',
    descriptionRu: 'Гармония тела и духа. Выносливость — основа твоего успеха.',
    descriptionEn: 'Harmony of body and spirit. Endurance is the foundation of your success.',
    primaryAttribute: 'endurance',
    tier: 2,
    requiredLevel: 10,
  },
  {
    id: 'visionary',
    nameRu: 'Визионер',
    nameEn: 'Visionary',
    icon: '✨',
    descriptionRu: 'Ты вдохновляешь других. Харизма — твоя суперсила.',
    descriptionEn: 'You inspire others. Charisma is your superpower.',
    primaryAttribute: 'charisma',
    tier: 2,
    requiredLevel: 10,
  },

  // ── Tier 3: Master (Level 20-29) ──
  {
    id: 'titan',
    nameRu: 'Титан',
    nameEn: 'Titan',
    icon: '⚡',
    descriptionRu: 'Сила, возведённая в абсолют. Ты — сила природы.',
    descriptionEn: 'Strength taken to the absolute. You are a force of nature.',
    primaryAttribute: 'strength',
    tier: 3,
    requiredLevel: 20,
  },
  {
    id: 'shadow',
    nameRu: 'Тень',
    nameEn: 'Shadow',
    icon: '🗡️',
    descriptionRu: 'Невидимый, но повсюду. Ловкость, доведённая до искусства.',
    descriptionEn: 'Invisible but everywhere. Agility elevated to art.',
    primaryAttribute: 'agility',
    tier: 3,
    requiredLevel: 20,
  },
  {
    id: 'architect',
    nameRu: 'Архитектор',
    nameEn: 'Architect',
    icon: '🏗️',
    descriptionRu: 'Ты строишь империи решений. Интеллект без границ.',
    descriptionEn: 'You build empires of solutions. Boundless intelligence.',
    primaryAttribute: 'intelligence',
    tier: 3,
    requiredLevel: 20,
  },
  {
    id: 'monolith',
    nameRu: 'Монолит',
    nameEn: 'Monolith',
    icon: '🏔️',
    descriptionRu: 'Непоколебимый. Выносливость, которая не знает предела.',
    descriptionEn: 'Unshakable. Endurance that knows no limit.',
    primaryAttribute: 'endurance',
    tier: 3,
    requiredLevel: 20,
  },
  {
    id: 'icon',
    nameRu: 'Икона',
    nameEn: 'Icon',
    icon: '👑',
    descriptionRu: 'Ты — образец для подражания. Харизма, меняющая мир.',
    descriptionEn: 'You are the role model. World-changing charisma.',
    primaryAttribute: 'charisma',
    tier: 3,
    requiredLevel: 20,
  },

  // ── Tier 4: Legend (Level 30+) ──
  {
    id: 'legend_strength',
    nameRu: 'Легенда Силы',
    nameEn: 'Legend of Strength',
    icon: '🔥',
    descriptionRu: 'Мифическая сила. Твоё имя становится синонимом мощи.',
    descriptionEn: 'Mythical strength. Your name becomes synonymous with power.',
    primaryAttribute: 'strength',
    tier: 4,
    requiredLevel: 30,
  },
  {
    id: 'legend_agility',
    nameRu: 'Легенда Ловкости',
    nameEn: 'Legend of Agility',
    icon: '🌀',
    descriptionRu: 'Сверхчеловеческая реакция. Ты двигаешься быстрее мысли.',
    descriptionEn: 'Superhuman reaction. You move faster than thought.',
    primaryAttribute: 'agility',
    tier: 4,
    requiredLevel: 30,
  },
  {
    id: 'legend_intelligence',
    nameRu: 'Легенда Интеллекта',
    nameEn: 'Legend of Intelligence',
    icon: '🌌',
    descriptionRu: 'Всезнание. Твой разум охватывает вселенную решений.',
    descriptionEn: 'Omniscience. Your mind encompasses the universe of decisions.',
    primaryAttribute: 'intelligence',
    tier: 4,
    requiredLevel: 30,
  },
  {
    id: 'legend_endurance',
    nameRu: 'Легенда Выносливости',
    nameEn: 'Legend of Endurance',
    icon: '🌊',
    descriptionRu: 'Неостановимый. Ты превосходишь пределы человеческих возможностей.',
    descriptionEn: 'Unstoppable. You surpass the limits of human capability.',
    primaryAttribute: 'endurance',
    tier: 4,
    requiredLevel: 30,
  },
  {
    id: 'legend_charisma',
    nameRu: 'Легенда Харизмы',
    nameEn: 'Legend of Charisma',
    icon: '💫',
    descriptionRu: 'Твоя аура меняет реальность вокруг тебя.',
    descriptionEn: 'Your aura changes reality around you.',
    primaryAttribute: 'charisma',
    tier: 4,
    requiredLevel: 30,
  },
];

// ==================== Hybrid Classes ====================

export interface HybridClass {
  id: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  attributes: [RPGAttribute, RPGAttribute];
  descriptionRu: string;
  descriptionEn: string;
  requiredLevel: number;
}

export const HYBRID_CLASSES: HybridClass[] = [
  {
    id: 'gladiator',
    nameRu: 'Гладиатор',
    nameEn: 'Gladiator',
    icon: '⚔️',
    attributes: ['strength', 'agility'],
    descriptionRu: 'Мощь и скорость сливаются воедино.',
    descriptionEn: 'Power and speed merge into one.',
    requiredLevel: 10,
  },
  {
    id: 'sage',
    nameRu: 'Мудрец',
    nameEn: 'Sage',
    icon: '📖',
    attributes: ['intelligence', 'endurance'],
    descriptionRu: 'Знания, подкреплённые дисциплиной.',
    descriptionEn: 'Knowledge backed by discipline.',
    requiredLevel: 10,
  },
  {
    id: 'diplomat',
    nameRu: 'Дипломат',
    nameEn: 'Diplomat',
    icon: '🤝',
    attributes: ['intelligence', 'charisma'],
    descriptionRu: 'Слово и ум — твоё оружие.',
    descriptionEn: 'Word and mind are your weapons.',
    requiredLevel: 10,
  },
  {
    id: 'performer',
    nameRu: 'Артист',
    nameEn: 'Performer',
    icon: '🎭',
    attributes: ['agility', 'charisma'],
    descriptionRu: 'Грация и обаяние в каждом движении.',
    descriptionEn: 'Grace and charm in every move.',
    requiredLevel: 10,
  },
  {
    id: 'sentinel',
    nameRu: 'Страж-Воин',
    nameEn: 'Sentinel',
    icon: '🦾',
    attributes: ['strength', 'endurance'],
    descriptionRu: 'Стальная воля и несокрушимое тело.',
    descriptionEn: 'Iron will and unbreakable body.',
    requiredLevel: 10,
  },
  {
    id: 'phoenix',
    nameRu: 'Феникс',
    nameEn: 'Phoenix',
    icon: '🦅',
    attributes: ['endurance', 'charisma'],
    descriptionRu: 'Возрождение через внутренний огонь.',
    descriptionEn: 'Rebirth through inner fire.',
    requiredLevel: 10,
  },
  {
    id: 'ninja',
    nameRu: 'Ниндзя',
    nameEn: 'Ninja',
    icon: '🥷',
    attributes: ['agility', 'endurance'],
    descriptionRu: 'Незаметный, неутомимый, неостановимый.',
    descriptionEn: 'Unnoticed, tireless, unstoppable.',
    requiredLevel: 10,
  },
  {
    id: 'commander',
    nameRu: 'Командир',
    nameEn: 'Commander',
    icon: '🎖️',
    attributes: ['strength', 'charisma'],
    descriptionRu: 'Сила, за которой хочется следовать.',
    descriptionEn: 'Strength worth following.',
    requiredLevel: 10,
  },
  {
    id: 'alchemist',
    nameRu: 'Алхимик',
    nameEn: 'Alchemist',
    icon: '⚗️',
    attributes: ['strength', 'intelligence'],
    descriptionRu: 'Физика и интеллект в идеальном балансе.',
    descriptionEn: 'Physics and intellect in perfect balance.',
    requiredLevel: 10,
  },
  {
    id: 'empath',
    nameRu: 'Эмпат',
    nameEn: 'Empath',
    icon: '💜',
    attributes: ['intelligence', 'agility'],
    descriptionRu: 'Быстрый разум, точное восприятие.',
    descriptionEn: 'Quick mind, precise perception.',
    requiredLevel: 10,
  },
];

// ==================== Class Assignment Logic ====================

const ATTRIBUTE_IDS: RPGAttribute[] = ['strength', 'agility', 'intelligence', 'endurance', 'charisma'];

/** Get class by ID */
export function getClassById(id: string): CharacterClass | undefined {
  return CHARACTER_CLASSES.find(c => c.id === id);
}

/** Get hybrid class by attribute pair */
export function getHybridClass(attrs: [RPGAttribute, RPGAttribute]): HybridClass | undefined {
  return HYBRID_CLASSES.find(h =>
    (h.attributes[0] === attrs[0] && h.attributes[1] === attrs[1]) ||
    (h.attributes[0] === attrs[1] && h.attributes[1] === attrs[0])
  );
}

/**
 * Automatically assign class based on attribute XP distribution.
 *
 * Algorithm:
 * 1. If level < 5 → Novice
 * 2. Find dominant attribute (highest XP)
 * 3. Check if 2nd attribute is within 25% of dominant → Hybrid
 * 4. Otherwise → Pure class based on dominant attribute + tier
 */
export function assignClass(
  attributes: Record<RPGAttribute, number>, // attribute XP values
  characterLevel: number,
): { classId: string; isHybrid: boolean; hybridId?: string } {
  // Novice tier
  if (characterLevel < 5) {
    return { classId: 'novice', isHybrid: false };
  }

  // Sort attributes by XP descending
  const sorted = ATTRIBUTE_IDS
    .map(attr => ({ attr, xp: attributes[attr] }))
    .sort((a, b) => b.xp - a.xp);

  const dominant = sorted[0];
  const secondary = sorted[1];

  // Check for hybrid: secondary is within 25% of dominant
  const isHybridCandidate = dominant.xp > 0 &&
    secondary.xp >= dominant.xp * 0.75 &&
    characterLevel >= 10;

  if (isHybridCandidate) {
    const hybrid = getHybridClass([dominant.attr, secondary.attr]);
    if (hybrid && characterLevel >= hybrid.requiredLevel) {
      return {
        classId: getClassForTier(dominant.attr, characterLevel),
        isHybrid: true,
        hybridId: hybrid.id,
      };
    }
  }

  // Pure class based on dominant attribute
  return {
    classId: getClassForTier(dominant.attr, characterLevel),
    isHybrid: false,
  };
}

/** Get the appropriate class ID for an attribute at a given tier */
function getClassForTier(attribute: RPGAttribute, level: number): string {
  const tierMap: Record<RPGAttribute, { tier1: string; tier2: string; tier3: string; tier4: string }> = {
    strength:     { tier1: 'athlete',     tier2: 'champion',  tier3: 'titan',          tier4: 'legend_strength' },
    agility:      { tier1: 'trailblazer', tier2: 'ranger',    tier3: 'shadow',         tier4: 'legend_agility' },
    intelligence: { tier1: 'strategist',  tier2: 'mastermind',tier3: 'architect',      tier4: 'legend_intelligence' },
    endurance:    { tier1: 'guardian',    tier2: 'balancer',  tier3: 'monolith',       tier4: 'legend_endurance' },
    charisma:     { tier1: 'leader',      tier2: 'visionary', tier3: 'icon',           tier4: 'legend_charisma' },
  };

  const map = tierMap[attribute];
  if (level >= 30) return map.tier4;
  if (level >= 20) return map.tier3;
  if (level >= 10) return map.tier2;
  return map.tier1;
}

/** Get localized class name */
export function getClassName(classId: string, language: 'en' | 'ru'): string {
  const cls = getClassById(classId);
  if (cls) return language === 'ru' ? cls.nameRu : cls.nameEn;

  const hybrid = HYBRID_CLASSES.find(h => h.id === classId);
  if (hybrid) return language === 'ru' ? hybrid.nameRu : hybrid.nameEn;

  return classId;
}

/** Get class icon */
export function getClassIcon(classId: string): string {
  const cls = getClassById(classId);
  if (cls) return cls.icon;
  const hybrid = HYBRID_CLASSES.find(h => h.id === classId);
  if (hybrid) return hybrid.icon;
  return '🌱';
}

/** Get tier name */
export function getTierName(tier: number, language: 'en' | 'ru'): string {
  const tiers = {
    0: { ru: 'Новичок', en: 'Novice' },
    1: { ru: 'Специалист', en: 'Specialist' },
    2: { ru: 'Эксперт', en: 'Expert' },
    3: { ru: 'Мастер', en: 'Master' },
    4: { ru: 'Легенда', en: 'Legend' },
  };
  return tiers[tier as keyof typeof tiers]?.[language] ?? '';
}

/** Get all classes for a specific attribute */
export function getClassesForAttribute(attribute: RPGAttribute): CharacterClass[] {
  return CHARACTER_CLASSES.filter(c => c.primaryAttribute === attribute);
}

/** Get next class evolution for current class */
export function getNextEvolution(classId: string): CharacterClass | null {
  const cls = getClassById(classId);
  if (!cls || !cls.primaryAttribute || cls.tier >= 4) return null;
  return CHARACTER_CLASSES.find(c =>
    c.primaryAttribute === cls.primaryAttribute && c.tier === cls.tier + 1
  ) ?? null;
}
