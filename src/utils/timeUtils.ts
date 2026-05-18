import type { DayOfWeek } from '@/types/businessHours';

/**
 * "HH:mm" 문자열을 분 단위 숫자로 변환
 * @param time - "HH:mm" 형식의 시간 문자열 (예: "14:30")
 * @returns 자정부터의 분 단위 숫자 (예: 870)
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 두 시간 사이의 차이를 분 단위로 계산
 * @param startTime - 시작 시간 "HH:mm" 형식
 * @param endTime - 종료 시간 "HH:mm" 형식
 * @returns 분 단위 차이 (endTime - startTime)
 */
export function getTimeDifferenceMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * YYYY-MM-DD 날짜 문자열에서 요일을 DayOfWeek로 반환
 * @param dateStr - "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns DayOfWeek ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')
 */
export function getDayOfWeek(dateStr: string): DayOfWeek {
  const [year, month, day] = dateStr.split('-').map(Number);
  // UTC 기준으로 날짜를 생성하여 타임존 이슈 방지
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = date.getUTCDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[dayIndex];
}

/**
 * 분 단위 숫자를 "HH:mm" 문자열로 변환
 * @param minutes - 자정부터의 분 단위 숫자
 * @returns "HH:mm" 형식의 시간 문자열
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
