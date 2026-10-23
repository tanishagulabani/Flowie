import { CycleEntry, CheckIn, Reminder } from '../types';

const KEYS = {
  cycles: 'flowie_cycles',
  checkIns: 'flowie_checkins',
  reminders: 'flowie_reminders',
  settings: 'flowie_settings',
  onboarded: 'flowie_onboarded',
  pin: 'flowie_pin',
  theme: 'flowie_theme',
  demo: 'flowie_demo',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Cycle entries
export const cycleStorage = {
  getAll: (): CycleEntry[] => load<CycleEntry[]>(KEYS.cycles, []),
  save: (entries: CycleEntry[]) => save(KEYS.cycles, entries),
};

// Check-ins
export const checkInStorage = {
  getAll: (): CheckIn[] => load<CheckIn[]>(KEYS.checkIns, []),
  save: (entries: CheckIn[]) => save(KEYS.checkIns, entries),
};

// Reminders
export const reminderStorage = {
  getAll: (): Reminder[] => load<Reminder[]>(KEYS.reminders, []),
  save: (entries: Reminder[]) => save(KEYS.reminders, entries),
};

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  pinEnabled: boolean;
  demoMode: boolean;
}

export const settingsStorage = {
  get: (): AppSettings =>
    load<AppSettings>(KEYS.settings, { theme: 'system', pinEnabled: false, demoMode: false }),
  save: (s: AppSettings) => save(KEYS.settings, s),
};

export const onboardingStorage = {
  isDone: (): boolean => localStorage.getItem(KEYS.onboarded) === 'true',
  markDone: () => localStorage.setItem(KEYS.onboarded, 'true'),
};

export const pinStorage = {
  get: (): string | null => localStorage.getItem(KEYS.pin),
  set: (pin: string) => localStorage.setItem(KEYS.pin, pin),
  clear: () => localStorage.removeItem(KEYS.pin),
};

export const themeStorage = {
  get: (): 'light' | 'dark' | 'system' =>
    (localStorage.getItem(KEYS.theme) as 'light' | 'dark' | 'system') ?? 'system',
  set: (t: 'light' | 'dark' | 'system') => localStorage.setItem(KEYS.theme, t),
};

export function exportAllData(): string {
  return JSON.stringify(
    {
      cycles: cycleStorage.getAll(),
      checkIns: checkInStorage.getAll(),
      reminders: reminderStorage.getAll(),
      settings: settingsStorage.get(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function deleteAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
