/**
 * Spacing - Consistent spacing scale
 * Based on 4px base unit for consistency.
 */

// Base unit
const BASE = 4;

export const spacing = {
  0: 0,
  0.5: BASE * 0.5, // 2
  1: BASE, // 4
  1.5: BASE * 1.5, // 6
  2: BASE * 2, // 8
  2.5: BASE * 2.5, // 10
  3: BASE * 3, // 12
  3.5: BASE * 3.5, // 14
  4: BASE * 4, // 16
  5: BASE * 5, // 20
  6: BASE * 6, // 24
  7: BASE * 7, // 28
  8: BASE * 8, // 32
  9: BASE * 9, // 36
  10: BASE * 10, // 40
  11: BASE * 11, // 44
  12: BASE * 12, // 48
  14: BASE * 14, // 56
  16: BASE * 16, // 64
  20: BASE * 20, // 80
  24: BASE * 24, // 96
  28: BASE * 28, // 112
  32: BASE * 32, // 128
  36: BASE * 36, // 144
  40: BASE * 40, // 160
} as const;

// Border radius
export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Common layout values
export const layout = {
  screenPadding: spacing[5], // 20
  cardPadding: spacing[4], // 16
  inputHeight: spacing[12], // 48
  buttonHeight: spacing[12], // 48
  buttonHeightSmall: spacing[10], // 40
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
