import type { CycleEntry, PredictionResult } from '../types';
import { addDays, diffDays, today } from './dateHelpers';

const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD = 5;

export function predictCycle(cycles: CycleEntry[]): PredictionResult {
  const sorted = [...cycles]
    .filter(c => c.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Compute cycle lengths between consecutive start dates
  const cycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = diffDays(sorted[i - 1].startDate, sorted[i].startDate);
    if (len > 10 && len < 60) cycleLengths.push(len); // sanity check
  }

  // Compute period lengths for cycles that have an endDate
  const periodLengths: number[] = sorted
    .filter(c => c.endDate)
    .map(c => diffDays(c.startDate, c.endDate!) + 1);

  const avgCycle =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : DEFAULT_CYCLE;

  const avgPeriod =
    periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : DEFAULT_PERIOD;

  const confidence: PredictionResult['confidence'] =
    cycleLengths.length >= 5 ? 'high' : cycleLengths.length >= 2 ? 'medium' : 'low';

  const lastPeriodStart = sorted.length > 0 ? sorted[sorted.length - 1].startDate : today();

  const nextPeriodStart = addDays(lastPeriodStart, avgCycle);
  const nextPeriodEnd = addDays(nextPeriodStart, avgPeriod - 1);

  // Ovulation ~14 days before next period; fertile window -5 to +1 around ovulation
  const ovulation = addDays(nextPeriodStart, -14);
  const fertileWindowStart = addDays(ovulation, -5);
  const fertileWindowEnd = addDays(ovulation, 1);

  const todayStr = today();
  const cycleDay = Math.max(1, diffDays(lastPeriodStart, todayStr) + 1);
  const daysUntilNextPeriod = Math.max(0, diffDays(todayStr, nextPeriodStart));

  return {
    nextPeriodStart,
    nextPeriodEnd,
    fertileWindowStart,
    fertileWindowEnd,
    cycleDay,
    daysUntilNextPeriod,
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    confidence,
  };
}

export function getDayType(
  dateStr: string,
  cycles: CycleEntry[],
  prediction: PredictionResult,
  todayStr: string
): 'today' | 'period' | 'predicted-period' | 'fertile' | 'predicted-fertile' | null {
  if (dateStr === todayStr) return 'today';

  // Actual period days
  for (const c of cycles) {
    if (c.endDate && dateStr >= c.startDate && dateStr <= c.endDate) return 'period';
    if (!c.endDate && dateStr === c.startDate) return 'period';
  }

  // Predicted period
  if (dateStr >= prediction.nextPeriodStart && dateStr <= prediction.nextPeriodEnd)
    return 'predicted-period';

  // Fertile window
  if (dateStr >= prediction.fertileWindowStart && dateStr <= prediction.fertileWindowEnd)
    return 'predicted-fertile';

  return null;
}
