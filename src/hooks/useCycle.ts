import { useState, useCallback } from 'react';
import { CycleEntry } from '../types';
import { cycleStorage } from '../utils/storage';
import { uid, today } from '../utils/dateHelpers';

export function useCycle() {
  const [cycles, setCycles] = useState<CycleEntry[]>(() => cycleStorage.getAll());

  const persist = useCallback((updated: CycleEntry[]) => {
    setCycles(updated);
    cycleStorage.save(updated);
  }, []);

  const startPeriod = useCallback((date: string) => {
    const existing = cycles.find(c => c.startDate === date);
    if (existing) return;
    const entry: CycleEntry = {
      id: uid(),
      startDate: date,
      endDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persist([...cycles, entry]);
  }, [cycles, persist]);

  const endPeriod = useCallback((id: string, date: string) => {
    persist(cycles.map(c =>
      c.id === id ? { ...c, endDate: date, updatedAt: new Date().toISOString() } : c
    ));
  }, [cycles, persist]);

  const removeCycle = useCallback((id: string) => {
    persist(cycles.filter(c => c.id !== id));
  }, [cycles, persist]);

  const toggleDay = useCallback((dateStr: string) => {
    // Find a cycle entry that covers this date (as start or end)
    const asStart = cycles.find(c => c.startDate === dateStr);
    if (asStart) {
      // Remove this entry
      removeCycle(asStart.id);
      return;
    }
    // Check if it's an end date of an entry
    const asEnd = cycles.find(c => c.endDate === dateStr);
    if (asEnd) {
      persist(cycles.map(c =>
        c.id === asEnd.id
          ? { ...c, endDate: null, updatedAt: new Date().toISOString() }
          : c
      ));
      return;
    }
    // Check if within a cycle range — extend endDate or shrink
    const inRange = cycles.find(
      c => c.endDate && dateStr > c.startDate && dateStr <= c.endDate
    );
    if (inRange) {
      // Shrink endDate to day before
      const newEnd = dateStr === inRange.startDate ? null : 
        (() => {
          const d = new Date(dateStr + 'T00:00:00');
          d.setDate(d.getDate() - 1);
          return d.toISOString().split('T')[0];
        })();
      persist(cycles.map(c =>
        c.id === inRange.id
          ? { ...c, endDate: newEnd, updatedAt: new Date().toISOString() }
          : c
      ));
      return;
    }
    // Check if it's one day after a startDate with no endDate — set as endDate
    const openCycle = cycles.find(c => !c.endDate && dateStr > c.startDate);
    if (openCycle) {
      endPeriod(openCycle.id, dateStr);
      return;
    }
    // Otherwise, start a new period
    startPeriod(dateStr);
  }, [cycles, persist, startPeriod, endPeriod, removeCycle]);

  const loadCycles = useCallback((newCycles: CycleEntry[]) => {
    persist(newCycles);
  }, [persist]);

  return { cycles, startPeriod, endPeriod, removeCycle, toggleDay, loadCycles };
}
