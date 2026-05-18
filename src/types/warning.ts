export type WarningLevel = 'error' | 'warning' | 'info' | 'unknown';

export type WarningType =
  | 'time-conflict'
  | 'closed-day'
  | 'outside-hours'
  | 'travel-time-shortage'
  | 'insufficient-stay'
  | 'route-inefficiency'
  | 'reservation-required'
  | 'no-business-hours'
  | 'no-travel-data';

export interface Warning {
  id: string;
  type: WarningType;
  level: WarningLevel;
  message: string;
  targetItemIds: string[]; // 관련 Schedule_Item ID들
  dayDate: string; // YYYY-MM-DD
}
