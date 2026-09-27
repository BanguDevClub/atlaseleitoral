const rawBase = import.meta.env.BASE_URL ?? '/';
// Ensure no trailing slash for clean path concatenation
export const BASE_PATH = rawBase.replace(/\/$/, '');

export const REPO_URL = 'https://github.com/BanguDevClub/atlaseleitoral';

/**
 * Prepends the application base path to internal routes and assets.
 * E.g. url('/candidatos') -> '/atlaseleitoral/candidatos'
 *      url('/') -> '/atlaseleitoral/'
 */
export function url(path: string = ''): string {
  if (!path || path === '/') {
    return BASE_PATH ? `${BASE_PATH}/` : '/';
  }

  // Preserve external, protocol-relative, anchor or mailto links
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//') ||
    path.startsWith('#') ||
    path.startsWith('mailto:')
  ) {
    return path;
  }

  // Already prefixed
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
}
