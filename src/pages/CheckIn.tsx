import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { today } from '../utils/dateHelpers';
import type { MoodType, CrampLevel, EnergyLevel } from '../types';
import { CheckCircle } from 'lucide-react';

const MOODS: { value: MoodType; emoji: string; label: string }[] = [
  { value: 'rad', emoji: '😄', label: 'Rad' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'meh', emoji: '😐', label: 'Meh' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
  { value: 'awful', emoji: '😩', label: 'Awful' },
];

const CRAMPS: { value: CrampLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const ENERGY: { value: EnergyLevel; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low', emoji: '🪫' },
  { value: 'medium', label: 'Medium', emoji: '⚡' },
  { value: 'high', label: 'High', emoji: '🔋' },
];

export default function CheckIn() {
  const { getTodayEntry, saveEntry, streak } = useApp();
  const todayStr = today();
  const existing = getTodayEntry();

  const [mood, setMood] = useState<MoodType>(existing?.mood ?? 'good');
  const [cramps, setCramps] = useState<CrampLevel>(existing?.cramps ?? 'none');
  const [energy, setEnergy] = useState<EnergyLevel>(existing?.energy ?? 'medium');
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? 7);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const e = getTodayEntry();
    if (e) {
      setMood(e.mood); setCramps(e.cramps); setEnergy(e.energy);
      setSleepHours(e.sleepHours); setNotes(e.notes ?? '');
    }
  }, []);

  const handleSave = () => {
    saveEntry(todayStr, { mood, cramps, energy, sleepHours, notes: notes || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div className="gradient-header px-4 pt-10 pb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Daily Check-in</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {streak > 0 && (
            <div style={{
              background: 'var(--surface-card)', borderRadius: 12, padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{streak}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>streak</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4 animate-in">
        {/* Mood */}
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            How are you feeling?
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {MOODS.map(m => (
              <div key={m.value} style={{ textAlign: 'center' }}>
                <button
                  className={`mood-btn${mood === m.value ? ' selected' : ''}`}
                  onClick={() => setMood(m.value)}
                  aria-label={m.label}
                  aria-pressed={mood === m.value}
                >
                  {m.emoji}
                </button>
                <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cramps */}
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cramp intensity
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {CRAMPS.map(c => (
              <button
                key={c.value}
                onClick={() => setCramps(c.value)}
                aria-pressed={cramps === c.value}
                style={{
                  padding: '10px 4px',
                  borderRadius: 12,
                  border: `2px solid ${cramps === c.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: cramps === c.value ? 'var(--primary-light)' : 'var(--surface-muted)',
                  color: cramps === c.value ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Energy level
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ENERGY.map(e => (
              <button
                key={e.value}
                onClick={() => setEnergy(e.value)}
                aria-pressed={energy === e.value}
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: `2px solid ${energy === e.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: energy === e.value ? 'var(--primary-light)' : 'var(--surface-muted)',
                  color: energy === e.value ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <span style={{ fontSize: 20 }}>{e.emoji}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sleep
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
              {sleepHours}h 😴
            </p>
          </div>
          <input
            type="range"
            min={0} max={12} step={0.5}
            value={sleepHours}
            onChange={e => setSleepHours(parseFloat(e.target.value))}
            aria-label={`Sleep hours: ${sleepHours}`}
            style={{
              width: '100%', accentColor: 'var(--primary)',
              height: 6, borderRadius: 99, cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>0h</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>12h</span>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Notes (optional)
          </p>
          <textarea
            className="input-field"
            placeholder="Anything else on your mind today?"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            aria-label="Optional notes"
            style={{ resize: 'none' }}
          />
        </div>

        {/* Save */}
        <button
          className="btn-primary"
          onClick={handleSave}
          style={{ width: '100%', fontSize: 16, gap: 8 }}
          aria-label="Save check-in"
        >
          {saved ? (
            <>
              <CheckCircle size={18} />
              Saved!
            </>
          ) : (
            existing ? 'Update Check-in' : 'Save Check-in ✦'
          )}
        </button>
      </div>
    </div>
  );
}
