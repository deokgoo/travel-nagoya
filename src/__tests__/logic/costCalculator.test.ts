import { describe, it, expect } from 'vitest';
import {
  calculateDailyCosts,
  calculateTotalCosts,
  categorizeItems,
} from '../../logic/costCalculator';
import type { ScheduleItem } from '../../types/schedule';
import type { TravelSegment } from '../../types/travel';

describe('costCalculator', () => {
  const sampleItems: ScheduleItem[] = [
    {
      id: 'day1-01',
      date: '2025-05-21',
      startTime: '09:00',
      endTime: '10:30',
      placeName: '나고야성',
      category: '관광',
      estimatedCost: 500,
      memo: '',
    },
    {
      id: 'day1-02',
      date: '2025-05-21',
      startTime: '11:00',
      endTime: '12:00',
      placeName: '히츠마부시 식당',
      category: '식사',
      estimatedCost: 3000,
      memo: '',
    },
    {
      id: 'day1-03',
      date: '2025-05-21',
      startTime: '13:00',
      endTime: '14:30',
      placeName: '오스 상점가',
      category: '쇼핑',
      estimatedCost: 2000,
      memo: '',
    },
    {
      id: 'day1-04',
      date: '2025-05-21',
      startTime: '15:00',
      endTime: '15:30',
      placeName: '나고야역 이동',
      category: '이동',
      estimatedCost: 0,
      memo: '',
    },
  ];

  const sampleSegments: TravelSegment[] = [
    {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '전철',
      durationMinutes: 15,
      cost: 210,
    },
    {
      fromItemId: 'day1-02',
      toItemId: 'day1-03',
      mode: '도보',
      durationMinutes: 10,
      cost: 0,
    },
    {
      fromItemId: 'day1-03',
      toItemId: 'day1-04',
      mode: '버스',
      durationMinutes: 20,
      cost: 230,
    },
  ];

  describe('categorizeItems', () => {
    it('카테고리별로 항목을 분류한다', () => {
      const result = categorizeItems(sampleItems);

      expect(result['관광']).toHaveLength(1);
      expect(result['관광'][0].placeName).toBe('나고야성');
      expect(result['식사']).toHaveLength(1);
      expect(result['식사'][0].placeName).toBe('히츠마부시 식당');
      expect(result['쇼핑']).toHaveLength(1);
      expect(result['쇼핑'][0].placeName).toBe('오스 상점가');
      expect(result['이동']).toHaveLength(1);
      expect(result['이동'][0].placeName).toBe('나고야역 이동');
    });

    it('빈 배열을 전달하면 모든 카테고리가 빈 배열이다', () => {
      const result = categorizeItems([]);

      expect(result['식사']).toHaveLength(0);
      expect(result['관광']).toHaveLength(0);
      expect(result['쇼핑']).toHaveLength(0);
      expect(result['이동']).toHaveLength(0);
    });
  });

  describe('calculateDailyCosts', () => {
    it('일자별 카테고리 분류 및 소계를 계산한다', () => {
      const result = calculateDailyCosts(sampleItems, sampleSegments);

      expect(result.date).toBe('2025-05-21');
      expect(result.subtotal).toBe(500 + 3000 + 2000 + 210 + 230);
    });

    it('estimatedCost가 0인 항목은 집계에서 제외한다', () => {
      const result = calculateDailyCosts(sampleItems, sampleSegments);

      // '이동' 카테고리의 항목(cost=0)은 제외되어야 함
      const movementCategory = result.categories.find(
        (c) => c.category === '이동',
      );
      expect(movementCategory).toBeUndefined();
    });

    it('cost가 0인 TravelSegment는 교통 카테고리에서 제외한다', () => {
      const result = calculateDailyCosts(sampleItems, sampleSegments);

      const transportCategory = result.categories.find(
        (c) => c.category === '교통',
      );
      expect(transportCategory).toBeDefined();
      // 도보(cost=0)는 제외, 전철(210)과 버스(230)만 포함
      expect(transportCategory!.amount).toBe(440);
      expect(transportCategory!.items).toHaveLength(2);
    });

    it('각 카테고리의 amount는 해당 항목들의 합계이다', () => {
      const result = calculateDailyCosts(sampleItems, sampleSegments);

      const tourCategory = result.categories.find(
        (c) => c.category === '관광',
      );
      expect(tourCategory!.amount).toBe(500);

      const foodCategory = result.categories.find(
        (c) => c.category === '식사',
      );
      expect(foodCategory!.amount).toBe(3000);

      const shoppingCategory = result.categories.find(
        (c) => c.category === '쇼핑',
      );
      expect(shoppingCategory!.amount).toBe(2000);
    });

    it('subtotal은 모든 카테고리 amount의 합이다', () => {
      const result = calculateDailyCosts(sampleItems, sampleSegments);

      const expectedSubtotal = result.categories.reduce(
        (sum, cat) => sum + cat.amount,
        0,
      );
      expect(result.subtotal).toBe(expectedSubtotal);
    });

    it('빈 배열을 전달하면 빈 결과를 반환한다', () => {
      const result = calculateDailyCosts([], []);

      expect(result.date).toBe('');
      expect(result.categories).toHaveLength(0);
      expect(result.subtotal).toBe(0);
    });

    it('모든 항목의 비용이 0이면 카테고리가 비어있다', () => {
      const zeroItems: ScheduleItem[] = [
        {
          id: 'day1-01',
          date: '2025-05-21',
          startTime: '09:00',
          endTime: '10:00',
          placeName: '무료 공원',
          category: '관광',
          estimatedCost: 0,
          memo: '',
        },
      ];
      const zeroSegments: TravelSegment[] = [
        {
          fromItemId: 'day1-01',
          toItemId: 'day1-02',
          mode: '도보',
          durationMinutes: 10,
          cost: 0,
        },
      ];

      const result = calculateDailyCosts(zeroItems, zeroSegments);

      expect(result.categories).toHaveLength(0);
      expect(result.subtotal).toBe(0);
    });
  });

  describe('calculateTotalCosts', () => {
    it('전체 총 비용을 계산한다', () => {
      const dailyCosts = [
        calculateDailyCosts(sampleItems, sampleSegments),
        calculateDailyCosts(
          [
            {
              id: 'day2-01',
              date: '2025-05-22',
              startTime: '10:00',
              endTime: '11:00',
              placeName: '아츠타 신궁',
              category: '관광',
              estimatedCost: 0,
              memo: '',
            },
            {
              id: 'day2-02',
              date: '2025-05-22',
              startTime: '12:00',
              endTime: '13:00',
              placeName: '미소카츠 식당',
              category: '식사',
              estimatedCost: 1500,
              memo: '',
            },
          ],
          [
            {
              fromItemId: 'day2-01',
              toItemId: 'day2-02',
              mode: '전철',
              durationMinutes: 10,
              cost: 200,
            },
          ],
        ),
      ];

      const result = calculateTotalCosts(dailyCosts);

      expect(result.dailyCosts).toHaveLength(2);
      expect(result.grandTotal).toBe(
        dailyCosts[0].subtotal + dailyCosts[1].subtotal,
      );
    });

    it('빈 배열을 전달하면 grandTotal이 0이다', () => {
      const result = calculateTotalCosts([]);

      expect(result.dailyCosts).toHaveLength(0);
      expect(result.grandTotal).toBe(0);
    });
  });
});
