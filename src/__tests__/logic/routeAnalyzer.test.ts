import { describe, it, expect } from 'vitest';
import {
  findSegment,
  analyzeTravelSegment,
  calculateDailyTravelSummary,
} from '@/logic/routeAnalyzer';
import type { ScheduleItem } from '@/types/schedule';
import type { TravelSegment } from '@/types/travel';

describe('routeAnalyzer', () => {
  describe('findSegment', () => {
    const segments: TravelSegment[] = [
      { fromItemId: 'day1-01', toItemId: 'day1-02', mode: '전철', durationMinutes: 15, cost: 210 },
      { fromItemId: 'day1-02', toItemId: 'day1-03', mode: '도보', durationMinutes: 5, cost: 0 },
    ];

    it('매칭되는 segment를 반환한다', () => {
      const result = findSegment('day1-01', 'day1-02', segments);
      expect(result).toEqual(segments[0]);
    });

    it('매칭되는 segment가 없으면 undefined를 반환한다', () => {
      const result = findSegment('day1-01', 'day1-03', segments);
      expect(result).toBeUndefined();
    });

    it('빈 배열에서는 undefined를 반환한다', () => {
      const result = findSegment('day1-01', 'day1-02', []);
      expect(result).toBeUndefined();
    });
  });

  describe('analyzeTravelSegment', () => {
    const prevItem: ScheduleItem = {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    };

    const nextItem: ScheduleItem = {
      id: 'day1-02',
      date: '2025-05-21',
      startTime: '11:00',
      endTime: '12:00',
      placeName: '오스 상점가',
      category: '쇼핑',
      estimatedCost: 0,
      memo: '',
    };

    it('segment가 undefined이면 hasData=false를 반환한다', () => {
      const result = analyzeTravelSegment(prevItem, nextItem, undefined);
      expect(result).toEqual({
        hasData: false,
        segment: null,
        hasTravelTimeShortage: false,
        availableMinutes: 0,
        requiredMinutes: 0,
      });
    });

    it('이동시간이 충분하면 hasTravelTimeShortage=false를 반환한다', () => {
      const segment: TravelSegment = {
        fromItemId: 'day1-01',
        toItemId: 'day1-02',
        mode: '전철',
        durationMinutes: 15,
        cost: 210,
      };
      // 빈 시간: 11:00 - 10:30 = 30분, 필요: 15분
      const result = analyzeTravelSegment(prevItem, nextItem, segment);
      expect(result.hasData).toBe(true);
      expect(result.segment).toEqual(segment);
      expect(result.hasTravelTimeShortage).toBe(false);
      expect(result.availableMinutes).toBe(30);
      expect(result.requiredMinutes).toBe(15);
    });

    it('이동시간이 부족하면 hasTravelTimeShortage=true를 반환한다', () => {
      const segment: TravelSegment = {
        fromItemId: 'day1-01',
        toItemId: 'day1-02',
        mode: '버스',
        durationMinutes: 45,
        cost: 300,
      };
      // 빈 시간: 11:00 - 10:30 = 30분, 필요: 45분
      const result = analyzeTravelSegment(prevItem, nextItem, segment);
      expect(result.hasData).toBe(true);
      expect(result.hasTravelTimeShortage).toBe(true);
      expect(result.availableMinutes).toBe(30);
      expect(result.requiredMinutes).toBe(45);
    });

    it('이동시간이 정확히 같으면 hasTravelTimeShortage=false를 반환한다', () => {
      const segment: TravelSegment = {
        fromItemId: 'day1-01',
        toItemId: 'day1-02',
        mode: '전철',
        durationMinutes: 30,
        cost: 210,
      };
      // 빈 시간: 30분, 필요: 30분 → 부족하지 않음
      const result = analyzeTravelSegment(prevItem, nextItem, segment);
      expect(result.hasTravelTimeShortage).toBe(false);
    });
  });

  describe('calculateDailyTravelSummary', () => {
    it('모든 segment의 이동시간과 비용을 합산한다', () => {
      const segments: TravelSegment[] = [
        { fromItemId: 'day1-01', toItemId: 'day1-02', mode: '전철', durationMinutes: 15, cost: 210 },
        { fromItemId: 'day1-02', toItemId: 'day1-03', mode: '도보', durationMinutes: 5, cost: 0 },
        { fromItemId: 'day1-03', toItemId: 'day1-04', mode: '버스', durationMinutes: 20, cost: 230 },
      ];

      const result = calculateDailyTravelSummary(segments);
      expect(result.totalDurationMinutes).toBe(40);
      expect(result.totalCost).toBe(440);
      expect(result.segmentCount).toBe(3);
    });

    it('빈 배열이면 모든 값이 0이다', () => {
      const result = calculateDailyTravelSummary([]);
      expect(result.totalDurationMinutes).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.segmentCount).toBe(0);
    });

    it('단일 segment를 올바르게 처리한다', () => {
      const segments: TravelSegment[] = [
        { fromItemId: 'day1-01', toItemId: 'day1-02', mode: '전철', durationMinutes: 25, cost: 350 },
      ];

      const result = calculateDailyTravelSummary(segments);
      expect(result.totalDurationMinutes).toBe(25);
      expect(result.totalCost).toBe(350);
      expect(result.segmentCount).toBe(1);
    });
  });
});
