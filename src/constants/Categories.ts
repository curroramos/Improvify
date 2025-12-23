import { LifeCategory } from '@/types';

export interface CategoryConfig {
  id: LifeCategory;
  label: string;
  shortLabel: string;
  icon: string; // MaterialIcons name
  color: string;
  gradient: [string, string];
  description: string;
}

export const CATEGORY_CONFIG: Record<LifeCategory, CategoryConfig> = {
  health: {
    id: 'health',
    label: 'Health',
    shortLabel: 'Health',
    icon: 'favorite',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    description: 'Physical fitness, nutrition, sleep, and mental wellness',
  },
  career: {
    id: 'career',
    label: 'Career',
    shortLabel: 'Career',
    icon: 'work',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
    description: 'Professional growth, skills, and work achievements',
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    shortLabel: 'Finance',
    icon: 'account-balance-wallet',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    description: 'Money management, savings, and financial goals',
  },
  relationships: {
    id: 'relationships',
    label: 'Relationships',
    shortLabel: 'Social',
    icon: 'people',
    color: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
    description: 'Family, friends, and romantic relationships',
  },
  personal_growth: {
    id: 'personal_growth',
    label: 'Personal Growth',
    shortLabel: 'Growth',
    icon: 'trending-up',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    description: 'Learning, self-improvement, and personal development',
  },
  fun: {
    id: 'fun',
    label: 'Fun & Recreation',
    shortLabel: 'Fun',
    icon: 'celebration',
    color: '#F97316',
    gradient: ['#F97316', '#EA580C'],
    description: 'Hobbies, entertainment, and leisure activities',
  },
  environment: {
    id: 'environment',
    label: 'Environment',
    shortLabel: 'Home',
    icon: 'home',
    color: '#14B8A6',
    gradient: ['#14B8A6', '#0D9488'],
    description: 'Living space, organization, and surroundings',
  },
  spirituality: {
    id: 'spirituality',
    label: 'Spirituality',
    shortLabel: 'Spirit',
    icon: 'self-improvement',
    color: '#6366F1',
    gradient: ['#6366F1', '#4F46E5'],
    description: 'Mindfulness, purpose, and inner peace',
  },
};

// Get category config by ID
export function getCategoryConfig(category: LifeCategory): CategoryConfig {
  return CATEGORY_CONFIG[category];
}

// Get all categories as array
export function getAllCategories(): CategoryConfig[] {
  return Object.values(CATEGORY_CONFIG);
}

// Category order for radar chart (clockwise from top)
export const CATEGORY_ORDER: LifeCategory[] = [
  'health',
  'career',
  'finance',
  'relationships',
  'fun',
  'environment',
  'spirituality',
  'personal_growth',
];

// Get category by index (for radar chart)
export function getCategoryByIndex(index: number): CategoryConfig {
  return CATEGORY_CONFIG[CATEGORY_ORDER[index]];
}
