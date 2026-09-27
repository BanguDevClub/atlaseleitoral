/** dd/mm/yyyy for ISO dates (YYYY, YYYY-MM or YYYY-MM-DD). 3+ call sites share this. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!month) return year;
  if (!day) return `${month}/${year}`;
  return `${day}/${month}/${year}`;
}

/** pt-BR decimal for compass scores: 6.5 → "6,5" */
export function formatScore(value: number): string {
  return value.toFixed(1).replace('.', ',');
}
