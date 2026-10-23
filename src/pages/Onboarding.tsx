import React from 'react';
import { onboardingStorage } from '../utils/storage';

interface Props {
  onDone: () => void;
}

export default function Onboarding({ onDone }: Props) {
  const handleAccept = () => {
    onboardingStorage.markDone();
    onDone();
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="animate-in" style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, boxShadow: '0 8px 32px rgba(212,116,140,0.35)'
        }}>
          🌸
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Welcome to Flowie</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
          Your simple, private women's health companion.
        </p>

        {/* Privacy card */}
        <div className="card" style={{ textAlign: 'left', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Your privacy, always</h2>
          </div>
          {[
            '✦ All your data lives only on this device — nothing is uploaded to any server.',
            '✦ No account, no tracking, no third-party analytics.',
            '✦ You can export or delete your data at any time in Settings.',
            '✦ Location is only used when you tap "Find Supplies Nearby" and is never stored.',
          ].map(text => (
            <p key={text} style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 8 }}>
              {text}
            </p>
          ))}
        </div>

        <button className="btn-primary" style={{ width: '100%', fontSize: 16 }} onClick={handleAccept}>
          Got it, let's go 🌸
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, opacity: 0.7 }}>
          By continuing you agree to keep your expectations delightfully simple for a v1 app 😄
        </p>
      </div>
    </div>
  );
}
