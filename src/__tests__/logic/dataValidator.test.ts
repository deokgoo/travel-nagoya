import { describe, it, expect } from 'vitest';
import {
  validateScheduleItems,
  validateBusinessHours,
  validateTravelSegments,
} from '@/data/dataValidator';

describe('validateScheduleItems', () => {
  it('유효한 항목을 통과시킨다', () => {
    const validItem = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '천수각 내부 관람 포함',
    };

    const result = validateScheduleItems([validItem]);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.data[0]).toEqual(validItem);
  });

  it('필수 필드 누락 시 에러를 보고한다', () => {
    const invalidItem = {
      id: 'day1-01',
      date: '2025-05-21',
      // startTime 누락
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    };

    const result = validateScheduleItems([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.field === 'startTime')).toBe(true);
  });

  it('잘못된 시간 형식을 거부한다', () => {
    const invalidItem = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '25:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    };

    const result = validateScheduleItems([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'startTime')).toBe(true);
  });

  it('유효하지 않은 카테고리를 거부한다', () => {
    const invalidItem = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '숙박',
      estimatedCost: 500,
      memo: '',
    };

    const result = validateScheduleItems([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'category')).toBe(true);
  });

  it('유효한 항목과 무효한 항목이 혼합된 경우 유효한 항목만 반환한다', () => {
    const validItem = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    };
    const invalidItem = {
      id: 'day1-02',
      date: 'invalid-date',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    };

    const result = validateScheduleItems([validItem, invalidItem]);
    expect(result.data).toHaveLength(1);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('중복 ID를 거부한다', () => {
    const item1 = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    };
    const item2 = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '11:00',
      endTime: '12:00',
      placeName: '오스 상점가',
      category: '관광',
      estimatedCost: 0,
      memo: '',
    };

    const result = validateScheduleItems([item1, item2]);
    expect(result.data).toHaveLength(1);
    expect(result.errors.some((e) => e.message.includes('중복'))).toBe(true);
  });

  it('음수 비용을 거부한다', () => {
    const invalidItem = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: -100,
      memo: '',
    };

    const result = validateScheduleItems([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'estimatedCost')).toBe(true);
  });
});

describe('validateBusinessHours', () => {
  it('유효한 영업시간 데이터를 통과시킨다', () => {
    const validItem = {
      placeName: '나고야성',
      hours: {
        mon: { open: '09:00', close: '16:30' },
        tue: { open: '09:00', close: '16:30' },
      },
      closedDays: [],
      notes: '',
      recommendedStayMinutes: 90,
      requiresReservation: false,
    };

    const result = validateBusinessHours([validItem]);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('잘못된 영업시간 형식을 거부한다', () => {
    const invalidItem = {
      placeName: '나고야성',
      hours: {
        mon: { open: '25:00', close: '16:30' },
      },
      closedDays: [],
      notes: '',
      recommendedStayMinutes: 90,
      requiresReservation: false,
    };

    const result = validateBusinessHours([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field.includes('open'))).toBe(true);
  });

  it('필수 필드 누락 시 에러를 보고한다', () => {
    const invalidItem = {
      // placeName 누락
      hours: {},
      closedDays: [],
      notes: '',
      recommendedStayMinutes: 90,
      requiresReservation: false,
    };

    const result = validateBusinessHours([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'placeName')).toBe(true);
  });

  it('유효하지 않은 요일을 거부한다', () => {
    const invalidItem = {
      placeName: '나고야성',
      hours: {},
      closedDays: ['holiday'],
      notes: '',
      recommendedStayMinutes: 90,
      requiresReservation: false,
    };

    const result = validateBusinessHours([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'closedDays')).toBe(true);
  });
});

describe('validateTravelSegments', () => {
  it('유효한 이동 구간을 통과시킨다', () => {
    const validItem = {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '전철',
      durationMinutes: 15,
      cost: 210,
    };

    const result = validateTravelSegments([validItem]);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('소요시간이 0인 경우 거부한다', () => {
    const invalidItem = {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '전철',
      durationMinutes: 0,
      cost: 210,
    };

    const result = validateTravelSegments([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'durationMinutes')).toBe(true);
  });

  it('음수 비용을 거부한다', () => {
    const invalidItem = {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '전철',
      durationMinutes: 15,
      cost: -100,
    };

    const result = validateTravelSegments([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'cost')).toBe(true);
  });

  it('유효하지 않은 이동수단을 거부한다', () => {
    const invalidItem = {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '택시',
      durationMinutes: 15,
      cost: 210,
    };

    const result = validateTravelSegments([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'mode')).toBe(true);
  });

  it('필수 필드 누락 시 에러를 보고한다', () => {
    const invalidItem = {
      // fromItemId 누락
      toItemId: 'day1-02',
      mode: '전철',
      durationMinutes: 15,
      cost: 210,
    };

    const result = validateTravelSegments([invalidItem]);
    expect(result.data).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'fromItemId')).toBe(true);
  });

  it('비용 0은 허용한다 (도보)', () => {
    const validItem = {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '도보',
      durationMinutes: 5,
      cost: 0,
    };

    const result = validateTravelSegments([validItem]);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });
});
