import type { ScheduleItem, Category } from '@/types/schedule';
import type { BusinessHoursData, DayOfWeek } from '@/types/businessHours';
import type { TravelSegment, TransportMode } from '@/types/travel';
import type { ValidationResult, ValidationError } from '@/types/common';

const VALID_CATEGORIES: Category[] = ['식사', '관광', '쇼핑', '이동'];
const VALID_DAYS_OF_WEEK: DayOfWeek[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];
const VALID_TRANSPORT_MODES: TransportMode[] = ['전철', '도보', '버스'];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function validateScheduleItems(
  raw: unknown[]
): ValidationResult<ScheduleItem[]> {
  const data: ScheduleItem[] = [];
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const itemErrors: ValidationError[] = [];
    const itemId = isNonNullObject(item) && isString(item.id) ? item.id : `index-${i}`;

    if (!isNonNullObject(item)) {
      errors.push({
        field: 'item',
        message: '항목이 객체가 아닙니다',
        itemId,
      });
      continue;
    }

    // 필수 필드 존재 검증
    if (!isString(item.id) || item.id.trim() === '') {
      itemErrors.push({
        field: 'id',
        message: 'id 필드가 누락되었거나 빈 문자열입니다',
        itemId,
      });
    }

    if (!isString(item.date)) {
      itemErrors.push({
        field: 'date',
        message: 'date 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (!DATE_REGEX.test(item.date)) {
      itemErrors.push({
        field: 'date',
        message: 'date 형식이 올바르지 않습니다 (YYYY-MM-DD)',
        itemId,
      });
    }

    if (!isString(item.startTime)) {
      itemErrors.push({
        field: 'startTime',
        message: 'startTime 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (!TIME_REGEX.test(item.startTime)) {
      itemErrors.push({
        field: 'startTime',
        message: 'startTime 형식이 올바르지 않습니다 (HH:mm)',
        itemId,
      });
    }

    if (!isString(item.endTime)) {
      itemErrors.push({
        field: 'endTime',
        message: 'endTime 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (!TIME_REGEX.test(item.endTime)) {
      itemErrors.push({
        field: 'endTime',
        message: 'endTime 형식이 올바르지 않습니다 (HH:mm)',
        itemId,
      });
    }

    if (!isString(item.placeName)) {
      itemErrors.push({
        field: 'placeName',
        message: 'placeName 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (item.placeName.length > 50) {
      itemErrors.push({
        field: 'placeName',
        message: 'placeName은 최대 50자까지 허용됩니다',
        itemId,
      });
    }

    if (!isString(item.category)) {
      itemErrors.push({
        field: 'category',
        message: 'category 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (!VALID_CATEGORIES.includes(item.category as Category)) {
      itemErrors.push({
        field: 'category',
        message: `category가 유효하지 않습니다 (허용: ${VALID_CATEGORIES.join(', ')})`,
        itemId,
      });
    }

    if (!isNonNegativeInteger(item.estimatedCost)) {
      itemErrors.push({
        field: 'estimatedCost',
        message: 'estimatedCost는 0 이상의 정수여야 합니다',
        itemId,
      });
    }

    if (!isString(item.memo)) {
      itemErrors.push({
        field: 'memo',
        message: 'memo 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (item.memo.length > 200) {
      itemErrors.push({
        field: 'memo',
        message: 'memo는 최대 200자까지 허용됩니다',
        itemId,
      });
    }

    // 중복 ID 검증
    if (isString(item.id) && item.id.trim() !== '') {
      if (seenIds.has(item.id)) {
        itemErrors.push({
          field: 'id',
          message: `중복된 id입니다: ${item.id}`,
          itemId,
        });
      } else {
        seenIds.add(item.id);
      }
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    } else {
      data.push(item as unknown as ScheduleItem);
    }
  }

  return { data, errors };
}

export function validateBusinessHours(
  raw: unknown[]
): ValidationResult<BusinessHoursData[]> {
  const data: BusinessHoursData[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const itemErrors: ValidationError[] = [];
    const itemId =
      isNonNullObject(item) && isString(item.placeName)
        ? item.placeName
        : `index-${i}`;

    if (!isNonNullObject(item)) {
      errors.push({
        field: 'item',
        message: '항목이 객체가 아닙니다',
        itemId,
      });
      continue;
    }

    // placeName 검증
    if (!isString(item.placeName) || item.placeName.trim() === '') {
      itemErrors.push({
        field: 'placeName',
        message: 'placeName 필드가 누락되었거나 빈 문자열입니다',
        itemId,
      });
    }

    // hours 검증
    if (!isNonNullObject(item.hours)) {
      itemErrors.push({
        field: 'hours',
        message: 'hours 필드가 누락되었거나 객체가 아닙니다',
        itemId,
      });
    } else {
      // 각 요일의 영업시간 형식 검증
      for (const key of Object.keys(item.hours)) {
        if (!VALID_DAYS_OF_WEEK.includes(key as DayOfWeek)) {
          itemErrors.push({
            field: `hours.${key}`,
            message: `유효하지 않은 요일 키입니다: ${key}`,
            itemId,
          });
          continue;
        }

        const dayHours = (item.hours as Record<string, unknown>)[key];
        if (!isNonNullObject(dayHours)) {
          itemErrors.push({
            field: `hours.${key}`,
            message: `hours.${key}가 객체가 아닙니다`,
            itemId,
          });
          continue;
        }

        if (!isString(dayHours.open) || !TIME_REGEX.test(dayHours.open)) {
          itemErrors.push({
            field: `hours.${key}.open`,
            message: `hours.${key}.open 형식이 올바르지 않습니다 (HH:mm)`,
            itemId,
          });
        }

        if (!isString(dayHours.close) || !TIME_REGEX.test(dayHours.close)) {
          itemErrors.push({
            field: `hours.${key}.close`,
            message: `hours.${key}.close 형식이 올바르지 않습니다 (HH:mm)`,
            itemId,
          });
        }
      }
    }

    // closedDays 검증
    if (!Array.isArray(item.closedDays)) {
      itemErrors.push({
        field: 'closedDays',
        message: 'closedDays 필드가 누락되었거나 배열이 아닙니다',
        itemId,
      });
    } else {
      for (const day of item.closedDays) {
        if (!isString(day) || !VALID_DAYS_OF_WEEK.includes(day as DayOfWeek)) {
          itemErrors.push({
            field: 'closedDays',
            message: `유효하지 않은 요일입니다: ${String(day)}`,
            itemId,
          });
        }
      }
    }

    // notes 검증
    if (!isString(item.notes)) {
      itemErrors.push({
        field: 'notes',
        message: 'notes 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (item.notes.length > 100) {
      itemErrors.push({
        field: 'notes',
        message: 'notes는 최대 100자까지 허용됩니다',
        itemId,
      });
    }

    // recommendedStayMinutes 검증
    if (!isPositiveInteger(item.recommendedStayMinutes)) {
      itemErrors.push({
        field: 'recommendedStayMinutes',
        message: 'recommendedStayMinutes는 양의 정수여야 합니다',
        itemId,
      });
    }

    // requiresReservation 검증
    if (typeof item.requiresReservation !== 'boolean') {
      itemErrors.push({
        field: 'requiresReservation',
        message: 'requiresReservation 필드가 누락되었거나 boolean이 아닙니다',
        itemId,
      });
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    } else {
      data.push(item as unknown as BusinessHoursData);
    }
  }

  return { data, errors };
}

export function validateTravelSegments(
  raw: unknown[]
): ValidationResult<TravelSegment[]> {
  const data: TravelSegment[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const itemErrors: ValidationError[] = [];
    const itemId =
      isNonNullObject(item) && isString(item.fromItemId) && isString(item.toItemId)
        ? `${item.fromItemId}->${item.toItemId}`
        : `index-${i}`;

    if (!isNonNullObject(item)) {
      errors.push({
        field: 'item',
        message: '항목이 객체가 아닙니다',
        itemId,
      });
      continue;
    }

    // fromItemId 검증
    if (!isString(item.fromItemId) || item.fromItemId.trim() === '') {
      itemErrors.push({
        field: 'fromItemId',
        message: 'fromItemId 필드가 누락되었거나 빈 문자열입니다',
        itemId,
      });
    }

    // toItemId 검증
    if (!isString(item.toItemId) || item.toItemId.trim() === '') {
      itemErrors.push({
        field: 'toItemId',
        message: 'toItemId 필드가 누락되었거나 빈 문자열입니다',
        itemId,
      });
    }

    // mode 검증
    if (!isString(item.mode)) {
      itemErrors.push({
        field: 'mode',
        message: 'mode 필드가 누락되었거나 문자열이 아닙니다',
        itemId,
      });
    } else if (!VALID_TRANSPORT_MODES.includes(item.mode as TransportMode)) {
      itemErrors.push({
        field: 'mode',
        message: `mode가 유효하지 않습니다 (허용: ${VALID_TRANSPORT_MODES.join(', ')})`,
        itemId,
      });
    }

    // durationMinutes 검증 (양의 정수)
    if (!isPositiveInteger(item.durationMinutes)) {
      itemErrors.push({
        field: 'durationMinutes',
        message: 'durationMinutes는 양의 정수여야 합니다',
        itemId,
      });
    }

    // cost 검증 (0 이상 정수)
    if (!isNonNegativeInteger(item.cost)) {
      itemErrors.push({
        field: 'cost',
        message: 'cost는 0 이상의 정수여야 합니다',
        itemId,
      });
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    } else {
      data.push(item as unknown as TravelSegment);
    }
  }

  return { data, errors };
}
