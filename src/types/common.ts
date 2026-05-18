import type { TravelSegment } from './travel';

export interface BusinessHoursCheckResult {
  status: 'open' | 'closed-day' | 'outside-hours' | 'unknown';
  hoursDisplay: string | null; // "HH:MM~HH:MM" 또는 null
  notes: string | null;
  requiresReservation: boolean;
}

export interface TravelAnalysisResult {
  hasData: boolean;
  segment: TravelSegment | null;
  hasTravelTimeShortage: boolean;
  availableMinutes: number;
  requiredMinutes: number;
}

export interface TravelSummary {
  totalDurationMinutes: number;
  totalCost: number;
  segmentCount: number;
}

export interface ValidationResult<T> {
  data: T;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  itemId?: string;
}
