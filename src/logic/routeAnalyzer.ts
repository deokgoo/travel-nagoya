import type { ScheduleItem } from '@/types/schedule';
import type { TravelSegment } from '@/types/travel';
import type { TravelAnalysisResult, TravelSummary } from '@/types/common';
import { timeToMinutes } from '@/utils/timeUtils';

/**
 * 두 일정 항목 사이에 매칭되는 TravelSegment를 찾는다
 * @param fromItemId - 출발 일정 항목 ID
 * @param toItemId - 도착 일정 항목 ID
 * @param segments - TravelSegment 배열
 * @returns 매칭되는 TravelSegment 또는 undefined
 */
export function findSegment(
  fromItemId: string,
  toItemId: string,
  segments: TravelSegment[],
): TravelSegment | undefined {
  return segments.find(
    (segment) => segment.fromItemId === fromItemId && segment.toItemId === toItemId,
  );
}

/**
 * 이동 구간을 분석하여 이동시간 부족 여부를 판정한다
 * @param prevItem - 선행 일정 항목
 * @param nextItem - 후행 일정 항목
 * @param segment - 해당 구간의 TravelSegment (없으면 undefined)
 * @returns 이동 구간 분석 결과
 */
export function analyzeTravelSegment(
  prevItem: ScheduleItem,
  nextItem: ScheduleItem,
  segment: TravelSegment | undefined,
): TravelAnalysisResult {
  // segment가 없으면 데이터 미존재 상태 반환
  if (!segment) {
    return {
      hasData: false,
      segment: null,
      hasTravelTimeShortage: false,
      availableMinutes: 0,
      requiredMinutes: 0,
    };
  }

  // 빈 시간 계산: 후행 항목 시작시간 - 선행 항목 종료시간
  const availableMinutes = timeToMinutes(nextItem.startTime) - timeToMinutes(prevItem.endTime);
  const requiredMinutes = segment.durationMinutes;

  // 이동시간 부족 여부: 필요 시간 > 가용 시간
  const hasTravelTimeShortage = requiredMinutes > availableMinutes;

  return {
    hasData: true,
    segment,
    hasTravelTimeShortage,
    availableMinutes,
    requiredMinutes,
  };
}

/**
 * 일자별 총 이동시간과 비용을 집계한다
 * @param segments - 해당 일자의 TravelSegment 배열
 * @returns 이동 요약 (총 이동시간, 총 비용, 구간 수)
 */
export function calculateDailyTravelSummary(segments: TravelSegment[]): TravelSummary {
  const totalDurationMinutes = segments.reduce(
    (sum, segment) => sum + segment.durationMinutes,
    0,
  );
  const totalCost = segments.reduce((sum, segment) => sum + segment.cost, 0);

  return {
    totalDurationMinutes,
    totalCost,
    segmentCount: segments.length,
  };
}
