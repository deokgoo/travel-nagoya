export type TransportMode = '전철' | '도보' | '버스';

export interface TravelSegment {
  fromItemId: string;
  toItemId: string;
  mode: TransportMode;
  durationMinutes: number; // 양의 정수
  cost: number; // 0 이상 정수, 엔화 단위
}
