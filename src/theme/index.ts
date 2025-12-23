/**
 * Theme - Main export file
 * Import everything from here for consistency.
 */

export { colors, gradients } from './colors';
export type { ColorPalette, GradientPreset } from './colors';

export { tokens } from './tokens';
export type { ThemeTokens, ThemeMode } from './tokens';

export {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
} from './typography';
export type { TextStyle } from './typography';

export { spacing, radius, shadows, layout } from './spacing';
export type { Spacing, Radius, Shadow } from './spacing';

// Re-export useTheme hook
export { useTheme, ThemeProvider } from './ThemeContext';
