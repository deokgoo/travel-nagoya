import type { ScheduleItem } from '@/types/schedule';
import type { BusinessHoursData, DayOfWeek } from '@/types/businessHours';
import type { BusinessHoursCheckResult } from '@/types/common';
import { getDayOfWeek, timeToMinutes } from '@/utils/timeUtils';

/**
 * 방문 요일이 휴무일 목록에 포함되는지 확인
 * @param date - "YYYY-MM-DD" 형식의 날짜 문자열
 * @param closedDays - 휴무 요일 배열
 * @returns 휴무일이면 true
 */
export function isClosedDay(date: string, closedDays: DayOfWeek[]): boolean {
  const dayOfWeek = getDayOfWeek(date);
  return closedDays.includes(dayOfWeek);
}

/**
 * 방문 시간이 영업시간 범위 밖인지 확인
 * @param startTime - 방문 시작시간 "HH:mm"
 * @param endTime - 방문 종료시간 "HH:mm"
 * @param openTime - 영업 시작시간 "HH:mm"
 * @param closeTime - 영업 종료시간 "HH:mm"
 * @returns 영업시간 범위 밖이면 true
 */
export function isOutsideBusinessHours(
  startTime: string,
  endTime: string,
  openTime: string,
  closeTime: string,
): boolean {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  return startMinutes < openMinutes || endMinutes > closeMinutes;
}

/**
 * 장소명으로 영업시간 데이터를 조회하고, 요일 매칭 및 상태를 판정
 * @param item - 일정 항목
 * @param date - "YYYY-MM-DD" 형식의 날짜 문자열
 * @param hoursData - 영업시간 데이터 배열
 * @returns 영업시간 체크 결과
 */
export function checkBusinessHours(
  item: ScheduleItem,
  date: string,
  hoursData: BusinessHoursData[],
): BusinessHoursCheckResult {
  // 1. 장소명으로 영업시간 데이터 조회
  const placeData = hoursData.find((h) => h.placeName === item.placeName);

  // 2. 데이터 미존재 → 'unknown'
  if (!placeData) {
    return {
      status: 'unknown',
      hoursDisplay: null,
      notes: null,
      requiresReservation: false,
    };
  }

  // 3. 요일 계산
  const dayOfWeek = getDayOfWeek(date);

  // 4. 휴무일 확인 → 'closed-day' (영업시간 외 경고 미생성)
  if (isClosedDay(date, placeData.closedDays)) {
    return {
      status: 'closed-day',
      hoursDisplay: null,
      notes: placeData.notes || null,
      requiresReservation: placeData.requiresReservation,
    };
  }

  // 5. 해당 요일의 영업시간 조회
  const dailyHours = placeData.hours[dayOfWeek];

  // 해당 요일에 영업시간 데이터가 없으면 'unknown'
  if (!dailyHours) {
    return {
      status: 'unknown',
      hoursDisplay: null,
      notes: placeData.notes || null,
      requiresReservation: placeData.requiresReservation,
    };
  }

  const hoursDisplay = `${dailyHours.open}~${dailyHours.close}`;

  // 6. 영업시간 외 확인
  if (isOutsideBusinessHours(item.startTime, item.endTime, dailyHours.open, dailyHours.close)) {
    return {
      status: 'outside-hours',
      hoursDisplay,
      notes: placeData.notes || null,
      requiresReservation: placeData.requiresReservation,
    };
  }

  // 7. 정상 영업 중
  return {
    status: 'open',
    hoursDisplay,
    notes: placeData.notes || null,
    requiresReservation: placeData.requiresReservation,
  };
}
