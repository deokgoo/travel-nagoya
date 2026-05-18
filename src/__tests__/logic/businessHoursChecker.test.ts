import { describe, it, expect } from 'vitest';
import {
  checkBusinessHours,
  isClosedDay,
  isOutsideBusinessHours,
} from '@/logic/businessHoursChecker';
import type { ScheduleItem } from '@/types/schedule';
import type { BusinessHoursData } from '@/types/businessHours';

const sampleHoursData: BusinessHoursData[] = [
  {
    placeName: '나고야성',
    hours: {
      mon: { open: '09:00', close: '16:30' },
      tue: { open: '09:00', close: '16:30' },
      wed: { open: '09:00', close: '16:30' },
      thu: { open: '09:00', close: '16:30' },
      fri: { open: '09:00', close: '16:30' },
      sat: { open: '09:00', close: '16:30' },
      sun: { open: '09:00', close: '16:30' },
    },
    closedDays: [],
    notes: '',
    recommendedStayMinutes: 90,
    requiresReservation: false,
  },
  {
    placeName: '아츠타 신궁',
    hours: {
      mon: { open: '09:00', close: '16:30' },
      tue: { open: '09:00', close: '16:30' },
      thu: { open: '09:00', close: '16:30' },
      fri: { open: '09:00', close: '16:30' },
      sat: { open: '09:00', close: '16:30' },
      sun: { open: '09:00', close: '16:30' },
    },
    closedDays: ['wed'],
    notes: '보물관은 별도 입장료',
    recommendedStayMinutes: 60,
    requiresReservation: false,
  },
  {
    placeName: '히츠마부시 전문점',
    hours: {
      mon: { open: '11:00', close: '14:00' },
      tue: { open: '11:00', close: '14:00' },
      wed: { open: '11:00', close: '14:00' },
      thu: { open: '11:00', close: '14:00' },
      fri: { open: '11:00', close: '14:00' },
      sat: { open: '11:00', close: '14:00' },
      sun: { open: '11:00', close: '14:00' },
    },
    closedDays: ['tue'],
    notes: '예약 필수',
    recommendedStayMinutes: 60,
    requiresReservation: true,
  },
];

describe('isClosedDay', () => {
  it('휴무일에 해당하면 true를 반환한다', () => {
    // 2025-05-21 is Wednesday
    expect(isClosedDay('2025-05-21', ['wed'])).toBe(true);
  });

  it('휴무일에 해당하지 않으면 false를 반환한다', () => {
    // 2025-05-21 is Wednesday
    expect(isClosedDay('2025-05-21', ['mon', 'tue'])).toBe(false);
  });

  it('휴무일 목록이 비어있으면 false를 반환한다', () => {
    expect(isClosedDay('2025-05-21', [])).toBe(false);
  });
});

describe('isOutsideBusinessHours', () => {
  it('방문 시간이 영업시간 내이면 false를 반환한다', () => {
    expect(isOutsideBusinessHours('09:00', '10:30', '09:00', '16:30')).toBe(false);
  });

  it('시작시간이 영업 시작시간보다 이르면 true를 반환한다', () => {
    expect(isOutsideBusinessHours('08:30', '10:00', '09:00', '16:30')).toBe(true);
  });

  it('종료시간이 영업 종료시간보다 늦으면 true를 반환한다', () => {
    expect(isOutsideBusinessHours('15:00', '17:00', '09:00', '16:30')).toBe(true);
  });

  it('시작시간과 종료시간 모두 영업시간 밖이면 true를 반환한다', () => {
    expect(isOutsideBusinessHours('07:00', '18:00', '09:00', '16:30')).toBe(true);
  });

  it('영업시간 경계값과 정확히 일치하면 false를 반환한다', () => {
    expect(isOutsideBusinessHours('09:00', '16:30', '09:00', '16:30')).toBe(false);
  });
});

