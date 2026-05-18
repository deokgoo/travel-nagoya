import type { ScheduleItem, Category } from '../types/schedule';
import type { TravelSegment } from '../types/travel';
import type { CategoryCost, DailyCost, TotalCost } from '../types/cost';

/**
 * ScheduleItem을 카테고리별로 분류한다.
 */
export function categorizeItems(
  items: ScheduleItem[],
): Record<Category, ScheduleItem[]> {
  const result: Record<Category, ScheduleItem[]> = {
    식사: [],
    관광: [],
    쇼핑: [],
    이동: [],
  };

  for (const item of items) {
    result[item.category].push(item);
  }

  return result;
}

/**
 * 일자별 카테고리 분류 및 소계를 계산한다.
 * - 각 ScheduleItem은 자신의 category에 해당하는 CategoryCost에 포함
 * - TravelSegment 비용은 '교통' 카테고리에 포함
 * - estimatedCost가 0인 항목은 집계에서 제외
 * - cost가 0인 TravelSegment는 집계에서 제외
 */
export function calculateDailyCosts(
  items: ScheduleItem[],
  segments: TravelSegment[],
): DailyCost {
  const date = items.length > 0 ? items[0].date : '';
  const categorized = categorizeItems(items);
  const categories: CategoryCost[] = [];

  // ScheduleItem 카테고리별 집계
  const categoryKeys: Category[] = ['식사', '관광', '쇼핑', '이동'];
  for (const category of categoryKeys) {
    const categoryItems = categorized[category].filter(
      (item) => item.estimatedCost > 0,
    );

    if (categoryItems.length > 0) {
      const amount = categoryItems.reduce(
        (sum, item) => sum + item.estimatedCost,
        0,
      );
      categories.push({
        category,
        amount,
        items: categoryItems.map((item) => ({
          name: item.placeName,
          cost: item.estimatedCost,
        })),
      });
    }
  }

  // TravelSegment 비용을 '교통' 카테고리에 포함
  const paidSegments = segments.filter((segment) => segment.cost > 0);
  if (paidSegments.length > 0) {
    const transportAmount = paidSegments.reduce(
      (sum, segment) => sum + segment.cost,
      0,
    );
    categories.push({
      category: '교통',
      amount: transportAmount,
      items: paidSegments.map((segment) => ({
        name: `${segment.fromItemId} → ${segment.toItemId}`,
        cost: segment.cost,
      })),
    });
  }

  const subtotal = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return {
    date,
    categories,
    subtotal,
  };
}

/**
 * 전체 총 비용을 계산한다.
 */
export function calculateTotalCosts(dailyCosts: DailyCost[]): TotalCost {
  const grandTotal = dailyCosts.reduce(
    (sum, daily) => sum + daily.subtotal,
    0,
  );

  return {
    dailyCosts,
    grandTotal,
  };
}
