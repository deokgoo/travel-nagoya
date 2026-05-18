export type Category = '식사' | '관광' | '쇼핑' | '이동';

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24시간제)
  endTime: string; // HH:mm (24시간제)
  placeName: string; // 최대 50자
  category: Category;
  estimatedCost: number; // 0 이상 정수, 엔화 단위
  memo: string; // 최대 200자
}
