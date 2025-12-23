/**
 * Semantic Tokens - Light and Dark themes
 * These map primitive colors to semantic meanings.
 * Use these in components via the useTheme hook.
 */

import { colors } from './colors';

// Define the theme structure with string types for flexibility
export interface ThemeTokens {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
  };
  brand: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
  };
  semantic: {
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
  };
  input: {
    background: string;
    backgroundDisabled: string;
    border: string;
    borderFocus: string;
    text: string;
    placeholder: string;
    icon: string;
    iconFocus: string;
  };
  button: {
    primaryBackground: string;
    primaryText: string;
    primaryHover: string;
    secondaryBackground: string;
    secondaryText: string;
    secondaryHover: string;
    ghostText: string;
    ghostHover: string;
    disabledBackground: string;
    disabledText: string;
  };
  icon: {
    primary: string;
    secondary: string;
    brand: string;
    inverse: string;
  };
  categories: {
    health: string;
    career: string;
    finance: string;
    relationships: string;
    personal_growth: string;
    fun: string;
    environment: string;
    spirituality: string;
  };
}

const lightTokens: ThemeTokens = {
  // Background colors
  background: {
    primary: colors.slate[50],
    secondary: colors.white,
    tertiary: colors.slate[100],
    inverse: colors.slate[900],
  },

  // Surface colors (cards, modals, etc.)
  surface: {
    primary: colors.white,
    secondary: colors.slate[50],
    elevated: colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: colors.slate[900],
    secondary: colors.slate[600],
    tertiary: colors.slate[400],
    inverse: colors.white,
    link: colors.indigo[500],
  },

  // Brand colors
  brand: {
    primary: colors.indigo[500],
    primaryHover: colors.indigo[600],
    secondary: colors.violet[500],
    secondaryHover: colors.violet[600],
  },

  // Semantic colors
  semantic: {
    success: colors.emerald[500],
    successLight: colors.emerald[50],
    warning: colors.amber[500],
    warningLight: colors.amber[50],
    error: colors.rose[500],
    errorLight: colors.rose[50],
    info: colors.sky[500],
    infoLight: colors.sky[50],
  },

  // Border colors
  border: {
    primary: colors.slate[200],
    secondary: colors.slate[100],
    focus: colors.indigo[500],
    error: colors.rose[500],
  },

  // Input colors
  input: {
    background: colors.white,
    backgroundDisabled: colors.slate[100],
    border: colors.slate[300],
    borderFocus: colors.indigo[500],
    text: colors.slate[900],
    placeholder: colors.slate[400],
    icon: colors.slate[400],
    iconFocus: colors.indigo[500],
  },

  // Button colors
  button: {
    primaryBackground: colors.indigo[600],
    primaryText: colors.white,
    primaryHover: colors.indigo[700],
    secondaryBackground: colors.slate[100],
    secondaryText: colors.slate[700],
    secondaryHover: colors.slate[200],
    ghostText: colors.indigo[600],
    ghostHover: colors.indigo[50],
    disabledBackground: colors.slate[200],
    disabledText: colors.slate[400],
  },

  // Icon colors
  icon: {
    primary: colors.slate[600],
    secondary: colors.slate[400],
    brand: colors.indigo[600],
    inverse: colors.white,
  },

  // Life categories - aligned with Categories.ts
  categories: {
    health: colors.emerald[500], // #10B981
    career: '#3B82F6', // blue-500 (not in our palette)
    finance: colors.amber[500], // #F59E0B
    relationships: '#EC4899', // pink-500 (not in our palette)
    personal_growth: colors.violet[500], // #8B5CF6
    fun: '#F97316', // orange-500 (not in our palette)
    environment: '#14B8A6', // teal-500 (not in our palette)
    spirituality: colors.indigo[500], // #6366F1
  },
};

const darkTokens: ThemeTokens = {
  // Background colors
  background: {
    primary: colors.slate[950],
    secondary: colors.slate[900],
    tertiary: colors.slate[800],
    inverse: colors.white,
  },

  // Surface colors
  surface: {
    primary: colors.slate[900],
    secondary: colors.slate[800],
    elevated: colors.slate[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Text colors
  text: {
    primary: colors.white,
    secondary: colors.slate[300],
    tertiary: colors.slate[500],
    inverse: colors.slate[900],
    link: colors.indigo[400],
  },

  // Brand colors
  brand: {
    primary: colors.indigo[400],
    primaryHover: colors.indigo[300],
    secondary: colors.violet[400],
    secondaryHover: colors.violet[300],
  },

  // Semantic colors
  semantic: {
    success: colors.emerald[400],
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: colors.amber[400],
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: colors.rose[400],
    errorLight: 'rgba(244, 63, 94, 0.15)',
    info: colors.sky[400],
    infoLight: 'rgba(14, 165, 233, 0.15)',
  },

  // Border colors
  border: {
    primary: colors.slate[700],
    secondary: colors.slate[800],
    focus: colors.indigo[500],
    error: colors.rose[500],
  },

  // Input colors
  input: {
    background: colors.slate[800],
    backgroundDisabled: colors.slate[700],
    border: colors.slate[600],
    borderFocus: colors.indigo[500],
    text: colors.white,
    placeholder: colors.slate[500],
    icon: colors.slate[500],
    iconFocus: colors.indigo[400],
  },

  // Button colors
  button: {
    primaryBackground: colors.indigo[600],
    primaryText: colors.white,
    primaryHover: colors.indigo[500],
    secondaryBackground: colors.slate[700],
    secondaryText: colors.slate[200],
    secondaryHover: colors.slate[600],
    ghostText: colors.indigo[400],
    ghostHover: 'rgba(99, 102, 241, 0.15)',
    disabledBackground: colors.slate[700],
    disabledText: colors.slate[500],
  },

  // Icon colors
  icon: {
    primary: colors.slate[300],
    secondary: colors.slate[500],
    brand: colors.indigo[400],
    inverse: colors.slate[900],
  },

  // Life categories - aligned with Categories.ts (lighter for dark mode)
  categories: {
    health: colors.emerald[400], // #34D399
    career: '#60A5FA', // blue-400
    finance: colors.amber[400], // #FBBF24
    relationships: '#F472B6', // pink-400
    personal_growth: colors.violet[400], // #A78BFA
    fun: '#FB923C', // orange-400
    environment: '#2DD4BF', // teal-400
    spirituality: colors.indigo[400], // #818CF8
  },
};

export const tokens: { light: ThemeTokens; dark: ThemeTokens } = {
  light: lightTokens,
  dark: darkTokens,
};

export type ThemeMode = 'light' | 'dark';
