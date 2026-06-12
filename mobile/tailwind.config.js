/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 — content paths for all screen and component files
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand colors (raw swatches) ──────────────────────────────────
        // These map to DESIGN.md §2.1 brand colors.
        // Use semantic tokens (design/tokens.ts + useTheme) in components;
        // use these only for Tailwind utility classes.
        'brand-navy':      '#0F0F1A',
        'electric-violet': '#6C63FF',
        'coral-pink':      '#FF6584',
        'mint-green':      '#00C896',
        'amber':           '#FFB84C',
        'cool-gray':       '#8B8FA8',

        // ── Light mode semantic tokens ───────────────────────────────────
        'bg-primary':      '#F7F7FC',
        'bg-card':         '#FFFFFF',
        'bg-subtle':       '#EDEDF8',
        'text-primary':    '#0F0F1A',
        'text-secondary':  '#4B5563',
        'text-placeholder':'#8B8FA8',
        'border-default':  '#E4E4F0',
        'interactive':     '#6C63FF',

        // ── Dark mode semantic tokens ────────────────────────────────────
        'dark-bg-primary':     '#0F0F1A',
        'dark-bg-card':        '#1C1C2E',
        'dark-bg-subtle':      '#252538',
        'dark-text-primary':   '#F0F0FF',
        'dark-text-secondary': '#9CA3AF',
        'dark-border-default': '#2E2E4A',
        'dark-interactive':    '#7C74FF',
      },
      borderRadius: {
        // Design token radii from DESIGN.md §4.3
        'card':         '16px',
        'button':       '12px',
        'input':        '10px',
        'icon':         '8px',
        'bottom-sheet': '24px',
      },
      fontFamily: {
        // Plus Jakarta Sans loaded via expo-google-fonts — DESIGN.md §3.1
        'jakarta':          ['PlusJakartaSans_400Regular'],
        'jakarta-medium':   ['PlusJakartaSans_500Medium'],
        'jakarta-semibold': ['PlusJakartaSans_600SemiBold'],
        'jakarta-bold':     ['PlusJakartaSans_700Bold'],
        'jakarta-extrabold':['PlusJakartaSans_800ExtraBold'],
      },
      spacing: {
        // Base-4 spacing scale from DESIGN.md §4.1
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '20px',
        '6':  '24px',
        '8':  '32px',
        '10': '40px',
      },
    },
  },
  plugins: [],
};
