export type StandardThemeId = 'light' | 'dark';
export type CatppuccinFlavorId = 'latte' | 'frappe' | 'macchiato' | 'mocha';
export type ThemeId = StandardThemeId | CatppuccinFlavorId;
export type FlavorId = ThemeId; // alias for backwards compatibility

export interface ThemeOption {
  id: ThemeId;
  label: string;
  category: 'standard' | 'catppuccin';
  mode: 'light' | 'dark';
  /** base, mantle, primary accent — used by the theme switcher swatches */
  swatch: [string, string, string];
}

export type Flavor = ThemeOption;

export const THEMES: ThemeOption[] = [
  // Standard clean neutral themes
  { id: 'light', label: 'Claro (Padrão)', category: 'standard', mode: 'light', swatch: ['#ffffff', '#f8fafc', '#6366f1'] },
  { id: 'dark', label: 'Escuro (Padrão)', category: 'standard', mode: 'dark', swatch: ['#0f172a', '#090d16', '#818cf8'] },

  // Catppuccin flavors
  { id: 'latte', label: 'Catppuccin Latte', category: 'catppuccin', mode: 'light', swatch: ['#eff1f5', '#e6e9ef', '#8839ef'] },
  { id: 'mocha', label: 'Catppuccin Mocha', category: 'catppuccin', mode: 'dark', swatch: ['#1e1e2e', '#181825', '#cba6f7'] },
  { id: 'macchiato', label: 'Catppuccin Macchiato', category: 'catppuccin', mode: 'dark', swatch: ['#24273a', '#1e2030', '#c6a0f6'] },
  { id: 'frappe', label: 'Catppuccin Frappé', category: 'catppuccin', mode: 'dark', swatch: ['#303446', '#292c3c', '#ca9ee6'] },
];

export const FLAVORS: ThemeOption[] = THEMES;

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return (
    value === 'light' ||
    value === 'dark' ||
    value === 'latte' ||
    value === 'frappe' ||
    value === 'macchiato' ||
    value === 'mocha'
  );
}

export const isFlavorId = isThemeId;

/**
 * Candidate identity color derived from the economic axis:
 * −10 → catppuccin red (esquerda), 0 → mauve (centro), +10 → blue (direita).
 * Resolved through CSS vars so it follows the active flavor automatically.
 */
export function candidateColor(economic: number): string {
  const x = Math.max(-10, Math.min(10, economic));
  if (x < 0) {
    const t = ((x + 10) / 10) * 100;
    return `color-mix(in oklch, var(--ctp-red), var(--ctp-mauve) ${t.toFixed(1)}%)`;
  }
  const t = (x / 10) * 100;
  return `color-mix(in oklch, var(--ctp-mauve), var(--ctp-blue) ${t.toFixed(1)}%)`;
}

export interface Quadrant {
  key: string;
  label: string;
  blurb: string;
}

export const QUADRANTS: Quadrant[] = [
  {
    key: 'auth-left',
    label: 'Autoritário · Esquerda',
    blurb: 'Estatista e conservador/ordenador',
  },
  {
    key: 'auth-right',
    label: 'Autoritário · Direita',
    blurb: 'Mercado e ordem/autoridade',
  },
  {
    key: 'lib-left',
    label: 'Libertário · Esquerda',
    blurb: 'Estatista e progressista',
  },
  {
    key: 'lib-right',
    label: 'Libertário · Direita',
    blurb: 'Mercado e liberdades individuais',
  },
];

/** Quadrant label for a compass pair (social up = progressista). */
export function quadrantOf(social: number, economic: number): Quadrant {
  const auth = social < 0;
  const left = economic < 0;
  if (auth && left) return QUADRANTS[0];
  if (auth && !left) return QUADRANTS[1];
  if (!auth && left) return QUADRANTS[2];
  return QUADRANTS[3];
}
