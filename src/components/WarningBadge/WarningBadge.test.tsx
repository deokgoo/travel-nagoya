import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WarningBadge } from './WarningBadge';

describe('WarningBadge', () => {
  it('renders error type with correct message and icon', () => {
    render(<WarningBadge type="error" message="시간 충돌" />);
    expect(screen.getByText('시간 충돌')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders warning type with correct message and icon', () => {
    render(<WarningBadge type="warning" message="영업시간 외" />);
    expect(screen.getByText('영업시간 외')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders info type with correct message and icon', () => {
    render(<WarningBadge type="info" message="사전 예약 필수" />);
    expect(screen.getByText('사전 예약 필수')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('renders unknown type with correct message and icon', () => {
    render(<WarningBadge type="unknown" message="영업정보 미확인" />);
    expect(screen.getByText('영업정보 미확인')).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<WarningBadge type="error" message="휴무일" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('hides icon from screen readers with aria-hidden', () => {
    render(<WarningBadge type="warning" message="이동시간 부족" />);
    const icon = screen.getByText('⚠️');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
