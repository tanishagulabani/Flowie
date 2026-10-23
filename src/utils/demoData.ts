import { CycleEntry, CheckIn, Reminder } from '../types';
import { addDays, toISODate, uid } from './dateHelpers';
import { MoodType, CrampLevel, EnergyLevel } from '../types';

const moods: MoodType[] = ['rad', 'good', 'meh', 'bad', 'awful'];
const cramps: CrampLevel[] = ['none', 'mild', 'moderate', 'severe'];
const energies: EnergyLevel[] = ['low', 'medium', 'high'];

function rnd<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDemoData(): {
  cycles: CycleEntry[];
  checkIns: CheckIn[];
  reminders: Reminder[];
} {
  const today = new Date();
  const cycles: CycleEntry[] = [];
  const checkIns: CheckIn[] = [];

  // Generate 4 past cycles (approx 3 months back)
  let cycleStart = new Date(today);
  cycleStart.setDate(cycleStart.getDate() - 90);

  for (let i = 0; i < 4; i++) {
    const cycleLen = 26 + Math.floor(Math.random() * 5); // 26–30
    const periodLen = 4 + Math.floor(Math.random() * 3); // 4–6
    const startStr = toISODate(cycleStart);
    const endDate = new Date(cycleStart);
    endDate.setDate(endDate.getDate() + periodLen - 1);
    const endStr = toISODate(endDate);

    cycles.push({
      id: uid(),
      startDate: startStr,
      endDate: endStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    cycleStart.setDate(cycleStart.getDate() + cycleLen);
  }

  // Generate daily check-ins for the last 60 days
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toISODate(d);
    // Skip ~20% of days to simulate realistic usage
    if (Math.random() < 0.2) continue;

    checkIns.push({
      id: uid(),
      date: dateStr,
      mood: rnd(moods),
      cramps: rnd(cramps),
      energy: rnd(energies),
      sleepHours: 5 + Math.round(Math.random() * 4 * 2) / 2, // 5–9
      notes: Math.random() > 0.7 ? 'Feeling okay today.' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const reminders: Reminder[] = [
    {
      id: uid(),
      type: 'period',
      label: 'Period coming soon',
      enabled: true,
      time: '08:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      type: 'checkin',
      label: 'Daily check-in',
      enabled: true,
      time: '21:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      type: 'pill',
      label: 'Take supplement',
      enabled: false,
      time: '09:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      type: 'water',
      label: 'Drink water',
      enabled: false,
      time: '12:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { cycles, checkIns, reminders };
}
