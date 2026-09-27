export type FlavorId = 'latte' | 'frappe' | 'macchiato' | 'mocha';

export interface Flavor {
  id: FlavorId;
  label: string;
  mode: 'light' | 'dark';
  /** base, mantle, primary accent — used by the theme switcher swatches */
  swatch: [string, string, string];
}

export const FLAVORS: Flavor[] = [
  { id: 'latte', label: 'Latte', mode: 'light', swatch: ['#eff1f5', '#e6e9ef', '#8839ef'] },
  { id: 'frappe', label: 'Frappé', mode: 'dark', swatch: ['#303446', '#292c3c', '#ca9ee6'] },
  { id: 'macchiato', label: 'Macchiato', mode: 'dark', swatch: ['#24273a', '#1e2030', '#c6a0f6'] },
  { id: 'mocha', label: 'Mocha', mode: 'dark', swatch: ['#1e1e2e', '#181825', '#cba6f7'] },
];

export function isFlavorId(value: string | null | undefined): value is FlavorId {
  return value === 'latte' || value === 'frappe' || value === 'macchiato' || value === 'mocha';
}

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
