import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { predictCycle } from '../utils/cyclePredictor';
import { today, formatDisplay } from '../utils/dateHelpers';
import { Sparkles, Bell, ChevronRight } from 'lucide-react';

const MOOD_EMOJI: Record<string, string> = {
  rad: '😄', good: '🙂', meh: '😐', bad: '😔', awful: '😩',
};

export default function Home() {
  const { cycles, checkIns, reminders, streak } = useApp();
  const navigate = useNavigate();
  const todayStr = today();

  const prediction = predictCycle(cycles);
  const todayCheckIn = checkIns.find(c => c.date === todayStr);
  const nextReminder = reminders.find(r => r.enabled);

  const { daysUntilNextPeriod, cycleDay, confidence } = prediction;

  const cyclePhrase = daysUntilNextPeriod === 0
    ? 'Period expected today'
    : daysUntilNextPeriod === 1
    ? 'Period expected tomorrow'
    : `Period in ${daysUntilNextPeriod} days`;

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      {/* Hero header */}
      <div className="gradient-header px-4 pt-12 pb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
              Hello 🌸
            </h1>
          </div>
          {streak > 0 && (
            <div style={{
              background: 'var(--surface-card)', borderRadius: 14, padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{streak}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>day streak</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4 animate-in">
        {/* Cycle Summary Card */}
        <button
          className="card"
          onClick={() => navigate('/cycle')}
          style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--primary) 0%, #C4607A 100%)',
            border: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                CYCLE TRACKER
              </p>
              <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                {cyclePhrase}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                Day {cycleDay} of your cycle
                {confidence === 'low' && ' · estimated'}
              </p>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              🗓️
            </div>
          </div>
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Sparkles size={14} color="rgba(255,255,255,0.9)" />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
              Fertile window: {formatDisplay(prediction.fertileWindowStart)} – {formatDisplay(prediction.fertileWindowEnd)}
            </span>
          </div>
        </button>

        {/* Today's check-in */}
        <button
          className="card"
          onClick={() => navigate('/checkin')}
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {todayCheckIn ? MOOD_EMOJI[todayCheckIn.mood] : '✦'}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                  {todayCheckIn ? "Today's check-in ✓" : 'Daily check-in'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {todayCheckIn
                    ? `Mood: ${todayCheckIn.mood} · ${todayCheckIn.sleepHours}h sleep`
                    : 'Tap to log how you feel today'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-secondary)" />
          </div>
        </button>

        {/* Quick actions row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            className="card card-sm"
            onClick={() => navigate('/insights')}
            style={{ cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>📊</div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Insights</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {checkIns.length > 0 ? `${checkIns.length} logs` : 'No data yet'}
            </p>
          </button>
          <button
            className="card card-sm"
            onClick={() => navigate('/nearby')}
            style={{ cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>📍</div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Find Supplies</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Nearby stores
            </p>
          </button>
        </div>

        {/* Next reminder */}
        {nextReminder && (
          <button
            className="card card-sm"
            onClick={() => navigate('/settings')}
            style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--secondary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={18} color="var(--secondary)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                  {nextReminder.label}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                  Reminder at {nextReminder.time}
                </p>
              </div>
              <ChevronRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
