import type { ScheduleItem } from '@/types/schedule';
import type { BusinessHoursData } from '@/types/businessHours';
import type { TravelSegment } from '@/types/travel';
import type { Warning } from '@/types/warning';
import { timeToMinutes, getTimeDifferenceMinutes } from '@/utils/timeUtils';

/**
 * 동일 일자 내 시간 겹침(1분 이상)을 감지하여 경고를 생성한다.
 * overlap = min(endA, endB) - max(startA, startB) >= 1분이면 'time-conflict' error
 */
export function detectTimeConflicts(items: ScheduleItem[]): Warning[] {
  const warnings: Warning[] = [];

  // 일자별로 그룹핑
  const byDate = groupByDate(items);

  for (const [date, dayItems] of Object.entries(byDate)) {
    for (let i = 0; i < dayItems.length; i++) {
      for (let j = i + 1; j < dayItems.length; j++) {
        const a = dayItems[i];
        const b = dayItems[j];

        const startA = timeToMinutes(a.startTime);
        const endA = timeToMinutes(a.endTime);
        const startB = timeToMinutes(b.startTime);
        const endB = timeToMinutes(b.endTime);

        const overlap = Math.min(endA, endB) - Math.max(startA, startB);

        if (overlap >= 1) {
          warnings.push({
            id: `warn-time-conflict-${a.id}-${b.id}`,
            type: 'time-conflict',
            level: 'error',
            message: `시간 충돌: "${a.placeName}"과(와) "${b.placeName}"의 시간이 ${overlap}분 겹칩니다`,
            targetItemIds: [a.id, b.id],
            dayDate: date,
          });
        }
      }
    }
  }

  return warnings;
}

/**
 * 권장 체류시간 대비 30분 이상 부족한 일정을 감지한다.
 * (endTime - startTime) < recommendedStayMinutes - 30 이면 'insufficient-stay' warning
 */
export function detectInsufficientStayTime(
  items: ScheduleItem[],
  businessHours: BusinessHoursData[]
): Warning[] {
  const warnings: Warning[] = [];

  for (const item of items) {
    const hoursData = businessHours.find((bh) => bh.placeName === item.placeName);
    if (!hoursData) continue;

    const stayMinutes = getTimeDifferenceMinutes(item.startTime, item.endTime);
    const threshold = hoursData.recommendedStayMinutes - 30;

    if (stayMinutes < threshold) {
      const shortage = hoursData.recommendedStayMinutes - stayMinutes;
      warnings.push({
        id: `warn-insufficient-stay-${item.id}`,
        type: 'insufficient-stay',
        level: 'warning',
        message: `체류시간 부족: "${item.placeName}"의 할당 시간(${stayMinutes}분)이 권장 체류시간(${hoursData.recommendedStayMinutes}분)보다 ${shortage}분 짧습니다`,
        targetItemIds: [item.id],
        dayDate: item.date,
      });
    }
  }

  return warnings;
}

/**
 * 이동시간이 빈 시간보다 긴 경우를 감지한다.
 * segment.durationMinutes > gap(nextItem.startTime - prevItem.endTime) 이면 'travel-time-shortage' warning
 */
export function detectTravelTimeShortage(
  items: ScheduleItem[],
  segments: TravelSegment[]
): Warning[] {
  const warnings: Warning[] = [];

  // 일자별로 그룹핑 후 시간순 정렬
  const byDate = groupByDate(items);

  for (const [date, dayItems] of Object.entries(byDate)) {
    const sorted = [...dayItems].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const prevItem = sorted[i];
      const nextItem = sorted[i + 1];

      // 해당 구간의 TravelSegment 찾기
      const segment = segments.find(
        (s) => s.fromItemId === prevItem.id && s.toItemId === nextItem.id
      );

      if (!segment) continue;

      const gap = getTimeDifferenceMinutes(prevItem.endTime, nextItem.startTime);

      if (segment.durationMinutes > gap) {
        warnings.push({
          id: `warn-travel-time-shortage-${prevItem.id}-${nextItem.id}`,
          type: 'travel-time-shortage',
          level: 'warning',
          message: `이동시간 부족: "${prevItem.placeName}" → "${nextItem.placeName}" 이동에 ${segment.durationMinutes}분 필요하나 빈 시간은 ${gap}분입니다`,
          targetItemIds: [prevItem.id, nextItem.id],
          dayDate: date,
        });
      }
    }
  }

  return warnings;
}

/**
 * A→B→A 패턴(동일 장소로 되돌아가는 비효율 동선)을 감지한다.
 * items[i].placeName === items[i+2].placeName && items[i].placeName !== items[i+1].placeName
 */
export function detectRouteInefficiency(items: ScheduleItem[]): Warning[] {
  const warnings: Warning[] = [];

  // 일자별로 그룹핑 후 시간순 정렬
  const byDate = groupByDate(items);

  for (const [date, dayItems] of Object.entries(byDate)) {
    const sorted = [...dayItems].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    for (let i = 0; i < sorted.length - 2; i++) {
      const itemA = sorted[i];
      const itemB = sorted[i + 1];
      const itemC = sorted[i + 2];

      // A→B→A 패턴: 첫 번째와 세 번째 장소가 같고, 두 번째는 다른 경우
      if (itemA.placeName === itemC.placeName && itemA.placeName !== itemB.placeName) {
        warnings.push({
          id: `warn-route-inefficiency-${itemA.id}-${itemB.id}-${itemC.id}`,
          type: 'route-inefficiency',
          level: 'warning',
          message: `동선 비효율: "${itemA.placeName}" → "${itemB.placeName}" → "${itemC.placeName}" (A→B→A 패턴)`,
          targetItemIds: [itemA.id, itemB.id, itemC.id],
          dayDate: date,
        });
      }
    }
  }

  return warnings;
}

/**
 * 예약 필수 장소에 대한 정보 경고를 생성한다.
 */
function detectReservationRequired(
  items: ScheduleItem[],
  businessHours: BusinessHoursData[]
): Warning[] {
  const warnings: Warning[] = [];

  for (const item of items) {
    const hoursData = businessHours.find((bh) => bh.placeName === item.placeName);
    if (!hoursData || !hoursData.requiresReservation) continue;

    warnings.push({
      id: `warn-reservation-required-${item.id}`,
      type: 'reservation-required',
      level: 'info',
      message: `사전 예약 필수: "${item.placeName}"${hoursData.notes ? ` - ${hoursData.notes}` : ''}`,
      targetItemIds: [item.id],
      dayDate: item.date,
    });
  }

  return warnings;
}

/**
 * 모든 검증을 통합 실행하여 Warning 배열을 반환한다.
 */
export function validateSchedule(
  items: ScheduleItem[],
  segments: TravelSegment[],
  businessHours: BusinessHoursData[]
): Warning[] {
  const warnings: Warning[] = [
    ...detectTimeConflicts(items),
    ...detectInsufficientStayTime(items, businessHours),
    ...detectTravelTimeShortage(items, segments),
    ...detectRouteInefficiency(items),
    ...detectReservationRequired(items, businessHours),
  ];

  return warnings;
}

/**
 * ScheduleItem 배열을 일자(date)별로 그룹핑한다.
 */
function groupByDate(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  const grouped: Record<string, ScheduleItem[]> = {};
  for (const item of items) {
    if (!grouped[item.date]) {
      grouped[item.date] = [];
    }
    grouped[item.date].push(item);
  }
  return grouped;
}
