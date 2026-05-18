import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TravelSummary } from '../../types/common';
import type { Warning } from '../../types/warning';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  const defaultSummary: TravelSummary = {
    totalDurationMinutes: 95,
    totalCost: 1260,
    segmentCount: 4,
  };

  const defaultWarnings: Warning[] = [
    {
      id: 'w1',
      type: 'time-conflict',
      level: 'error',
      message: '시간 충돌: 나고야성 ↔ 오스 상점가',
      targetItemIds: ['day1-01', 'day1-02'],
      dayDate: '2025-05-21',
    },
    {
      id: 'w2',
      type: 'outside-hours',
      level: 'warning',
      message: '영업시간 외: 아츠타 신궁',
      targetItemIds: ['day1-03'],
      dayDate: '2025-05-21',
    },
  ];

  it('renders travel summary section with formatted values', () => {
    render(
      <Sidebar travelSummary={defaultSummary} warnings={[]} dayLabel="1일차 (5/21)" />
    );

    expect(screen.getByText('이동 요약')).toBeInTheDocument();
    expect(screen.getByText('1일차 (5/21)')).toBeInTheDocument();
    expect(screen.getByText('총 이동시간')).toBeInTheDocument();
    expect(screen.getByText('1h 35m')).toBeInTheDocument();
    expect(screen.getByText('총 이동비용')).toBeInTheDocument();
    expect(screen.getByText('¥1,260')).toBeInTheDocument();
    expect(screen.getByText('이동 구간 수')).toBeInTheDocument();
    expect(screen.getByText('4구간')).toBeInTheDocument();
  });

  it('renders warning list with WarningBadge for each warning', () => {
    render(
      <Sidebar
        travelSummary={defaultSummary}
        warnings={defaultWarnings}
        dayLabel="1일차 (5/21)"
      />
    );

    expect(screen.getByText('경고 목록')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // warning count badge
    expect(screen.getByText('시간 충돌: 나고야성 ↔ 오스 상점가')).toBeInTheDocument();
    expect(screen.getByText('영업시간 외: 아츠타 신궁')).toBeInTheDocument();
  });

  it('shows "경고 없음 ✅" when there are no warnings', () => {
    render(
      <Sidebar travelSummary={defaultSummary} warnings={[]} dayLabel="2일차 (5/22)" />
    );

    expect(screen.getByText('경고 없음 ✅')).toBeInTheDocument();
  });

  it('renders correct duration format for hours only', () => {
    const summary: TravelSummary = {
      totalDurationMinutes: 60,
      totalCost: 500,
      segmentCount: 2,
    };

    render(<Sidebar travelSummary={summary} warnings={[]} dayLabel="3일차 (5/23)" />);

    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('renders correct duration format for minutes only', () => {
    const summary: TravelSummary = {
      totalDurationMinutes: 25,
      totalCost: 0,
      segmentCount: 1,
    };

    render(<Sidebar travelSummary={summary} warnings={[]} dayLabel="4일차 (5/24)" />);

    expect(screen.getByText('25m')).toBeInTheDocument();
    expect(screen.getByText('¥0')).toBeInTheDocument();
  });
});
