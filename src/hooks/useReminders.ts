import { useState, useCallback } from 'react';
import type { Reminder } from '../types';
import { reminderStorage } from '../utils/storage';
import { uid } from '../utils/dateHelpers';

const DEFAULT_REMINDERS: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { type: 'period', label: 'Period coming soon', enabled: false, time: '08:00' },
  { type: 'checkin', label: 'Daily check-in', enabled: false, time: '21:00' },
  { type: 'pill', label: 'Take supplement / pill', enabled: false, time: '09:00' },
  { type: 'water', label: 'Drink water', enabled: false, time: '12:00' },
];

function initReminders(): Reminder[] {
  const stored = reminderStorage.getAll();
  if (stored.length > 0) return stored;
  return DEFAULT_REMINDERS.map(r => ({
    ...r,
    id: uid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(initReminders);

  const persist = useCallback((updated: Reminder[]) => {
    setReminders(updated);
    reminderStorage.save(updated);
  }, []);

  const toggleReminder = useCallback(
    (id: string) => {
      persist(
        reminders.map(r =>
          r.id === id
            ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() }
            : r
        )
      );
    },
    [reminders, persist]
  );

  const updateTime = useCallback(
    (id: string, time: string) => {
      persist(
        reminders.map(r =>
          r.id === id ? { ...r, time, updatedAt: new Date().toISOString() } : r
        )
      );
    },
    [reminders, persist]
  );

  const scheduleNotification = useCallback(async (reminder: Reminder): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'denied') return false;
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') return false;
    }
    // For Web Notifications API, we can only show immediate notifications or use SW
    // We'll show a simple notification as demo
    new Notification(`Flowie – ${reminder.label}`, {
      body: `Reminder set for ${reminder.time}`,
      icon: '/icons/icon-192.png',
    });
    return true;
  }, []);

  const loadReminders = useCallback((entries: Reminder[]) => {
    persist(entries);
  }, [persist]);

  const notificationPermission =
    typeof Notification !== 'undefined' ? Notification.permission : 'default';

  return {
    reminders,
    toggleReminder,
    updateTime,
    scheduleNotification,
    notificationPermission,
    loadReminders,
  };
}
