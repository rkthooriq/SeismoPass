// One readable date format for every role, e.g. "27 November 2026" — the
// format the reporter pages already use. Values that are not a plain
// YYYY-MM-DD date are returned unchanged rather than shown as "Invalid Date".
export function formatDate(value: string | undefined): string {
  if (!value) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
