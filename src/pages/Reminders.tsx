import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Droplets, Pill, Moon, Calendar } from 'lucide-react';
import type { ReminderType } from '../types';

const ICONS: Record<ReminderType, ReactNode> = {
  period: <Calendar size={20} color="var(--primary)" />,
  checkin: <Moon size={20} color="var(--secondary)" />,
  pill: <Pill size={20} color="var(--accent)" />,
  water: <Droplets size={20} color="#60AECB" />,
};

const COLORS: Record<ReminderType, string> = {
  period: 'var(--primary-light)',
  checkin: 'var(--secondary-light)',
  pill: '#FEF3C7',
  water: '#E0F2FE',
};

export default function Reminders() {
  const { reminders, toggleReminder, updateTime, notificationPermission } = useApp();

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      <div className="gradient-header px-4 pt-10 pb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reminders</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Stay on top of your health routine.
        </p>
      </div>

      <div className="px-4 mt-4 animate-in">
        {/* Notification permission banner */}
        {notificationPermission !== 'granted' && (
          <div className="card card-sm" style={{
            marginBottom: 16,
            background: 'var(--secondary-light)',
            borderColor: 'var(--secondary)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Bell size={18} color="var(--secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Enable notifications
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Allow browser notifications to get reminders outside the app. In-app reminders are always active.
              </p>
              {notificationPermission !== 'denied' && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: 8, padding: '6px 0', fontSize: 13 }}
                  onClick={() => Notification.requestPermission()}
                >
                  Enable notifications →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reminder list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reminders.map(r => (
            <div key={r.id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: COLORS[r.type],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ICONS[r.type]}
                </div>

                {/* Label + time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {r.label}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="time"
                      value={r.time}
                      onChange={e => updateTime(r.id, e.target.value)}
                      aria-label={`Time for ${r.label}`}
                      style={{
                        border: 'none', background: 'var(--surface-muted)',
                        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                  </div>
                </div>

                {/* Toggle */}
                <button
                  className={`toggle-track${r.enabled ? ' on' : ''}`}
                  onClick={() => toggleReminder(r.id)}
                  aria-checked={r.enabled}
                  role="switch"
                  aria-label={`Toggle ${r.label}`}
                >
                  <div className="toggle-thumb" />
                </button>
              </div>

              {/* Active hint */}
              {r.enabled && (
                <div style={{
                  marginTop: 12, padding: '8px 12px',
                  background: 'var(--surface-muted)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Active · reminder set for {r.time}
                    {notificationPermission !== 'granted' && ' (in-app only)'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 20, lineHeight: 1.6, opacity: 0.8 }}>
          Reminders rely on browser notifications. For reliable reminders, keep this tab open or install the app to your home screen.
        </p>
      </div>
    </div>
  );
}
