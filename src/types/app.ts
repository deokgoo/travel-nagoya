import type { ScheduleItem } from './schedule';
import type { BusinessHoursData } from './businessHours';
import type { TravelSegment } from './travel';
import type { Warning } from './warning';
import type { ValidationError } from './common';

export interface DayInfo {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1~4
  label: string; // "1일차 (5/21)"
}

export interface AppState {
  days: DayInfo[];
  selectedDate: string;
  scheduleItems: ScheduleItem[];
  businessHours: BusinessHoursData[];
  travelSegments: TravelSegment[];
  warnings: Warning[];
  loadErrors: ValidationError[];
}
