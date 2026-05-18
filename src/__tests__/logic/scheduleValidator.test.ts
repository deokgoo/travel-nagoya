import { describe, it, expect } from 'vitest';
import {
  detectTimeConflicts,
  detectInsufficientStayTime,
  detectTravelTimeShortage,
  detectRouteInefficiency,
  validateSchedule,
} from '@/logic/scheduleValidator';
import type { ScheduleItem } from '@/types/schedule';
import type { BusinessHoursData } from '@/types/businessHours';
import type { TravelSegment } from '@/types/travel';

describe('detectTimeConflicts', () => {
  it('should detect overlapping items (1+ minute overlap)', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:30',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 500,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:00',
        endTime: '11:30',
        placeName: '오스 상점가',
        category: '쇼핑',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectTimeConflicts(items);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('time-conflict');
    expect(warnings[0].level).toBe('error');
    expect(warnings[0].targetItemIds).toContain('item-1');
    expect(warnings[0].targetItemIds).toContain('item-2');
    expect(warnings[0].dayDate).toBe('2025-05-21');
  });

  it('should not detect conflict when items do not overlap', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 500,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:00',
        endTime: '11:00',
        placeName: '오스 상점가',
        category: '쇼핑',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectTimeConflicts(items);
    expect(warnings).toHaveLength(0);
  });

  it('should not detect conflict between items on different days', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:30',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 500,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-22',
        startTime: '09:00',
        endTime: '10:30',
        placeName: '오스 상점가',
        category: '쇼핑',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectTimeConflicts(items);
    expect(warnings).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const warnings = detectTimeConflicts([]);
    expect(warnings).toHaveLength(0);
  });
});

describe('detectInsufficientStayTime', () => {
  const businessHours: BusinessHoursData[] = [
    {
      placeName: '나고야성',
      hours: {
        mon: { open: '09:00', close: '16:30' },
        tue: { open: '09:00', close: '16:30' },
      },
      closedDays: [],
      notes: '',
      recommendedStayMinutes: 90,
      requiresReservation: false,
    },
  ];

  it('should detect when stay time is 30+ minutes shorter than recommended', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '09:50',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 500,
        memo: '',
      },
    ];

    // stay = 50min, recommended = 90min, threshold = 60min, 50 < 60 → warning
    const warnings = detectInsufficientStayTime(items, businessHours);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('insufficient-stay');
    expect(warnings[0].level).toBe('warning');
    expect(warnings[0].targetItemIds).toContain('item-1');
  });

  it('should not warn when stay time is within 30 minutes of recommended', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 500,
        memo: '',
      },
    ];

    // stay = 60min, recommended = 90min, threshold = 60min, 60 >= 60 → no warning
    const warnings = detectInsufficientStayTime(items, businessHours);
    expect(warnings).toHaveLength(0);
  });

  it('should skip items without matching business hours data', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '09:30',
        placeName: '알 수 없는 장소',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectInsufficientStayTime(items, businessHours);
    expect(warnings).toHaveLength(0);
  });
});

describe('detectTravelTimeShortage', () => {
  it('should detect when travel time exceeds available gap', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: 'A',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:10',
        endTime: '11:00',
        placeName: 'B',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const segments: TravelSegment[] = [
      {
        fromItemId: 'item-1',
        toItemId: 'item-2',
        mode: '전철',
        durationMinutes: 15,
        cost: 210,
      },
    ];

    // gap = 10min, travel = 15min → warning
    const warnings = detectTravelTimeShortage(items, segments);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('travel-time-shortage');
    expect(warnings[0].level).toBe('warning');
  });

  it('should not warn when gap is sufficient', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: 'A',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:20',
        endTime: '11:00',
        placeName: 'B',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const segments: TravelSegment[] = [
      {
        fromItemId: 'item-1',
        toItemId: 'item-2',
        mode: '전철',
        durationMinutes: 15,
        cost: 210,
      },
    ];

    // gap = 20min, travel = 15min → no warning
    const warnings = detectTravelTimeShortage(items, segments);
    expect(warnings).toHaveLength(0);
  });

  it('should skip pairs without matching travel segment', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: 'A',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:05',
        endTime: '11:00',
        placeName: 'B',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectTravelTimeShortage(items, []);
    expect(warnings).toHaveLength(0);
  });
});

describe('detectRouteInefficiency', () => {
  it('should detect A→B→A pattern', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 500,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:30',
        endTime: '11:30',
        placeName: '오스 상점가',
        category: '쇼핑',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-3',
        date: '2025-05-21',
        startTime: '12:00',
        endTime: '13:00',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectRouteInefficiency(items);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('route-inefficiency');
    expect(warnings[0].level).toBe('warning');
    expect(warnings[0].targetItemIds).toEqual(['item-1', 'item-2', 'item-3']);
  });

  it('should not detect when no A→B→A pattern exists', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: 'A',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-21',
        startTime: '10:30',
        endTime: '11:30',
        placeName: 'B',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-3',
        date: '2025-05-21',
        startTime: '12:00',
        endTime: '13:00',
        placeName: 'C',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectRouteInefficiency(items);
    expect(warnings).toHaveLength(0);
  });

  it('should not detect pattern across different days', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:00',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-2',
        date: '2025-05-22',
        startTime: '10:00',
        endTime: '11:00',
        placeName: '오스 상점가',
        category: '쇼핑',
        estimatedCost: 0,
        memo: '',
      },
      {
        id: 'item-3',
        date: '2025-05-22',
        startTime: '12:00',
        endTime: '13:00',
        placeName: '나고야성',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = detectRouteInefficiency(items);
    expect(warnings).toHaveLength(0);
  });
});

describe('validateSchedule', () => {
  it('should combine all validation results', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '10:30',
        placeName: '지브리 파크',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const businessHours: BusinessHoursData[] = [
      {
        placeName: '지브리 파크',
        hours: { wed: { open: '10:00', close: '17:00' } },
        closedDays: ['tue'],
        notes: '사전 예매 필수',
        recommendedStayMinutes: 360,
        requiresReservation: true,
      },
    ];

    const segments: TravelSegment[] = [];

    const warnings = validateSchedule(items, segments, businessHours);

    // Should have insufficient-stay warning (90min vs 360min recommended, threshold=330)
    const insufficientStay = warnings.filter((w) => w.type === 'insufficient-stay');
    expect(insufficientStay.length).toBeGreaterThanOrEqual(1);

    // Should have reservation-required info
    const reservationRequired = warnings.filter((w) => w.type === 'reservation-required');
    expect(reservationRequired).toHaveLength(1);
    expect(reservationRequired[0].level).toBe('info');
  });

  it('should return empty array when no issues found', () => {
    const items: ScheduleItem[] = [
      {
        id: 'item-1',
        date: '2025-05-21',
        startTime: '09:00',
        endTime: '11:00',
        placeName: 'A',
        category: '관광',
        estimatedCost: 0,
        memo: '',
      },
    ];

    const warnings = validateSchedule(items, [], []);
    expect(warnings).toHaveLength(0);
  });
});
