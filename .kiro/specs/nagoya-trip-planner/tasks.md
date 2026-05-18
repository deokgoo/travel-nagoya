# Implementation Plan: Nagoya Trip Planner

## Overview

React 18 + TypeScript 기반의 나고야 4일 여행 일정 플래너 SPA를 구현한다. Vite 빌드 도구, CSS Modules 스타일링, Recharts 차트, Vitest + fast-check 테스트 환경을 사용하며, 4레이어 아키텍처(Data → Logic → State → UI)로 구성한다.

## Tasks

- [x] 1. 프로젝트 초기 설정 및 타입 정의
  - [x] 1.1 Vite + React + TypeScript 프로젝트 초기화
    - `npm create vite@latest` 으로 React + TypeScript 템플릿 생성
    - 필요한 의존성 설치: `recharts`, `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - `vite.config.ts`에 테스트 설정 추가
    - `tsconfig.json` 경로 별칭 설정 (`@/` → `src/`)
    - ESLint + Prettier 설정
    - _Requirements: 6.1_

  - [x] 1.2 핵심 타입 정의 파일 작성
    - `src/types/schedule.ts`: Category, ScheduleItem 인터페이스
    - `src/types/businessHours.ts`: DayOfWeek, DailyHours, BusinessHoursData 인터페이스
    - `src/types/travel.ts`: TransportMode, TravelSegment 인터페이스
    - `src/types/warning.ts`: WarningLevel, WarningType, Warning 인터페이스
    - `src/types/cost.ts`: CategoryCost, DailyCost, TotalCost 인터페이스
    - `src/types/app.ts`: DayInfo, AppState 인터페이스
    - `src/types/common.ts`: BusinessHoursCheckResult, TravelAnalysisResult, TravelSummary, ValidationResult, ValidationError 인터페이스
    - `src/types/index.ts`: 모든 타입 re-export
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 1.3 JSON 데이터 파일 작성 (나고야 4일 일정)
    - `src/data/schedule.json`: 4일간의 ScheduleItem 배열 (일자별 4~6개 항목)
    - `src/data/businessHours.json`: 각 장소의 영업시간, 휴무일, 권장 체류시간 데이터
    - `src/data/travelSegments.json`: 연속 일정 간 이동 구간 데이터
    - 실제 나고야 관광지 데이터 기반 (나고야성, 오스 상점가, 아츠타 신궁, 사카에 등)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Data Layer 구현
  - [x] 2.1 DataValidator 모듈 구현
    - `src/data/dataValidator.ts` 작성
    - `validateScheduleItems`: 필수 필드 검증, 시간 형식 검증, 카테고리 유효성 검증
    - `validateBusinessHours`: 요일별 영업시간 형식 검증, 필수 필드 검증
    - `validateTravelSegments`: ID 참조 유효성, 소요시간/비용 양수 검증
    - 유효하지 않은 항목은 제외하고 에러 배열에 기록
    - _Requirements: 6.5_

  - [ ]* 2.2 DataValidator 속성 기반 테스트 작성
    - **Property 14: 데이터 검증 라운드트립**
    - **Property 15: 부분 실패 처리**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**

  - [x] 2.3 DataLoader 모듈 구현
    - `src/data/dataLoader.ts` 작성
    - JSON 파일 import 및 DataValidator를 통한 검증 파이프라인
    - 검증 에러 시 콘솔 경고 출력
    - 검증된 데이터와 에러 목록 반환
    - _Requirements: 6.1, 6.5_

  - [ ]* 2.4 DataValidator 단위 테스트 작성
    - 유효한 데이터 통과 확인
    - 필수 필드 누락 시 에러 보고 확인
    - 형식 오류 시 해당 항목 제외 확인
    - 중복 ID 처리 확인
    - _Requirements: 6.5_

- [x] 3. Checkpoint - Data Layer 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Logic Layer 구현 - 비즈니스 로직
  - [x] 4.1 유틸리티 함수 구현
    - `src/utils/formatters.ts`: 비용 포맷팅 (¥ 접두사, 천 단위 구분), 시간 포맷팅
    - `src/utils/timeUtils.ts`: 시간 문자열 파싱, 분 단위 변환, 요일 계산, 시간 차이 계산
    - _Requirements: 4.3, 1.3_

  - [ ]* 4.2 포맷팅 유틸리티 속성 기반 테스트 작성
    - **Property 3: 비용 포맷팅**
    - **Validates: Requirements 3.2, 4.3**

  - [x] 4.3 BusinessHoursChecker 구현
    - `src/logic/businessHoursChecker.ts` 작성
    - `checkBusinessHours`: 장소명으로 영업시간 데이터 조회, 요일 매칭, 상태 판정
    - `isClosedDay`: 방문 요일이 휴무일 목록에 포함되는지 확인
    - `isOutsideBusinessHours`: 방문 시간이 영업시간 범위 밖인지 확인
    - 휴무일이면 'closed-day'만 반환 (영업시간 외 경고 미생성)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

  - [ ]* 4.4 BusinessHoursChecker 속성 기반 테스트 작성
    - **Property 4: 영업시간 조회**
    - **Property 5: 휴무일 감지 및 경고 우선순위**
    - **Property 6: 영업시간 외 감지**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.6**

  - [x] 4.5 CostCalculator 구현
    - `src/logic/costCalculator.ts` 작성
    - `calculateDailyCosts`: 일자별 카테고리 분류 및 소계 계산, TravelSegment 비용을 '교통' 카테고리에 포함
    - `calculateTotalCosts`: 전체 총 비용 계산
    - `categorizeItems`: 카테고리별 항목 분류
    - estimatedCost가 0인 항목은 집계에서 제외
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ]* 4.6 CostCalculator 속성 기반 테스트 작성
    - **Property 9: 비용 카테고리 분류 및 집계 정확성**
    - **Validates: Requirements 4.1, 4.2, 4.5**

  - [x] 4.7 ScheduleValidator 구현
    - `src/logic/scheduleValidator.ts` 작성
    - `detectTimeConflicts`: 동일 일자 내 시간 겹침(1분 이상) 감지
    - `detectInsufficientStayTime`: 권장 체류시간 대비 30분 이상 부족 감지
    - `detectTravelTimeShortage`: 이동시간 > 빈 시간 감지
    - `detectRouteInefficiency`: A→B→A 패턴 감지
    - `validateSchedule`: 모든 검증을 통합 실행하여 Warning 배열 반환
    - 예약 필수 장소에 대한 정보 경고 생성
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [ ]* 4.8 ScheduleValidator 속성 기반 테스트 작성
    - **Property 1: 일정 시간순 정렬**
    - **Property 7: 이동시간 부족 감지**
    - **Property 10: 시간 충돌 감지**
    - **Property 11: 체류시간 부족 감지**
    - **Property 12: 동선 비효율 감지**
    - **Property 13: 경고 카운트 집계**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [x] 4.9 RouteAnalyzer 구현
    - `src/logic/routeAnalyzer.ts` 작성
    - `analyzeTravelSegment`: 이동 구간 분석, 이동시간 부족 여부 판정
    - `calculateDailyTravelSummary`: 일자별 총 이동시간/비용 집계
    - _Requirements: 3.1, 3.3, 3.4, 3.6_

  - [ ]* 4.10 RouteAnalyzer 속성 기반 테스트 작성
    - **Property 2: 이동 구간 매칭 정확성**
    - **Property 8: 일자별 이동 요약 합계**
    - **Validates: Requirements 1.4, 3.1, 3.4**

- [x] 5. Checkpoint - Logic Layer 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. State Layer 구현
  - [x] 6.1 AppContext 구현
    - `src/state/AppContext.tsx` 작성
    - React Context + useReducer 패턴으로 상태 관리
    - 초기 상태: DataLoader로 데이터 로드, 1일차 선택
    - Actions: SELECT_DAY (일자 변경)
    - 선택된 일자 변경 시 해당 일자의 검증 결과(warnings) 자동 재계산
    - 커스텀 훅: `useAppState()`, `useSelectedDayData()`
    - _Requirements: 1.5, 5.7_

  - [ ]* 6.2 AppContext 단위 테스트 작성
    - 초기 로드 시 1일차 선택 확인
    - 일자 변경 시 상태 업데이트 확인
    - 경고 자동 재계산 확인
    - _Requirements: 1.5, 5.7_

- [x] 7. UI Layer 구현 - 핵심 컴포넌트
  - [x] 7.1 App Shell 및 Layout 컴포넌트 구현
    - `src/App.tsx`: AppContext Provider 래핑, ErrorBoundary 배치
    - `src/components/Layout/Layout.tsx`: 반응형 레이아웃 (모바일 단일컬럼, 태블릿 2컬럼, 데스크톱 사이드바)
    - `src/components/Layout/Layout.module.css`: 미디어 쿼리 기반 반응형 스타일
    - `src/components/ErrorBoundary.tsx`: 에러 폴백 UI
    - _Requirements: 7.1_

  - [x] 7.2 DayTabs 컴포넌트 구현
    - `src/components/DayTabs/DayTabs.tsx`: 일자 탭 네비게이션
    - 4일간 탭 표시 (일자 번호 + 날짜)
    - 경고 카운트 뱃지 표시
    - 모바일에서 가로 스크롤 지원
    - 최소 터치 영역 44x44px
    - `src/components/DayTabs/DayTabs.module.css`
    - _Requirements: 1.1, 5.5, 5.8, 7.2, 7.3_

  - [x] 7.3 WarningBadge 컴포넌트 구현
    - `src/components/WarningBadge/WarningBadge.tsx`: 경고 유형별 아이콘 및 메시지 표시
    - error: 빨간색 경고 아이콘 (시간 충돌, 휴무일)
    - warning: 주황색 경고 아이콘 (영업시간 외, 이동시간 부족, 체류시간 부족)
    - info: 파란색 정보 아이콘 (사전 예약 필수)
    - unknown: 회색 물음표 아이콘 (영업정보 미확인, 이동정보 미등록)
    - `src/components/WarningBadge/WarningBadge.module.css`
    - _Requirements: 2.2, 2.3, 2.5, 3.3, 3.6, 5.1, 5.6_

  - [x] 7.4 ScheduleCard 컴포넌트 구현
    - `src/components/ScheduleCard/ScheduleCard.tsx`: 일정 카드
    - 장소명, 시작/종료시간, 카테고리, 예상비용 표시
    - 영업시간 정보 표시 ("HH:MM~HH:MM")
    - 관련 경고 WarningBadge 렌더링
    - `src/components/ScheduleCard/ScheduleCard.module.css`
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.5_

  - [x] 7.5 TravelSegmentCard 컴포넌트 구현
    - `src/components/TravelSegmentCard/TravelSegmentCard.tsx`: 이동 구간 카드
    - 이동수단, 소요시간(분), 이동비용(¥) 표시
    - 이동정보 미등록 시 안내 메시지 표시
    - 이동시간 부족 경고 표시
    - `src/components/TravelSegmentCard/TravelSegmentCard.module.css`
    - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.6_

  - [x] 7.6 TimelineView 컴포넌트 구현
    - `src/components/TimelineView/TimelineView.tsx`: 타임라인 뷰
    - ScheduleCard와 TravelSegmentCard를 시간순으로 교차 배치
    - 일정 없을 시 "등록된 일정이 없습니다" 메시지 표시
    - `src/components/TimelineView/TimelineView.module.css`
    - _Requirements: 1.2, 1.4, 1.6_

  - [x] 7.7 CostSummaryView 컴포넌트 구현
    - `src/components/CostSummaryView/CostSummaryView.tsx`: 비용 요약 뷰
    - 카테고리별 비용 테이블 (식사, 관광/입장료, 교통, 쇼핑)
    - 일자별 소계 및 전체 총 비용 표시
    - 비용 0원 항목 "비용 미정" 표시
    - Recharts를 사용한 파이 차트 (카테고리별 비율)
    - `src/components/CostSummaryView/CostSummaryView.module.css`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.8 Sidebar 컴포넌트 구현 (데스크톱)
    - `src/components/Sidebar/Sidebar.tsx`: 사이드바
    - DaySummary: 일자별 이동 요약 (총 이동시간, 총 이동비용)
    - WarningList: 해당 일자의 경고 목록
    - `src/components/Sidebar/Sidebar.module.css`
    - _Requirements: 3.4, 5.5, 7.1_

- [x] 8. Checkpoint - UI 렌더링 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. 반응형 CSS 및 통합
  - [x] 9.1 반응형 스타일 및 글로벌 CSS 작성
    - `src/styles/global.css`: CSS 변수 (색상, 간격, 폰트), 리셋 스타일
    - 모바일(320px~767px): 단일 컬럼, 탭 가로 스크롤, 가로 스크롤 방지
    - 태블릿(768px~1023px): 2컬럼 레이아웃
    - 데스크톱(1024px+): 사이드바 포함 다중 컬럼
    - 모든 터치 요소 최소 44x44px
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.2 전체 앱 통합 및 와이어링
    - App.tsx에서 모든 컴포넌트 연결
    - AppContext에서 Logic Layer 함수 호출하여 경고/비용 계산 결과를 UI에 전달
    - DayTabs 선택 시 TimelineView, CostSummaryView, Sidebar 데이터 갱신
    - 일자별 경고 카운트를 DayTabs 뱃지에 반영
    - _Requirements: 1.1, 1.2, 1.5, 5.5, 5.7_

- [ ] 10. 최종 검증
  - [ ]* 10.1 컴포넌트 단위 테스트 작성
    - DayTabs: 탭 렌더링, 선택 이벤트, 뱃지 표시
    - TimelineView: 시간순 렌더링, 빈 일정 메시지
    - ScheduleCard: 정보 표시, 경고 렌더링
    - CostSummaryView: 비용 테이블, 차트 렌더링
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 4.1, 4.3_

  - [ ]* 10.2 Logic Layer 단위 테스트 작성
    - scheduleValidator: 실제 나고야 일정 데이터 기반 시나리오 테스트
    - costCalculator: 비용 계산 정확성, 엣지 케이스
    - businessHoursChecker: 영업시간 판정 시나리오
    - routeAnalyzer: 이동 구간 분석 시나리오
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 4.1, 4.2, 2.1, 2.2, 3.1_

- [x] 11. Final checkpoint - 전체 테스트 통과 확인
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- 설계 문서의 4레이어 아키텍처(Data → Logic → State → UI) 순서로 구현하여 의존성 방향을 준수
- Logic Layer는 순수 함수로 구현하여 테스트 용이성 확보
- CSS Modules를 사용하여 컴포넌트 스코프 스타일링

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["2.1"] },
    { "id": 4, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 5, "tasks": ["4.1"] },
    { "id": 6, "tasks": ["4.2", "4.3", "4.5", "4.7", "4.9"] },
    { "id": 7, "tasks": ["4.4", "4.6", "4.8", "4.10"] },
    { "id": 8, "tasks": ["6.1"] },
    { "id": 9, "tasks": ["6.2", "7.1", "7.3"] },
    { "id": 10, "tasks": ["7.2", "7.4", "7.5"] },
    { "id": 11, "tasks": ["7.6", "7.7", "7.8"] },
    { "id": 12, "tasks": ["9.1"] },
    { "id": 13, "tasks": ["9.2"] },
    { "id": 14, "tasks": ["10.1", "10.2"] }
  ]
}
```