describe('checkBusinessHours', () => {
  const makeItem = (overrides: Partial<ScheduleItem> = {}): ScheduleItem => ({
    id: 'test-01',
    date: '2025-05-21',
    startTime: '09:00',
    endTime: '10:30',
    placeName: '나고야성',
    category: '관광',
    estimatedCost: 500,
    memo: '',
    ...overrides,
  });

  it('영업시간 내 방문 시 open 상태를 반환한다', () => {
    const item = makeItem({ placeName: '나고야성', startTime: '09:00', endTime: '10:30' });
    // 2025-05-21 is Wednesday
    const result = checkBusinessHours(item, '2025-05-21', sampleHoursData);

    expect(result.status).toBe('open');
    expect(result.hoursDisplay).toBe('09:00~16:30');
    expect(result.requiresReservation).toBe(false);
  });

  it('영업시간 데이터가 없는 장소는 unknown을 반환한다', () => {
    const item = makeItem({ placeName: '알 수 없는 장소' });
    const result = checkBusinessHours(item, '2025-05-21', sampleHoursData);

    expect(result.status).toBe('unknown');
    expect(result.hoursDisplay).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.requiresReservation).toBe(false);
  });

  it('휴무일에 방문하면 closed-day를 반환한다', () => {
    const item = makeItem({ placeName: '아츠타 신궁', startTime: '09:00', endTime: '10:00' });
    // 2025-05-21 is Wednesday, 아츠타 신궁 is closed on Wednesday
    const result = checkBusinessHours(item, '2025-05-21', sampleHoursData);

    expect(result.status).toBe('closed-day');
    expect(result.hoursDisplay).toBeNull();
    expect(result.notes).toBe('보물관은 별도 입장료');
  });

  it('휴무일이면 영업시간 외 경고 대신 closed-day만 반환한다', () => {
    // 방문 시간이 영업시간 밖이더라도 휴무일이면 closed-day만 반환
    const item = makeItem({ placeName: '아츠타 신궁', startTime: '07:00', endTime: '08:00' });
    // 2025-05-21 is Wednesday
    const result = checkBusinessHours(item, '2025-05-21', sampleHoursData);

    expect(result.status).toBe('closed-day');
    expect(result.status).not.toBe('outside-hours');
  });

  it('영업시간 외 방문 시 outside-hours를 반환한다', () => {
    const item = makeItem({ placeName: '나고야성', startTime: '07:00', endTime: '08:30' });
    // 2025-05-21 is Wednesday, 나고야성 opens at 09:00
    const result = checkBusinessHours(item, '2025-05-21', sampleHoursData);

    expect(result.status).toBe('outside-hours');
    expect(result.hoursDisplay).toBe('09:00~16:30');
  });

  it('예약 필수 장소의 requiresReservation이 true로 반환된다', () => {
    const item = makeItem({
      placeName: '히츠마부시 전문점',
      startTime: '11:30',
      endTime: '12:30',
    });
    // 2025-05-21 is Wednesday
    const result = checkBusinessHours(item, '2025-05-21', sampleHoursData);

    expect(result.status).toBe('open');
    expect(result.requiresReservation).toBe(true);
    expect(result.notes).toBe('예약 필수');
  });

  it('해당 요일에 영업시간 데이터가 없으면 unknown을 반환한다', () => {
    // 아츠타 신궁은 wed에 closedDays로 설정되어 있지만, hours에도 wed가 없음
    // 다른 케이스: hours에 특정 요일이 없는 경우를 테스트
    const customHoursData: BusinessHoursData[] = [
      {
        placeName: '특수 장소',
        hours: {
          mon: { open: '10:00', close: '18:00' },
          // 다른 요일 데이터 없음
        },
        closedDays: [],
        notes: '',
        recommendedStayMinutes: 30,
        requiresReservation: false,
      },
    ];
    const item = makeItem({ placeName: '특수 장소' });
    // 2025-05-21 is Wednesday, but hours only has 'mon'
    const result = checkBusinessHours(item, '2025-05-21', customHoursData);

    expect(result.status).toBe('unknown');
    expect(result.hoursDisplay).toBeNull();
  });
});
