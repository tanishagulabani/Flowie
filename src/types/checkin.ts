export type MoodType = 'rad' | 'good' | 'meh' | 'bad' | 'awful';
export type CrampLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface CheckIn {
  id: string;
  date: string; // "YYYY-MM-DD"
  mood: MoodType;
  cramps: CrampLevel;
  energy: EnergyLevel;
  sleepHours: number; // 0–12
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
