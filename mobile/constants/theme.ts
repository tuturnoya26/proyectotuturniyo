// Theme colors — dark base with TU TURNO YA accent
export const Colors = {
  // Backgrounds
  bg: '#0A0A0A',
  bgCard: '#1A1A1A',
  bgElevated: '#222222',
  bgInput: '#161616',

  // Accent
  yellow: '#029FAD',
  yellowDark: '#027F8A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  textTertiary: '#6B6B6B',

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#60A5FA',

  // Borders
  border: '#2A2A2A',
  borderLight: '#333333',

  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
