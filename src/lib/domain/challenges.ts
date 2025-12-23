export type Difficulty = 'easy' | 'medium' | 'hard';

export type DifficultyConfig = {
  gradient: readonly [string, string];
  label: string;
  icon: 'flash-on' | 'local-fire-department' | 'whatshot';
  bgColor: string;
  glow: string;
};

const DIFFICULTY_THRESHOLDS = {
  EASY_MAX: 25,
  MEDIUM_MAX: 35,
} as const;

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gradient: ['#10B981', '#059669'],
    label: 'Easy',
    icon: 'flash-on',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    glow: '#10B98140',
  },
  medium: {
    gradient: ['#F59E0B', '#D97706'],
    label: 'Medium',
    icon: 'local-fire-department',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    glow: '#F59E0B40',
  },
  hard: {
    gradient: ['#EF4444', '#DC2626'],
    label: 'Hard',
    icon: 'whatshot',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    glow: '#EF444440',
  },
};

export function getDifficulty(points: number): Difficulty {
  if (points <= DIFFICULTY_THRESHOLDS.EASY_MAX) return 'easy';
  if (points <= DIFFICULTY_THRESHOLDS.MEDIUM_MAX) return 'medium';
  return 'hard';
}

export function getDifficultyConfig(points: number): DifficultyConfig {
  return DIFFICULTY_CONFIGS[getDifficulty(points)];
}
