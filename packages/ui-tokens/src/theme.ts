import { colors } from './colors';
import { typography } from './typography';
import { spacing, radii, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  light: {
    background: colors.white,
    surface: colors.neutral[50],
    card: colors.white,
    border: colors.neutral[200],
    text: colors.neutral[900],
    textMuted: colors.neutral[500],
    primary: colors.primary[600],
    accent: colors.violet[600],
  },
  dark: {
    background: colors.navy[950],
    surface: colors.navy[900],
    card: '#131B2E',
    border: colors.neutral[800],
    text: colors.neutral[50],
    textMuted: colors.neutral[400],
    primary: colors.primary[500],
    accent: colors.violet[500],
  },
} as const;

export type Theme = typeof theme;

