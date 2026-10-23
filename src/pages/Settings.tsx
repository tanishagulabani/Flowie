import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme, Theme } from '../hooks/useTheme';
import { exportAllData, deleteAllData } from '../utils/storage';
import { generateDemoData } from '../utils/demoData';
import { settingsStorage } from '../utils/storage';
import { Sun, Moon, Monitor, Download, Trash2, Lock, Unlock, FlaskConical, Bell, ChevronRight } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, enablePin, disablePin, pinEnabled, lockApp,
    loadCycles, loadCheckIns, loadReminders } = useApp();
  const [demoMode, setDemoMode] = useState(() => settingsStorage.get().demoMode);
  const [pinSetup, setPinSetup] = useState<'idle' | 'entering' | 'confirming'>('idle');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowie-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    deleteAllData();
    window.location.reload();
  };

  const handleDemoToggle = () => {
    if (demoMode) {
      // Clear demo data
      loadCycles([]);
      loadCheckIns([]);
      const s = settingsStorage.get();
      settingsStorage.save({ ...s, demoMode: false });
      setDemoMode(false);
    } else {
      const { cycles, checkIns, reminders } = generateDemoData();
      loadCycles(cycles);
      loadCheckIns(checkIns);
      loadReminders(reminders);
      const s = settingsStorage.get();
      settingsStorage.save({ ...s, demoMode: true });
      setDemoMode(true);
    }
  };

  const handleSetPin = () => {
    if (pinInput.length !== 4) { setPinError('PIN must be 4 digits.'); return; }
    if (pinSetup === 'entering') {
      setPinSetup('confirming');
      setPinError('');
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError('PINs do not match. Try again.');
      setPinInput(''); setPinConfirm(''); setPinSetup('entering');
      return;
    }
    enablePin(pinInput);
    setPinSetup('idle'); setPinInput(''); setPinConfirm(''); setPinError('');
  };

  const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={16} />, label: 'Light' },
    { value: 'dark', icon: <Moon size={16} />, label: 'Dark' },
    { value: 'system', icon: <Monitor size={16} />, label: 'System' },
  ];

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      <div className="gradient-header px-4 pt-10 pb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4 animate-in">
        {/* Quick nav to Reminders */}
        <button className="card card-sm" onClick={() => navigate('/reminders')} style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="var(--secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>Reminders</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>Set up period, check-in & more</p>
            </div>
            <ChevronRight size={16} color="var(--text-secondary)" />
          </div>
        </button>
        {/* Appearance */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Appearance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                aria-pressed={theme === opt.value}
                style={{
                  padding: '12px 8px',
                  borderRadius: 14,
                  border: `2px solid ${theme === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: theme === opt.value ? 'var(--primary-light)' : 'var(--surface-muted)',
                  color: theme === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.18s', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo mode */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FlaskConical size={18} color="#D97706" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Demo data</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                  Fill 3 months of sample data
                </p>
              </div>
            </div>
            <button
              className={`toggle-track${demoMode ? ' on' : ''}`}
              onClick={handleDemoToggle}
              role="switch"
              aria-checked={demoMode}
              aria-label="Toggle demo data"
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* PIN Lock */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            App Lock
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pinEnabled ? 12 : 0 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pinEnabled ? <Lock size={18} color="var(--primary)" /> : <Unlock size={18} color="var(--primary)" />}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>PIN Lock</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                  {pinEnabled ? 'Enabled — 4-digit PIN' : 'Protect with a 4-digit PIN'}
                </p>
              </div>
            </div>
            {pinEnabled ? (
              <button className="btn-ghost" onClick={disablePin} style={{ color: 'var(--primary)', fontSize: 13 }}>
                Disable
              </button>
            ) : (
              <button className="btn-ghost" onClick={() => setPinSetup('entering')} style={{ fontSize: 13 }}>
                Set PIN
              </button>
            )}
          </div>

          {/* PIN setup flow */}
          {pinSetup !== 'idle' && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {pinSetup === 'entering' ? 'Enter a new 4-digit PIN:' : 'Confirm your PIN:'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-field"
                  placeholder="••••"
                  value={pinSetup === 'entering' ? pinInput : pinConfirm}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '');
                    pinSetup === 'entering' ? setPinInput(v) : setPinConfirm(v);
                  }}
                  aria-label={pinSetup === 'entering' ? 'New PIN' : 'Confirm PIN'}
                />
                <button className="btn-primary" onClick={handleSetPin} style={{ padding: '0 20px', flexShrink: 0 }}>
                  {pinSetup === 'entering' ? 'Next' : 'Save'}
                </button>
              </div>
              {pinError && (
                <p style={{ color: 'var(--primary)', fontSize: 12, marginTop: 6, fontWeight: 600 }}>{pinError}</p>
              )}
            </div>
          )}

          {pinEnabled && (
            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: 10, fontSize: 13 }}
              onClick={lockApp}
            >
              <Lock size={14} /> Lock app now
            </button>
          )}
        </div>

        {/* Data */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your data
          </h2>
          <button
            className="btn-secondary"
            style={{ width: '100%', marginBottom: 10 }}
            onClick={handleExport}
          >
            <Download size={16} /> Export my data (JSON)
          </button>
          {!deleteConfirm ? (
            <button
              className="btn-secondary"
              style={{ width: '100%', borderColor: '#FECACA', color: '#DC2626' }}
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 size={16} /> Delete all my data
            </button>
          ) : (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 14, padding: 16,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>
                Are you sure? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </button>
                <button
                  style={{
                    flex: 1, background: '#DC2626', color: '#fff', border: 'none',
                    borderRadius: 14, padding: '12px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  }}
                  onClick={handleDeleteAll}
                >
                  Yes, delete all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* About */}
        <div className="card" style={{ textAlign: 'center', background: 'var(--surface-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🌸</div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Flowie v1.0</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A simple, private women's health companion.<br />
            All data stays on your device. No accounts. No tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
