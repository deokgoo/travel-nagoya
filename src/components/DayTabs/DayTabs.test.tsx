import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DayTabs } from './DayTabs';
import type { DayInfo } from '../../types/app';

const mockDays: DayInfo[] = [
  { date: '2025-05-21', dayNumber: 1, label: '1일차 (5/21)' },
  { date: '2025-05-22', dayNumber: 2, label: '2일차 (5/22)' },
  { date: '2025-05-23', dayNumber: 3, label: '3일차 (5/23)' },
  { date: '2025-05-24', dayNumber: 4, label: '4일차 (5/24)' },
];

describe('DayTabs', () => {
  it('renders all day tabs', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{}}
        onDaySelect={() => {}}
      />,
    );

    expect(screen.getByText('1일차 (5/21)')).toBeInTheDocument();
    expect(screen.getByText('2일차 (5/22)')).toBeInTheDocument();
    expect(screen.getByText('3일차 (5/23)')).toBeInTheDocument();
    expect(screen.getByText('4일차 (5/24)')).toBeInTheDocument();
  });

  it('marks the selected tab with aria-selected', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-22"
        warningCounts={{}}
        onDaySelect={() => {}}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[3]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onDaySelect when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onDaySelect = vi.fn();

    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{}}
        onDaySelect={onDaySelect}
      />,
    );

    await user.click(screen.getByText('3일차 (5/23)'));
    expect(onDaySelect).toHaveBeenCalledWith('2025-05-23');
  });

  it('displays warning count badge when count > 0', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{ '2025-05-21': 3, '2025-05-23': 1 }}
        onDaySelect={() => {}}
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not display badge when warning count is 0', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{ '2025-05-21': 0 }}
        onDaySelect={() => {}}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    // The first tab should not have a badge child with "0"
    expect(tabs[0]).not.toHaveTextContent('0');
  });

  it('has accessible navigation landmark', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{}}
        onDaySelect={() => {}}
      />,
    );

    expect(
      screen.getByRole('navigation', { name: '일자 탭 네비게이션' }),
    ).toBeInTheDocument();
  });

  it('includes warning count in aria-label for accessibility', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{ '2025-05-22': 2 }}
        onDaySelect={() => {}}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute(
      'aria-label',
      '2일차 (5/22), 경고 2건',
    );
  });

  it('renders tab buttons with role="tablist" container', () => {
    render(
      <DayTabs
        days={mockDays}
        selectedDay="2025-05-21"
        warningCounts={{}}
        onDaySelect={() => {}}
      />,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });
});
