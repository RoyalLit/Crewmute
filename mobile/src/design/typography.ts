/**
 * Typography scale constants.
 *
 * Each entry maps to a named style from DESIGN.md §3.2.
 * Components use these constants — never raw pixel values.
 *
 * Font family references Plus Jakarta Sans (loaded in app/_layout.tsx).
 * Per DESIGN.md §3.3: never use more than 3 type sizes on a single screen.
 */

export interface TypeStyle {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  lineHeight: number;
  letterSpacing?: number;
  fontFamily: string;
}

// Font family name constants — must match expo-google-fonts loaded names
export const fontFamilies = {
  regular:   'PlusJakartaSans_400Regular',
  medium:    'PlusJakartaSans_500Medium',
  semiBold:  'PlusJakartaSans_600SemiBold',
  bold:      'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

// ── Type Scale ────────────────────────────────────────────────────────────────
// Source: DESIGN.md §3.2
export const typography = {
  // 32px / 800 — Splash screen, onboarding hero
  display: {
    fontSize:     32,
    fontWeight:   '800' as const,
    lineHeight:   40,
    letterSpacing:-0.3, // DESIGN.md §3.3: tighter, premium feel on Display and H1
    fontFamily:   fontFamilies.extraBold,
  },
  // 24px / 700 — Screen titles, section headers (one per screen, DESIGN.md §3.3)
  h1: {
    fontSize:     24,
    fontWeight:   '700' as const,
    lineHeight:   32,
    letterSpacing:-0.3,
    fontFamily:   fontFamilies.bold,
  },
  // 20px / 700 — Card titles, modal headers
  h2: {
    fontSize:     20,
    fontWeight:   '700' as const,
    lineHeight:   28,
    fontFamily:   fontFamilies.bold,
  },
  // 17px / 600 — Subheadings, group labels
  h3: {
    fontSize:     17,
    fontWeight:   '600' as const,
    lineHeight:   24,
    fontFamily:   fontFamilies.semiBold,
  },
  // 16px / 400 — Primary body text, ride descriptions
  bodyLarge: {
    fontSize:  16,
    fontWeight:'400' as const,
    lineHeight: 24,
    fontFamily: fontFamilies.regular,
  },
  // 14px / 400 — Secondary body, card metadata
  body: {
    fontSize:   14,
    fontWeight: '400' as const,
    lineHeight:  22,
    fontFamily:  fontFamilies.regular,
  },
  // 13px / 400 — Captions, timestamps, helper text
  bodySmall: {
    fontSize:   13,
    fontWeight: '400' as const,
    lineHeight:  20,
    fontFamily:  fontFamilies.regular,
  },
  // 12px / 600 — Tags, badges, status chips
  label: {
    fontSize:   12,
    fontWeight: '600' as const,
    lineHeight:  16,
    fontFamily:  fontFamilies.semiBold,
  },
  // 15px / 700 — All button labels, CTAs (DESIGN.md §3.3: never Regular on interactive)
  button: {
    fontSize:   15,
    fontWeight: '700' as const,
    lineHeight:  20,
    fontFamily:  fontFamilies.bold,
  },
  // 11px / 600 — Bottom tab bar labels
  tabLabel: {
    fontSize:   11,
    fontWeight: '600' as const,
    lineHeight:  14,
    fontFamily:  fontFamilies.semiBold,
  },
} as const satisfies Record<string, TypeStyle>;
