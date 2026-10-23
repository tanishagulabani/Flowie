import { useState, useCallback } from 'react';
import { CheckIn, MoodType, CrampLevel, EnergyLevel } from '../types';
import { checkInStorage } from '../utils/storage';
import { uid, today } from '../utils/dateHelpers';

export function useCheckIn() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => checkInStorage.getAll());

  const persist = useCallback((updated: CheckIn[]) => {
    setCheckIns(updated);
    checkInStorage.save(updated);
  }, []);

  const getByDate = useCallback(
    (date: string) => checkIns.find(c => c.date === date) ?? null,
    [checkIns]
  );

  const getTodayEntry = useCallback(() => getByDate(today()), [getByDate]);

  const saveEntry = useCallback(
    (
      date: string,
      data: { mood: MoodType; cramps: CrampLevel; energy: EnergyLevel; sleepHours: number; notes?: string }
    ) => {
      const existing = checkIns.find(c => c.date === date);
      if (existing) {
        persist(
          checkIns.map(c =>
            c.id === existing.id
              ? { ...c, ...data, updatedAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        const entry: CheckIn = {
          id: uid(),
          date,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        persist([...checkIns, entry]);
      }
    },
    [checkIns, persist]
  );

  const loadCheckIns = useCallback((entries: CheckIn[]) => {
    persist(entries);
  }, [persist]);

  // Streak: consecutive days with a check-in ending today
  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) return 0;
    let count = 0;
    const d = new Date();
    for (const entry of sorted) {
      const expected = d.toISOString().split('T')[0];
      if (entry.date === expected) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  return { checkIns, getByDate, getTodayEntry, saveEntry, streak, loadCheckIns };
}
