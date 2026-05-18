import { useMemo } from 'react';
import { useAppState, useSelectedDayData } from '@/state/AppContext';
import { Layout } from '@/components/Layout/Layout';
import { DayTabs } from '@/components/DayTabs/DayTabs';
import { TimelineView } from '@/components/TimelineView/TimelineView';
import { CostSummaryView } from '@/components/CostSummaryView/CostSummaryView';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { validateSchedule } from '@/logic/scheduleValidator';
import { calculateDailyCosts, calculateTotalCosts } from '@/logic/costCalculator';
import { calculateDailyTravelSummary } from '@/logic/routeAnalyzer';

export function AppContent() {
  const { state, dispatch } = useAppState();
  const { items, segments, warnings, businessHoursResults } = useSelectedDayData();

  // 모든 일자에 대한 경고 카운트 계산
  const warningCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const day of state.days) {
      const dayItems = state.scheduleItems.filter((item) => item.date === day.date);
      const daySegments = state.travelSegments.filter((seg) => {
        const fromItem = state.scheduleItems.find((item) => item.id === seg.fromItemId);
        return fromItem?.date === day.date;
      });
      const dayWarnings = validateSchedule(dayItems, daySegments, state.businessHours);
      counts[day.date] = dayWarnings.length;
    }
    return counts;
  }, [state.days, state.scheduleItems, state.travelSegments, state.businessHours]);

  // 모든 일자에 대한 비용 계산
  const { dailyCosts, totalCost } = useMemo(() => {
    const allDailyCosts = state.days.map((day) => {
      const dayItems = state.scheduleItems.filter((item) => item.date === day.date);
      const daySegments = state.travelSegments.filter((seg) => {
        const fromItem = state.scheduleItems.find((item) => item.id === seg.fromItemId);
        return fromItem?.date === day.date;
      });
      return calculateDailyCosts(dayItems, daySegments);
    });
    const total = calculateTotalCosts(allDailyCosts);
    return { dailyCosts: allDailyCosts, totalCost: total.grandTotal };
  }, [state.days, state.scheduleItems, state.travelSegments]);

  // 선택된 일자의 이동 요약 계산
  const travelSummary = useMemo(() => {
    return calculateDailyTravelSummary(segments);
  }, [segments]);

  // 선택된 일자의 라벨
  const selectedDayLabel = useMemo(() => {
    const dayInfo = state.days.find((d) => d.date === state.selectedDate);
    return dayInfo?.label ?? '';
  }, [state.days, state.selectedDate]);

  const handleDaySelect = (date: string) => {
    dispatch({ type: 'SELECT_DAY', payload: date });
  };

  return (
    <Layout
      dayTabs={
        <DayTabs
          days={state.days}
          selectedDay={state.selectedDate}
          warningCounts={warningCounts}
          onDaySelect={handleDaySelect}
        />
      }
      sidebar={
        <Sidebar
          travelSummary={travelSummary}
          warnings={warnings}
          dayLabel={selectedDayLabel}
        />
      }
    >
      <TimelineView
        scheduleItems={items}
        travelSegments={segments}
        warnings={warnings}
        businessHoursResults={businessHoursResults}
      />
      <CostSummaryView dailyCosts={dailyCosts} totalCost={totalCost} />
    </Layout>
  );
}
