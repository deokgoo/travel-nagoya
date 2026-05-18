import { describe, it, expect, vi } from 'vitest';
import {
  loadScheduleData,
  loadBusinessHoursData,
  loadTravelSegmentData,
  loadAllData,
} from '@/data/dataLoader';

describe('DataLoader', () => {
  describe('loadScheduleData', () => {
    it('검증된 일정 데이터를 반환한다', () => {
      const result = loadScheduleData();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('각 일정 항목이 필수 필드를 포함한다', () => {
      const result = loadScheduleData();

      for (const item of result.data) {
        expect(item.id).toBeDefined();
        expect(item.date).toBeDefined();
        expect(item.startTime).toBeDefined();
        expect(item.endTime).toBeDefined();
        expect(item.placeName).toBeDefined();
        expect(item.category).toBeDefined();
        expect(typeof item.estimatedCost).toBe('number');
        expect(typeof item.memo).toBe('string');
      }
    });
  });

  describe('loadBusinessHoursData', () => {
    it('검증된 영업시간 데이터를 반환한다', () => {
      const result = loadBusinessHoursData();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('각 영업시간 항목이 필수 필드를 포함한다', () => {
      const result = loadBusinessHoursData();

      for (const item of result.data) {
        expect(item.placeName).toBeDefined();
        expect(item.hours).toBeDefined();
        expect(Array.isArray(item.closedDays)).toBe(true);
        expect(typeof item.notes).toBe('string');
        expect(typeof item.recommendedStayMinutes).toBe('number');
        expect(typeof item.requiresReservation).toBe('boolean');
      }
    });
  });

  describe('loadTravelSegmentData', () => {
    it('검증된 이동 구간 데이터를 반환한다', () => {
      const result = loadTravelSegmentData();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('각 이동 구간 항목이 필수 필드를 포함한다', () => {
      const result = loadTravelSegmentData();

      for (const item of result.data) {
        expect(item.fromItemId).toBeDefined();
        expect(item.toItemId).toBeDefined();
        expect(item.mode).toBeDefined();
        expect(typeof item.durationMinutes).toBe('number');
        expect(item.durationMinutes).toBeGreaterThan(0);
        expect(typeof item.cost).toBe('number');
        expect(item.cost).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('loadAllData', () => {
    it('모든 데이터를 한 번에 로드한다', () => {
      const result = loadAllData();

      expect(result.scheduleItems).toBeDefined();
      expect(result.businessHours).toBeDefined();
      expect(result.travelSegments).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.scheduleItems)).toBe(true);
      expect(Array.isArray(result.businessHours)).toBe(true);
      expect(Array.isArray(result.travelSegments)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('개별 로드 결과와 동일한 데이터를 반환한다', () => {
      const allData = loadAllData();
      const scheduleResult = loadScheduleData();
      const businessHoursResult = loadBusinessHoursData();
      const travelSegmentsResult = loadTravelSegmentData();

      expect(allData.scheduleItems).toEqual(scheduleResult.data);
      expect(allData.businessHours).toEqual(businessHoursResult.data);
      expect(allData.travelSegments).toEqual(travelSegmentsResult.data);
    });

    it('에러 목록이 모든 검증 에러를 포함한다', () => {
      const allData = loadAllData();
      const scheduleResult = loadScheduleData();
      const businessHoursResult = loadBusinessHoursData();
      const travelSegmentsResult = loadTravelSegmentData();

      const expectedErrorCount =
        scheduleResult.errors.length +
        businessHoursResult.errors.length +
        travelSegmentsResult.errors.length;

      expect(allData.errors.length).toBe(expectedErrorCount);
    });
  });

  describe('검증 에러 시 콘솔 경고 출력', () => {
    it('유효한 데이터에 대해 콘솔 경고를 출력하지 않는다', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      loadScheduleData();
      loadBusinessHoursData();
      loadTravelSegmentData();

      // 현재 JSON 데이터가 모두 유효하므로 경고가 없어야 함
      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
