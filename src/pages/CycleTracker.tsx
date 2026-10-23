import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { predictCycle, getDayType } from '../utils/cyclePredictor';
import { today, getDaysInMonth, getFirstDayOfMonth, toISODate } from '../utils/dateHelpers';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CycleTracker() {
  const { cycles, toggleDay } = useApp();
  const prediction = predictCycle(cycles);
  const todayStr = today();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewYear, viewMonth, i + 1);
      return toISODate(d);
    }),
  ];

  const { daysUntilNextPeriod, cycleDay, averageCycleLength, nextPeriodStart, confidence } = prediction;

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      {/* Summary card */}
      <div className="gradient-header px-4 pt-10 pb-5">
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Cycle Tracker</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Cycle day', value: `Day ${cycleDay}` },
            { label: 'Next period', value: daysUntilNextPeriod === 0 ? 'Today' : `${daysUntilNextPeriod}d away` },
            { label: 'Avg. cycle', value: `${averageCycleLength} days` },
            { label: 'Prediction', value: confidence === 'high' ? '✦ Good' : confidence === 'medium' ? '~ Fair' : '~ Estimated' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.25)', borderRadius: 14, padding: '10px 14px',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>
                {item.label.toUpperCase()}
              </p>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { color: 'var(--primary)', label: 'Period' },
            { color: 'var(--primary-light)', border: 'var(--primary)', label: 'Predicted' },
            { color: 'var(--secondary-light)', label: 'Fertile' },
            { color: 'var(--accent)', label: 'Today' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 12, height: 12, borderRadius: 4,
                background: l.color,
                border: l.border ? `1.5px dashed ${l.border}` : undefined,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="card" style={{ padding: '16px' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button
              onClick={prevMonth}
              style={{ background: 'var(--surface-muted)', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} color="var(--text-primary)" />
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              style={{ background: 'var(--surface-muted)', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}
              aria-label="Next month"
            >
              <ChevronRight size={16} color="var(--text-primary)" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((dateStr, i) => {
              if (!dateStr) return <div key={`empty-${i}`} />;
              const type = getDayType(dateStr, cycles, prediction, todayStr);
              let cls = 'cal-day';
              if (type === 'today') cls += ' today';
              else if (type === 'period') cls += ' period';
              else if (type === 'predicted-period') cls += ' predicted-period';
              else if (type === 'predicted-fertile') cls += ' predicted-fertile';
              const dayNum = new Date(dateStr + 'T00:00:00').getDate();
              return (
                <button
                  key={dateStr}
                  className={cls}
                  onClick={() => toggleDay(dateStr)}
                  aria-label={`${dateStr}${type ? ` (${type})` : ''}`}
                  style={{ border: 'none', fontFamily: 'inherit' }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instruction */}
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          Tap a day to toggle your period. Tap the start date to mark the beginning, tap again to extend it.
        </p>

        {/* Cycle history */}
        {cycles.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Cycle history</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...cycles]
                .sort((a, b) => b.startDate.localeCompare(a.startDate))
                .slice(0, 6)
                .map(c => (
                  <div key={c.id} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>
                        {new Date(c.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {c.endDate
                          ? `${Math.round((new Date(c.endDate+'T00:00:00').getTime() - new Date(c.startDate+'T00:00:00').getTime())/(86400000))+1} day period`
                          : 'Ongoing'}
                      </p>
                    </div>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: c.endDate ? 'var(--primary)' : 'var(--accent)',
                    }} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
