import { isFlavorId, type FlavorId } from './palette';

const STORAGE_KEY = 'atlas-flavor';
const MODE_STORAGE_KEY = 'atlas-theme-mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* storage unavailable */
  }
  return 'system';
}

export function preferredFlavor(): FlavorId {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isFlavorId(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  return getSystemPreference() === 'dark' ? 'dark' : 'light';
}

export function getCurrentFlavor(): FlavorId {
  if (typeof window === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (isFlavorId(attr)) return attr;
  return preferredFlavor();
}

export function isDarkMode(flavor?: FlavorId): boolean {
  const f = flavor || getCurrentFlavor();
  return f !== 'light' && f !== 'latte';
}

export function applyTheme(flavor: FlavorId, animate = true): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const dark = isDarkMode(flavor);

  if (animate) {
    root.classList.add('theme-transitioning');
  }

  root.setAttribute('data-theme', flavor);
  root.classList.toggle('dark', dark);

  try {
    window.localStorage.setItem(STORAGE_KEY, flavor);
    window.localStorage.setItem(MODE_STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    /* storage unavailable */
  }

  window.dispatchEvent(
    new CustomEvent('atlas-theme-change', {
      detail: { flavor, theme: flavor, isDark: dark },
    }),
  );

  if (animate) {
    window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);
  }
}

export function toggleThemeMode(): 'light' | 'dark' {
  const current = getCurrentFlavor();
  const currentlyDark = isDarkMode(current);
  const next: FlavorId = currentlyDark ? 'light' : 'dark';
  applyTheme(next, true);
  return next;
}


