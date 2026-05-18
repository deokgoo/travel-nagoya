import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TravelSegmentCard } from './TravelSegmentCard';
import type { TravelSegment } from '../../types/travel';
import type { Warning } from '../../types/warning';

describe('TravelSegmentCard', () => {
  const mockSegment: TravelSegment = {
    fromItemId: 'day1-01',
    toItemId: 'day1-02',
    mode: '전철',
    durationMinutes: 15,
    cost: 210,
  };

  it('renders transport mode icon, duration, and cost for a segment', () => {
    render(<TravelSegmentCard segment={mockSegment} warnings={[]} />);
    expect(screen.getByText('🚃')).toBeInTheDocument();
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('¥210')).toBeInTheDocument();
  });

  it('renders walking mode icon correctly', () => {
    const walkSegment: TravelSegment = {
      fromItemId: 'day1-02',
      toItemId: 'day1-03',
      mode: '도보',
      durationMinutes: 5,
      cost: 0,
    };
    render(<TravelSegmentCard segment={walkSegment} warnings={[]} />);
    expect(screen.getByText('🚶')).toBeInTheDocument();
    expect(screen.getByText('5m')).toBeInTheDocument();
  });

  it('renders bus mode icon correctly', () => {
    const busSegment: TravelSegment = {
      fromItemId: 'day1-03',
      toItemId: 'day1-04',
      mode: '버스',
      durationMinutes: 20,
      cost: 230,
    };
    render(<TravelSegmentCard segment={busSegment} warnings={[]} />);
    expect(screen.getByText('🚌')).toBeInTheDocument();
    expect(screen.getByText('20m')).toBeInTheDocument();
    expect(screen.getByText('¥230')).toBeInTheDocument();
  });

  it('does not display cost when cost is 0', () => {
    const freeSegment: TravelSegment = {
      fromItemId: 'day1-01',
      toItemId: 'day1-02',
      mode: '도보',
      durationMinutes: 10,
      cost: 0,
    };
    render(<TravelSegmentCard segment={freeSegment} warnings={[]} />);
    expect(screen.queryByText('¥0')).not.toBeInTheDocument();
  });

  it('shows "이동정보 미등록" when segment is null', () => {
    render(<TravelSegmentCard segment={null} warnings={[]} />);
    expect(screen.getByText('이동정보 미등록')).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('shows travel-time-shortage warning when present', () => {
    const warning: Warning = {
      id: 'w1',
      type: 'travel-time-shortage',
      level: 'warning',
      message: '이동시간 부족',
      targetItemIds: ['day1-01', 'day1-02'],
      dayDate: '2025-05-21',
    };
    render(<TravelSegmentCard segment={mockSegment} warnings={[warning]} />);
    expect(screen.getByText('이동시간 부족')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('does not show warning badge when no travel-time-shortage warning', () => {
    const otherWarning: Warning = {
      id: 'w2',
      type: 'time-conflict',
      level: 'error',
      message: '시간 충돌',
      targetItemIds: ['day1-01'],
      dayDate: '2025-05-21',
    };
    render(<TravelSegmentCard segment={mockSegment} warnings={[otherWarning]} />);
    expect(screen.queryByText('시간 충돌')).not.toBeInTheDocument();
  });

  it('has accessible label for the container', () => {
    render(<TravelSegmentCard segment={mockSegment} warnings={[]} />);
    expect(screen.getByLabelText('이동 구간')).toBeInTheDocument();
  });
});
