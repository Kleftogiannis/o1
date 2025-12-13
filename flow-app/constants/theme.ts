export const Colors = {
  light: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    primary: '#007AFF',
    secondary: '#5856D6',
    text: '#1C1C1E',
    textSecondary: '#6E6E73',
    textTertiary: '#8E8E93',
    border: '#D1D1D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// Dark emerald/pine green + deep plum minimal theme
export const Theme = {
  colors: {
    // Dark theme base
    background: '#0A0A0A',           // Pure black with slight warmth
    backgroundSecondary: '#1A1A1A',  // Elevated surface
    surface: '#1F1F1F',              // Card backgrounds
    surfaceElevated: '#2A2A2A',      // Hover/pressed states

    // Primary: Dark emerald/pine green
    primary: '#2D5F4F',              // Deep pine green
    primaryLight: '#3A7563',         // Lighter emerald
    primaryDark: '#1E4237',          // Darker forest green
    primaryMuted: 'rgba(45, 95, 79, 0.15)', // Subtle backgrounds

    // Secondary: Deep plum/lilac
    secondary: '#6B4E71',            // Deep plum
    secondaryLight: '#8B6B8F',       // Lighter lilac
    secondaryDark: '#4A3450',        // Darker plum
    secondaryMuted: 'rgba(107, 78, 113, 0.15)', // Subtle backgrounds

    // Text hierarchy
    textPrimary: '#F5F5F5',          // Near white
    textSecondary: '#A0A0A0',        // Medium gray
    textTertiary: '#6B6B6B',         // Dim gray

    // Borders and dividers
    border: '#2F2F2F',               // Subtle borders
    borderLight: '#3F3F3F',          // Lighter borders

    // Semantic colors
    success: '#3A7563',              // Uses primary green
    warning: '#C89B3C',              // Muted gold
    error: '#C94F4F',                // Muted red

    // Accents
    accent: '#E8D5E8',               // Pale lilac for highlights
    accentGreen: '#A8D5BA',          // Pale mint for success states
  },
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
};
