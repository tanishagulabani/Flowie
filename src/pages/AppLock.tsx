import React, { useState } from 'react';

interface Props {
  onUnlock: (pin: string) => boolean;
}

export default function AppLock({ onUnlock }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setError(false);
    if (newPin.length === 4) {
      setTimeout(() => {
        const ok = onUnlock(newPin);
        if (!ok) {
          setPin('');
          setError(true);
        }
      }, 150);
    }
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="animate-in" style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 24px',
          boxShadow: '0 8px 32px rgba(212,116,140,0.35)'
        }}>
          🔒
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Enter your PIN</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
          Flowie is locked. Enter your 4-digit PIN to continue.
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < pin.length ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.2s, transform 0.2s',
              transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
            }} />
          ))}
        </div>

        {error && (
          <p style={{ color: 'var(--primary)', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {digits.map((d, i) => (
            <button
              key={i}
              onClick={() => d === '⌫' ? handleBackspace() : d !== '' ? handleDigit(d) : undefined}
              disabled={d === ''}
              style={{
                height: 72,
                borderRadius: 20,
                border: 'none',
                background: d === '' ? 'transparent' : 'var(--surface-card)',
                borderColor: 'var(--border)',
                fontSize: d === '⌫' ? 22 : 24,
                fontWeight: 600,
                color: d === '⌫' ? 'var(--text-secondary)' : 'var(--text-primary)',
                cursor: d === '' ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: d !== '' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
              aria-label={d === '⌫' ? 'Backspace' : d}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
