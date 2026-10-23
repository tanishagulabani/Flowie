import React, { createContext, useContext, ReactNode } from 'react';
import { useCycle } from '../hooks/useCycle';
import { useCheckIn } from '../hooks/useCheckIn';
import { useReminders } from '../hooks/useReminders';
import { useTheme, Theme } from '../hooks/useTheme';
import { useAppLock } from '../hooks/useAppLock';

interface AppContextType {
  // Cycle
  cycles: ReturnType<typeof useCycle>['cycles'];
  startPeriod: ReturnType<typeof useCycle>['startPeriod'];
  endPeriod: ReturnType<typeof useCycle>['endPeriod'];
  removeCycle: ReturnType<typeof useCycle>['removeCycle'];
  toggleDay: ReturnType<typeof useCycle>['toggleDay'];
  loadCycles: ReturnType<typeof useCycle>['loadCycles'];
  // CheckIn
  checkIns: ReturnType<typeof useCheckIn>['checkIns'];
  getByDate: ReturnType<typeof useCheckIn>['getByDate'];
  getTodayEntry: ReturnType<typeof useCheckIn>['getTodayEntry'];
  saveEntry: ReturnType<typeof useCheckIn>['saveEntry'];
  streak: number;
  loadCheckIns: ReturnType<typeof useCheckIn>['loadCheckIns'];
  // Reminders
  reminders: ReturnType<typeof useReminders>['reminders'];
  toggleReminder: ReturnType<typeof useReminders>['toggleReminder'];
  updateTime: ReturnType<typeof useReminders>['updateTime'];
  scheduleNotification: ReturnType<typeof useReminders>['scheduleNotification'];
  notificationPermission: ReturnType<typeof useReminders>['notificationPermission'];
  loadReminders: ReturnType<typeof useReminders>['loadReminders'];
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  // Lock
  locked: boolean;
  pinEnabled: boolean;
  unlock: (pin: string) => boolean;
  enablePin: (pin: string) => void;
  disablePin: () => void;
  lockApp: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const cycleHook = useCycle();
  const checkInHook = useCheckIn();
  const remindersHook = useReminders();
  const themeHook = useTheme();
  const lockHook = useAppLock();

  const value: AppContextType = {
    ...cycleHook,
    ...checkInHook,
    ...remindersHook,
    ...themeHook,
    ...lockHook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
