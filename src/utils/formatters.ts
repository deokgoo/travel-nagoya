/**
 * 비용을 "¥1,234" 형식으로 포맷팅
 * @param amount - 0 이상의 정수 (엔화 단위)
 * @returns "¥" 접두사와 천 단위 구분 기호를 포함한 문자열
 */
export function formatCost(amount: number): string {
  return `¥${amount.toLocaleString('en-US')}`;
}

/**
 * 시간을 "HH:MM" 형식으로 표시
 * 이미 "HH:mm" 형식인 문자열을 그대로 반환
 * @param time - "HH:mm" 형식의 시간 문자열
 * @returns "HH:MM" 형식의 시간 문자열
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * 분을 "Xh Ym" 또는 "Ym" 형식으로 표시
 * @param minutes - 분 단위 숫자 (0 이상)
 * @returns 시간과 분을 포함한 포맷 문자열
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}
