export type LevelInfo = {
  level: number;
  threshold: number;
  title: string;
};

// Base titles for levels 1-9
const BASE_TITLES: readonly string[] = [
  'Beginner',
  'Explorer',
  'Learner',
  'Achiever',
  'Master',
  'Expert',
  'Champion',
  'Legend',
  'Grandmaster',
] as const;

// Prestige titles for levels 10+ (cycles every 10 levels with tier number)
const PRESTIGE_TITLES: readonly string[] = [
  'Ascendant',
  'Transcendent',
  'Mythic',
  'Immortal',
  'Divine',
  'Celestial',
  'Eternal',
  'Infinite',
  'Apex',
  'Ultimate',
] as const;

/**
 * Calculate the XP threshold for a given level.
 * Formula: threshold = 50 * level * (level - 1)
 * This creates a smooth progression where each level requires
 * 100 more points than the previous level increase.
 */
export function getThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * level * (level - 1);
}

/**
 * Calculate the level for a given number of points.
 * Inverse of the threshold formula.
 */
export function getLevelForPoints(points: number): number {
  if (points <= 0) return 1;
  // Solving: points = 50 * level * (level - 1)
  // level = (1 + sqrt(1 + points/12.5)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + points / 12.5)) / 2);
  return Math.max(1, level);
}

/**
 * Get the title for a given level.
 * Levels 1-9 use base titles.
 * Levels 10+ use prestige titles with tier numbers.
 */
export function getLevelTitle(level: number): string {
  if (level <= 9) {
    return BASE_TITLES[level - 1] ?? BASE_TITLES[0];
  }

  // For levels 10+, calculate prestige tier
  const prestigeLevel = level - 9; // 10 becomes 1, 20 becomes 11, etc.
  const tier = Math.floor((prestigeLevel - 1) / 10) + 1; // Tier 1, 2, 3...
  const titleIndex = (prestigeLevel - 1) % 10;
  const title = PRESTIGE_TITLES[titleIndex];

  return tier > 1 ? `${title} ${toRoman(tier)}` : title;
}

/**
 * Convert a number to Roman numerals (for prestige tier display)
 */
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export function getLevelInfo(level: number): LevelInfo {
  return {
    level,
    threshold: getThresholdForLevel(level),
    title: getLevelTitle(level),
  };
}

export function getNextLevelThreshold(level: number): number {
  return getThresholdForLevel(level + 1);
}

export type LevelProgressData = {
  level: number;
  title: string;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
  pointsToNext: number;
};

export function getLevelProgressData(points: number): LevelProgressData {
  const level = getLevelForPoints(points);
  const currentThreshold = getThresholdForLevel(level);
  const nextThreshold = getNextLevelThreshold(level);

  const currentLevelPoints = points - currentThreshold;
  const nextLevelPoints = nextThreshold - currentThreshold;
  const progress = Math.min((currentLevelPoints / nextLevelPoints) * 100, 100);

  return {
    level,
    title: getLevelTitle(level),
    currentLevelPoints,
    nextLevelPoints,
    progress,
    pointsToNext: nextThreshold - points,
  };
}
