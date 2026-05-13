// ─── Vynta Design Tokens ────────────────────────────────────────────────────

const light = {
  // Backgrounds
  canvas:    '#F4F2EC',   // cream app background
  white:     '#FFFFFF',
  cardBg:    '#F0EEE7',   // subtle card / chip bg
  inputBg:   '#FFFFFF',

  // Text
  ink:       '#0E1614',   // primary text
  muted:     '#6B7280',   // secondary text

  // Brand
  accent:    '#0E5C3F',   // forest green

  // Borders
  border:    '#E5E3DC',

  // Semantic
  error:     '#DC2626',
  danger:    '#DC2626',
  red:       '#DC2626',
  amber:     '#D97706',
  amberBg:   '#FEF3C7',
  amberText: '#92400E',
  success:   '#22C55E',
  green:     '#22C55E',
} as const;

const dark = {
  // Backgrounds
  canvas:    '#111916',   // deep dark green
  white:     '#192C21',   // "white" = dark card bg
  cardBg:    '#152318',   // slightly darker card bg
  inputBg:   '#192C21',

  // Text
  ink:       '#EBF0EB',   // warm off-white
  muted:     '#7A9080',   // muted green-gray

  // Brand
  accent:    '#2DB573',   // brighter green (visible on dark bg)

  // Borders
  border:    '#1E3328',   // subtle dark border

  // Semantic
  error:     '#F87171',
  danger:    '#F87171',
  red:       '#F87171',
  amber:     '#F59E0B',
  amberBg:   'rgba(245,158,11,0.15)',
  amberText: '#FCD34D',
  success:   '#4ADE80',
  green:     '#4ADE80',
} as const;

export type ThemeColors = typeof light;
export const lightColors = light;
export const darkColors  = dark;

export const Radius = {
  xs:   6,
  sm:   8,
  md:   10,
  lg:   12,
  xl:   14,
  xxl:  16,
  card: 16,
  full: 9999,
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
} as const;

export const FontSize = {
  label:    11,
  xs:       12,
  sm:       13,
  base:     14,
  md:       15,
  lg:       16,
  xl:       18,
  '2xl':    20,
  '3xl':    24,
  '4xl':    30,
  '5xl':    36,
  headline: 44,
} as const;

// Static alias (for files that don't need dynamic theming, e.g. ReceiptCard)
export const Colors = light;
