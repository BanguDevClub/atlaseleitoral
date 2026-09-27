import { isFlavorId, type FlavorId } from './palette';

const STORAGE_KEY = 'atlas-flavor';

export function preferredFlavor(): FlavorId {
  if (typeof window === 'undefined') return 'mocha';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isFlavorId(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'mocha' : 'latte';
}

export function applyTheme(flavor: FlavorId): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', flavor);
  root.classList.toggle('dark', flavor !== 'latte');
  try {
    window.localStorage.setItem(STORAGE_KEY, flavor);
  } catch {
    /* storage unavailable */
  }
}
