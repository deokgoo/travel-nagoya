import { describe, it, expect } from 'vitest';
import { formatCost, formatTime, formatDuration } from '@/utils/formatters';

describe('formatCost', () => {
  it('should format 0 as ¥0', () => {
    expect(formatCost(0)).toBe('¥0');
  });

  it('should format small numbers without comma', () => {
    expect(formatCost(500)).toBe('¥500');
  });

  it('should format numbers with thousand separator', () => {
    expect(formatCost(1234)).toBe('¥1,234');
  });

  it('should format large numbers with multiple separators', () => {
    expect(formatCost(1234567)).toBe('¥1,234,567');
  });

  it('should format exact thousands', () => {
    expect(formatCost(1000)).toBe('¥1,000');
  });
});

describe('formatTime', () => {
  it('should return time string as-is', () => {
    expect(formatTime('09:00')).toBe('09:00');
  });

  it('should handle afternoon times', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });

  it('should handle midnight', () => {
    expect(formatTime('00:00')).toBe('00:00');
  });
});

describe('formatDuration', () => {
  it('should format minutes only when less than 60', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('should format hours only when exact hours', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('should handle 0 minutes', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('should handle large durations', () => {
    expect(formatDuration(150)).toBe('2h 30m');
  });
});
