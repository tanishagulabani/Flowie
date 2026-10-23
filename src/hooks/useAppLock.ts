import { useState, useCallback } from 'react';
import { pinStorage, settingsStorage } from '../utils/storage';

export function useAppLock() {
  const settings = settingsStorage.get();
  const [locked, setLocked] = useState(() => {
    return settings.pinEnabled && pinStorage.get() !== null;
  });
  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);

  const unlock = useCallback((pin: string): boolean => {
    const stored = pinStorage.get();
    if (stored === pin) {
      setLocked(false);
      return true;
    }
    return false;
  }, []);

  const enablePin = useCallback((pin: string) => {
    pinStorage.set(pin);
    const s = settingsStorage.get();
    settingsStorage.save({ ...s, pinEnabled: true });
    setPinEnabled(true);
  }, []);

  const disablePin = useCallback(() => {
    pinStorage.clear();
    const s = settingsStorage.get();
    settingsStorage.save({ ...s, pinEnabled: false });
    setPinEnabled(false);
    setLocked(false);
  }, []);

  const lockApp = useCallback(() => {
    if (pinEnabled) setLocked(true);
  }, [pinEnabled]);

  return { locked, pinEnabled, unlock, enablePin, disablePin, lockApp };
}
