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

// Minimal mist grey + deep green-blue + lila palette
export const Theme = {
  colors: {
    // Mist grey base
    background: '#0F0F11',           // Deep charcoal
    backgroundSecondary: '#1A1A1D',  // Elevated mist
    surface: '#202024',              // Card backgrounds
    surfaceElevated: '#2A2A2F',      // Hover/pressed states

    // Primary: Deep teal/green-blue
    primary: '#2A5F6F',              // Deep teal
    primaryLight: '#3A7A8A',         // Lighter ocean blue
    primaryDark: '#1B4552',          // Darker deep sea
    primaryMuted: 'rgba(42, 95, 111, 0.15)', // Subtle backgrounds

    // Secondary: Soft lila/purple
    secondary: '#7A6B8F',            // Soft lila
    secondaryLight: '#9B8AAD',       // Lighter lavender
    secondaryDark: '#5A4A6F',        // Darker plum
    secondaryMuted: 'rgba(122, 107, 143, 0.15)', // Subtle backgrounds

    // Text hierarchy (mist grey tones)
    textPrimary: '#F0F0F2',          // Soft white with grey tint
    textSecondary: '#9A9AA5',        // Mist grey
    textTertiary: '#6A6A75',         // Dark mist

    // Borders and dividers (minimal)
    border: '#2F2F35',               // Subtle mist borders
    borderLight: '#3F3F45',          // Lighter mist borders

    // Semantic colors
    success: '#3A7A8A',              // Uses primary teal
    warning: '#B89B5C',              // Muted gold
    error: '#B85C5C',                // Muted red

    // Accents
    accent: '#D5C5E8',               // Pale lila for highlights
    accentTeal: '#A8CDD5',           // Pale teal for success states
  },
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
};
