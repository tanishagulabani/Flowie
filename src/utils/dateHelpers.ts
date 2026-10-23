// Pure date helpers (no external deps)

export function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function today(): string {
  return toISODate(new Date());
}

export function parseDate(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

export function diffDays(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / msPerDay);
}

export function addDays(iso: string, n: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export function isBetween(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function formatDisplay(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFull(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
