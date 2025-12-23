/**
 * Theme Configuration System
 *
 * This module defines the extensible theme system for Improvify.
 * To add a new theme:
 * 1. Add theme ID to ThemeId type
 * 2. Create theme config in THEME_CONFIGS
 * 3. Add quotes in src/constants/quotes.ts
 */

export type ThemeId = 'default' | 'christian' | 'stoic' | 'minimalist';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  gradient: [string, string];
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  icon: string; // MaterialIcons name
  colors: ThemeColors;
  // AI prompt modifier for challenge generation
  promptModifier: string;
  // Whether this theme is available (for future premium themes)
  available: boolean;
}

// Default colors used across the app - aligned with src/theme/colors.ts
export const DEFAULT_COLORS: ThemeColors = {
  primary: '#6366F1', // colors.indigo[500]
  primaryLight: '#818CF8', // colors.indigo[400]
  primaryDark: '#4F46E5', // colors.indigo[600]
  secondary: '#8B5CF6', // colors.violet[500]
  accent: '#10B981', // colors.emerald[500]
  gradient: ['#6366F1', '#8B5CF6'],
};

// Theme configurations
export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Classic',
    description: 'The original Improvify experience',
    icon: 'auto-awesome',
    colors: DEFAULT_COLORS,
    promptModifier: '',
    available: true,
  },

  christian: {
    id: 'christian',
    name: 'Faith',
    description: 'Scripture-based inspiration and spiritual growth',
    icon: 'menu-book',
    colors: {
      primary: '#7C3AED',
      primaryLight: '#A78BFA',
      primaryDark: '#5B21B6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      gradient: ['#7C3AED', '#A78BFA'],
    },
    promptModifier: `
FAITH-BASED CONTEXT:
- Frame challenges with a faith-based perspective when appropriate
- Include references to prayer, Scripture reading, or spiritual disciplines where relevant
- Emphasize serving others, gratitude, and glorifying God
- Suggest challenges that align with Christian values (love, patience, kindness, humility)
- For spirituality category, focus on Christian spiritual practices (prayer, Bible study, worship, fellowship)
- Use encouraging, faith-affirming language`,
    available: true,
  },

  stoic: {
    id: 'stoic',
    name: 'Stoic',
    description: 'Ancient wisdom for modern challenges',
    icon: 'account-balance',
    colors: {
      primary: '#374151',
      primaryLight: '#6B7280',
      primaryDark: '#1F2937',
      secondary: '#4B5563',
      accent: '#D97706',
      gradient: ['#374151', '#1F2937'],
    },
    promptModifier: `
STOIC PHILOSOPHY CONTEXT:
- Frame challenges through the lens of Stoic philosophy
- Emphasize what is within one's control vs what is not
- Include practices like journaling, negative visualization, or voluntary discomfort
- Focus on virtue (wisdom, courage, justice, temperance)
- Encourage reflection on mortality (memento mori) and impermanence
- Use calm, rational, and practical language`,
    available: true,
  },

  minimalist: {
    id: 'minimalist',
    name: 'Minimal',
    description: 'Focus on what truly matters',
    icon: 'filter-none',
    colors: {
      primary: '#0F172A',
      primaryLight: '#334155',
      primaryDark: '#020617',
      secondary: '#475569',
      accent: '#06B6D4',
      gradient: ['#0F172A', '#1E293B'],
    },
    promptModifier: `
MINIMALIST CONTEXT:
- Keep challenges simple and focused on essentials
- Emphasize quality over quantity
- Include practices around decluttering (physical, digital, mental)
- Focus on intentionality and mindful consumption
- Encourage elimination of unnecessary commitments
- Use concise, clear language`,
    available: true,
  },
};

// Helper functions
export function getThemeConfig(themeId: ThemeId): ThemeConfig {
  return THEME_CONFIGS[themeId] || THEME_CONFIGS.default;
}

export function getThemeColors(themeId: ThemeId): ThemeColors {
  return getThemeConfig(themeId).colors;
}

export function getAvailableThemes(): ThemeConfig[] {
  return Object.values(THEME_CONFIGS).filter((theme) => theme.available);
}

export function isValidThemeId(id: string): id is ThemeId {
  return id in THEME_CONFIGS;
}
