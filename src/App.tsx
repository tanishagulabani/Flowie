import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/layout/BottomNav';
import { onboardingStorage } from './utils/storage';
import Onboarding from './pages/Onboarding';
import AppLock from './pages/AppLock';
import Home from './pages/Home';
import CycleTracker from './pages/CycleTracker';
import CheckIn from './pages/CheckIn';
import Insights from './pages/Insights';
import Reminders from './pages/Reminders';
import Nearby from './pages/Nearby';
import Settings from './pages/Settings';

function AppShell() {
  const { locked, unlock } = useApp();
  const [onboarded, setOnboarded] = useState(onboardingStorage.isDone());

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />;
  }

  if (locked) {
    return <AppLock onUnlock={unlock} />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cycle" element={<CycleTracker />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
