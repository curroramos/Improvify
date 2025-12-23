/**
 * Theme Context - Provides theme tokens throughout the app
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, ThemeTokens, ThemeMode } from './tokens';
import { useAppearanceStore, AppearanceMode } from '@/lib/store/useAppearanceStore';
import { usePersonalityThemeStore } from '@/lib/store/usePersonalityThemeStore';
import { getThemeColors, type ThemeId } from '@/config/themes';

interface ThemeContextValue {
  theme: ThemeTokens;
  mode: ThemeMode;
  isDark: boolean;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  personalityThemeId: ThemeId;
  setPersonalityThemeId: (themeId: ThemeId) => void;
  gradients: {
    primary: [string, string];
    primaryExtended: [string, string, string];
    secondary: [string, string];
    danger: [string, string];
    warning: [string, string];
    success: [string, string];
  };
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  forcedMode?: ThemeMode;
}

export function ThemeProvider({ children, forcedMode }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  // Use selectors for proper reactivity
  const appearanceMode = useAppearanceStore((state) => state.mode);
  const setAppearanceMode = useAppearanceStore((state) => state.setMode);
  const personalityThemeId = usePersonalityThemeStore((state) => state.themeId);
  const setPersonalityThemeId = usePersonalityThemeStore((state) => state.setThemeId);

  // Compute theme based on appearance and personality settings
  let resolvedMode: ThemeMode;

  if (forcedMode) {
    resolvedMode = forcedMode;
  } else if (appearanceMode === 'system') {
    resolvedMode = systemColorScheme === 'dark' ? 'dark' : 'light';
  } else {
    resolvedMode = appearanceMode;
  }

  // Get base tokens for light/dark mode
  const baseTokens = tokens[resolvedMode];

  // Get personality theme colors
  const personalityColors = getThemeColors(personalityThemeId);

  // Merge personality colors into brand tokens
  const theme: ThemeTokens = useMemo(
    () => ({
      ...baseTokens,
      brand: {
        primary: personalityColors.primary,
        primaryHover: personalityColors.primaryDark,
        secondary: personalityColors.secondary,
        secondaryHover: personalityColors.primaryLight,
      },
      text: {
        ...baseTokens.text,
        link: personalityColors.primary,
      },
      border: {
        ...baseTokens.border,
        focus: personalityColors.primary,
      },
      input: {
        ...baseTokens.input,
        borderFocus: personalityColors.primary,
        iconFocus: personalityColors.primary,
      },
      button: {
        ...baseTokens.button,
        primaryBackground: personalityColors.primary,
        primaryHover: personalityColors.primaryDark,
        ghostText: personalityColors.primary,
        ghostHover: `${personalityColors.primary}15`,
      },
      icon: {
        ...baseTokens.icon,
        brand: personalityColors.primary,
      },
    }),
    [baseTokens, personalityColors]
  );

  const gradients = useMemo(
    () => ({
      primary: personalityColors.gradient,
      primaryExtended: [...personalityColors.gradient, personalityColors.secondary] as [string, string, string],
      secondary: [personalityColors.primaryLight, personalityColors.secondary] as [string, string],
      danger: ['#EF4444', '#DC2626'] as [string, string],
      warning: ['#F59E0B', '#D97706'] as [string, string],
      success: ['#10B981', '#059669'] as [string, string],
    }),
    [personalityColors]
  );

  const value: ThemeContextValue = {
    theme,
    mode: resolvedMode,
    isDark: resolvedMode === 'dark',
    appearanceMode,
    setAppearanceMode,
    personalityThemeId,
    setPersonalityThemeId,
    gradients,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    // Return light theme as default if not wrapped in provider
    const defaultColors = getThemeColors('default');
    return {
      theme: tokens.light,
      mode: 'light',
      isDark: false,
      appearanceMode: 'system',
      setAppearanceMode: () => {},
      personalityThemeId: 'default',
      setPersonalityThemeId: () => {},
      gradients: {
        primary: defaultColors.gradient,
        primaryExtended: [...defaultColors.gradient, defaultColors.secondary] as [string, string, string],
        secondary: [defaultColors.primaryLight, defaultColors.secondary] as [string, string],
        danger: ['#EF4444', '#DC2626'] as [string, string],
        warning: ['#F59E0B', '#D97706'] as [string, string],
        success: ['#10B981', '#059669'] as [string, string],
      },
    };
  }

  return context;
}
