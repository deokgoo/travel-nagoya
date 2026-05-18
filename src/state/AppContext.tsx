/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { AppState, DayInfo } from '@/types/app';
import type { Warning } from '@/types/warning';
import type { BusinessHoursCheckResult } from '@/types/common';
import type { ScheduleItem } from '@/types/schedule';
import type { TravelSegment } from '@/types/travel';
import type { BusinessHoursData } from '@/types/businessHours';
import { loadAllData } from '@/data/dataLoader';
import { validateSchedule } from '@/logic/scheduleValidator';
import { checkBusinessHours } from '@/logic/businessHoursChecker';

// --- Constants ---

const DAYS: DayInfo[] = [
  { date: '2025-05-21', dayNumber: 1, label: '1일차 (5/21)' },
  { date: '2025-05-22', dayNumber: 2, label: '2일차 (5/22)' },
  { date: '2025-05-23', dayNumber: 3, label: '3일차 (5/23)' },
  { date: '2025-05-24', dayNumber: 4, label: '4일차 (5/24)' },
];

// --- Actions ---

type AppAction = { type: 'SELECT_DAY'; payload: string };

// --- Reducer ---

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_DAY': {
      const selectedDate = action.payload;
      const warnings = calculateWarningsForDay(
        selectedDate,
        state.scheduleItems,
        state.travelSegments,
        state.businessHours,
      );
      return {
        ...state,
        selectedDate,
        warnings,
      };
    }
    default:
      return state;
  }
}

// --- Helper Functions ---

/**
 * 특정 일자의 일정에 대해 검증을 수행하여 경고 목록을 반환한다.
 */
function calculateWarningsForDay(
  date: string,
  scheduleItems: ScheduleItem[],
  travelSegments: TravelSegment[],
  businessHours: BusinessHoursData[],
): Warning[] {
  const dayItems = scheduleItems.filter((item) => item.date === date);
  const daySegments = travelSegments.filter((seg) => {
    const fromItem = scheduleItems.find((item) => item.id === seg.fromItemId);
    return fromItem?.date === date;
  });

  return validateSchedule(dayItems, daySegments, businessHours);
}

/**
 * 초기 상태를 생성한다.
 * DataLoader로 데이터를 로드하고, 1일차를 선택한 상태로 시작한다.
 */
function createInitialState(): AppState {
  const { scheduleItems, businessHours, travelSegments, errors } = loadAllData();

  const selectedDate = DAYS[0].date;
  const warnings = calculateWarningsForDay(
    selectedDate,
    scheduleItems,
    travelSegments,
    businessHours,
  );

  return {
    days: DAYS,
    selectedDate,
    scheduleItems,
    businessHours,
    travelSegments,
    warnings,
    loadErrors: errors,
  };
}

// --- Context ---

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// --- Provider ---

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- Custom Hooks ---

/**
 * 전체 AppState와 dispatch를 반환하는 커스텀 훅.
 */
export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

/**
 * 선택된 일자의 데이터를 필터링하여 반환하는 커스텀 훅.
 * - items: 해당 일자의 일정 항목 (시간순 정렬)
 * - segments: 해당 일자의 이동 구간
 * - warnings: 해당 일자의 경고 목록
 * - businessHoursResults: 각 일정 항목의 영업시간 체크 결과
 */
export function useSelectedDayData() {
  const { state } = useAppState();

  return useMemo(() => {
    const { selectedDate, scheduleItems, travelSegments, warnings, businessHours } = state;

    // 해당 일자의 일정 항목 (시간순 정렬)
    const items = scheduleItems
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // 해당 일자의 이동 구간
    const segments = travelSegments.filter((seg) => {
      const fromItem = scheduleItems.find((item) => item.id === seg.fromItemId);
      return fromItem?.date === selectedDate;
    });

    // 해당 일자의 경고 목록
    const dayWarnings = warnings.filter((w) => w.dayDate === selectedDate);

    // 각 일정 항목의 영업시간 체크 결과
    const businessHoursResults: Record<string, BusinessHoursCheckResult> = {};
    for (const item of items) {
      businessHoursResults[item.id] = checkBusinessHours(item, selectedDate, businessHours);
    }

    return {
      items,
      segments,
      warnings: dayWarnings,
      businessHoursResults,
    };
  }, [state]);
}

export { AppContext, DAYS };
export type { AppAction };
