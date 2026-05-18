export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DailyHours {
  open: string; // HH:mm
  close: string; // HH:mm
}

export interface BusinessHoursData {
  placeName: string;
  hours: Partial<Record<DayOfWeek, DailyHours>>;
  closedDays: DayOfWeek[];
  notes: string; // 최대 100자 (예약 필수 등)
  recommendedStayMinutes: number; // 권장 체류시간 (분)
  requiresReservation: boolean;
}
