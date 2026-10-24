
import { useApp } from '../context/AppContext';
import { predictCycle } from '../utils/cyclePredictor';
import { diffDays } from '../utils/dateHelpers';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const MOOD_SCORE: Record<string, number> = { awful: 1, bad: 2, meh: 3, good: 4, rad: 5 };
const MOOD_LABEL: Record<number, string> = { 1: 'Awful', 2: 'Bad', 3: 'Meh', 4: 'Good', 5: 'Rad' };
const CRAMP_SCORE: Record<string, number> = { none: 0, mild: 1, moderate: 2, severe: 3 };

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

export default function Insights() {
  const { cycles, checkIns } = useApp();
  const prediction = predictCycle(cycles);

  // Cycle lengths chart data
  const sortedCycles = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const cycleLengths: { name: string; days: number }[] = [];
  for (let i = 1; i < sortedCycles.length; i++) {
    const len = diffDays(sortedCycles[i - 1].startDate, sortedCycles[i].startDate);
    if (len > 10 && len < 60) {
      cycleLengths.push({
        name: new Date(sortedCycles[i].startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        days: len,
      });
    }
  }

  // Mood trend (last 30 days)
  const sortedCheckIns = [...checkIns]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
  const moodData = sortedCheckIns.map(c => ({
    name: new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: MOOD_SCORE[c.mood] ?? 3,
  }));

  // Cramp by cycle day
  const crampByCycleDay: Record<number, { total: number; count: number }> = {};
  checkIns.forEach(ci => {
    const periodStart = sortedCycles.slice().reverse().find(c => c.startDate <= ci.date)?.startDate;
    if (!periodStart) return;
    const day = diffDays(periodStart, ci.date) + 1;
    if (day < 1 || day > 35) return;
    if (!crampByCycleDay[day]) crampByCycleDay[day] = { total: 0, count: 0 };
    crampByCycleDay[day].total += CRAMP_SCORE[ci.cramps] ?? 0;
    crampByCycleDay[day].count++;
  });
  const crampData = Object.entries(crampByCycleDay)
    .map(([day, { total, count }]) => ({ day: `Day ${day}`, avg: parseFloat((total / count).toFixed(2)) }))
    .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]))
    .slice(0, 14);

  // Plain-language insights
  const insights: { emoji: string; text: string }[] = [];
  if (checkIns.length >= 5) {
    // Low energy before period
    const preperiodCheckIns = checkIns.filter(ci => {
      const d = diffDays(ci.date, prediction.nextPeriodStart);
      return d >= 1 && d <= 5;
    });
    if (preperiodCheckIns.length >= 2) {
      const lowEnergy = preperiodCheckIns.filter(c => c.energy === 'low');
      if (lowEnergy.length >= preperiodCheckIns.length * 0.5) {
        insights.push({ emoji: '⚡', text: 'You often report low energy in the days before your period.' });
      }
    }
    // Average sleep
    const avgSleep = checkIns.reduce((s, c) => s + c.sleepHours, 0) / checkIns.length;
    insights.push({ emoji: '😴', text: `Your average sleep is ${avgSleep.toFixed(1)} hours per night.` });
    // Most common mood
    const moodCounts: Record<string, number> = {};
    checkIns.forEach(c => { moodCounts[c.mood] = (moodCounts[c.mood] ?? 0) + 1; });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (topMood) insights.push({ emoji: '💭', text: `Your most common mood is "${topMood[0]}" (${topMood[1]} days logged).` });
  }

  const chartColor = '#D4748C';
  const axisStyle = { fontSize: 11, fill: 'var(--text-secondary)' };

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--surface)' }}>
      <div className="gradient-header px-4 pt-10 pb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Insights</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {checkIns.length} check-ins · {cycles.length} cycles logged
        </p>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4 animate-in">
        {/* Insight cards */}
        {insights.length > 0 ? (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>✦ Pattern insights</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insights.map((ins, i) => (
                <div key={i} className="card card-sm" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.emoji}</span>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)' }}>{ins.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <EmptyState emoji="🌱" title="Insights growing" desc="Log check-ins for a few days to see pattern insights here." />
          </div>
        )}

        {/* Cycle length chart */}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Cycle length over time</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Days between period starts</p>
          {cycleLengths.length >= 2 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={cycleLengths} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                  formatter={(v: unknown) => [`${v as number} days`, 'Cycle length']}
                />
                <Line type="monotone" dataKey="days" stroke={chartColor} strokeWidth={2.5} dot={{ r: 4, fill: chartColor }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState emoji="📅" title="Not enough cycles yet" desc="Log at least 2 complete cycles to see cycle length trends." />
          )}
        </div>

        {/* Mood trend */}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Mood trend</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Last 30 days</p>
          {moodData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={moodData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={axisStyle} interval="preserveStartEnd" />
                <YAxis tick={axisStyle} domain={[1, 5]} tickFormatter={(v: number) => MOOD_LABEL[v] ?? ''} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                  formatter={(v: unknown) => { const n = v as number; return [MOOD_LABEL[n] ?? n, 'Mood']; }}
                />
                <Line type="monotone" dataKey="score" stroke="#B9A0C4" strokeWidth={2.5} dot={{ r: 3, fill: '#B9A0C4' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState emoji="😊" title="Check in more" desc="Log at least 3 check-ins to see your mood trend." />
          )}
        </div>

        {/* Cramp chart */}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Cramp severity by cycle day</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Average severity (0=none, 3=severe)</p>
          {crampData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={crampData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={axisStyle} interval={1} />
                <YAxis tick={axisStyle} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                  formatter={(v: unknown) => [(v as number).toFixed(1), 'Avg severity']}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {crampData.map((_, i) => (
                    <Cell key={i} fill={chartColor} fillOpacity={0.5 + _.avg / 6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState emoji="🌸" title="No cramp data yet" desc="Check in with cramp info to see patterns across your cycle." />
          )}
        </div>
      </div>
    </div>
  );
}
