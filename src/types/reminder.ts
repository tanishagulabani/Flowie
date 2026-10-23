export type ReminderType = 'period' | 'checkin' | 'pill' | 'water';

export interface Reminder {
  id: string;
  type: ReminderType;
  label: string;
  enabled: boolean;
  time: string; // "HH:MM" 24h
  createdAt: string;
  updatedAt: string;
}
