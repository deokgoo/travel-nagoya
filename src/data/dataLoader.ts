import type { ScheduleItem } from '@/types/schedule';
import type { BusinessHoursData } from '@/types/businessHours';
import type { TravelSegment } from '@/types/travel';
import type { ValidationResult, ValidationError } from '@/types/common';

import scheduleRaw from './schedule.json';
import businessHoursRaw from './businessHours.json';
import travelSegmentsRaw from './travelSegments.json';

import {
  validateScheduleItems,
  validateBusinessHours,
  validateTravelSegments,
} from './dataValidator';

/**
 * 일정 데이터를 로드하고 검증한다.
 * 검증 에러가 있으면 콘솔에 경고를 출력한다.
 */
export function loadScheduleData(): ValidationResult<ScheduleItem[]> {
  const result = validateScheduleItems(scheduleRaw as unknown[]);

  if (result.errors.length > 0) {
    console.warn(
      '[DataLoader] 일정 데이터 검증 에러:',
      result.errors
    );
  }

  return result;
}

/**
 * 영업시간 데이터를 로드하고 검증한다.
 * 검증 에러가 있으면 콘솔에 경고를 출력한다.
 */
export function loadBusinessHoursData(): ValidationResult<BusinessHoursData[]> {
  const result = validateBusinessHours(businessHoursRaw as unknown[]);

  if (result.errors.length > 0) {
    console.warn(
      '[DataLoader] 영업시간 데이터 검증 에러:',
      result.errors
    );
  }

  return result;
}

/**
 * 이동 구간 데이터를 로드하고 검증한다.
 * 검증 에러가 있으면 콘솔에 경고를 출력한다.
 */
export function loadTravelSegmentData(): ValidationResult<TravelSegment[]> {
  const result = validateTravelSegments(travelSegmentsRaw as unknown[]);

  if (result.errors.length > 0) {
    console.warn(
      '[DataLoader] 이동 구간 데이터 검증 에러:',
      result.errors
    );
  }

  return result;
}

/**
 * 모든 데이터를 한 번에 로드하고 검증한다.
 * 검증된 데이터와 전체 에러 목록을 반환한다.
 */
export function loadAllData(): {
  scheduleItems: ScheduleItem[];
  businessHours: BusinessHoursData[];
  travelSegments: TravelSegment[];
  errors: ValidationError[];
} {
  const scheduleResult = loadScheduleData();
  const businessHoursResult = loadBusinessHoursData();
  const travelSegmentsResult = loadTravelSegmentData();

  const errors: ValidationError[] = [
    ...scheduleResult.errors,
    ...businessHoursResult.errors,
    ...travelSegmentsResult.errors,
  ];

  return {
    scheduleItems: scheduleResult.data,
    businessHours: businessHoursResult.data,
    travelSegments: travelSegmentsResult.data,
    errors,
  };
}
