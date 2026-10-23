export interface CycleEntry {
  id: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionResult {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  cycleDay: number;
  daysUntilNextPeriod: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  confidence: 'low' | 'medium' | 'high';
}
