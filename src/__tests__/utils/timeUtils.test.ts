import { describe, it, expect } from 'vitest';
import { timeToMinutes, getTimeDifferenceMinutes, getDayOfWeek, minutesToTime } from '@/utils/timeUtils';

describe('timeToMinutes', () => {
  it('should convert midnight to 0', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('should convert 01:00 to 60', () => {
    expect(timeToMinutes('01:00')).toBe(60);
  });

  it('should convert 14:30 to 870', () => {
    expect(timeToMinutes('14:30')).toBe(870);
  });

  it('should convert 23:59 to 1439', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('should convert 09:00 to 540', () => {
    expect(timeToMinutes('09:00')).toBe(540);
  });
});

describe('getTimeDifferenceMinutes', () => {
  it('should calculate difference between two times', () => {
    expect(getTimeDifferenceMinutes('09:00', '10:30')).toBe(90);
  });

  it('should return 0 for same times', () => {
    expect(getTimeDifferenceMinutes('12:00', '12:00')).toBe(0);
  });

  it('should handle crossing noon', () => {
    expect(getTimeDifferenceMinutes('11:30', '13:00')).toBe(90);
  });

  it('should return negative for reversed times', () => {
    expect(getTimeDifferenceMinutes('14:00', '09:00')).toBe(-300);
  });
});

describe('getDayOfWeek', () => {
  it('should return correct day for 2025-05-21 (Wednesday)', () => {
    expect(getDayOfWeek('2025-05-21')).toBe('wed');
  });

  it('should return correct day for 2025-05-22 (Thursday)', () => {
    expect(getDayOfWeek('2025-05-22')).toBe('thu');
  });

  it('should return correct day for 2025-05-23 (Friday)', () => {
    expect(getDayOfWeek('2025-05-23')).toBe('fri');
  });

  it('should return correct day for 2025-05-24 (Saturday)', () => {
    expect(getDayOfWeek('2025-05-24')).toBe('sat');
  });

  it('should return correct day for a Sunday', () => {
    expect(getDayOfWeek('2025-05-25')).toBe('sun');
  });

  it('should return correct day for a Monday', () => {
    expect(getDayOfWeek('2025-05-19')).toBe('mon');
  });
});

describe('minutesToTime', () => {
  it('should convert 0 to 00:00', () => {
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('should convert 60 to 01:00', () => {
    expect(minutesToTime(60)).toBe('01:00');
  });

  it('should convert 870 to 14:30', () => {
    expect(minutesToTime(870)).toBe('14:30');
  });

  it('should convert 1439 to 23:59', () => {
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('should pad single digit hours and minutes', () => {
    expect(minutesToTime(65)).toBe('01:05');
  });
});
