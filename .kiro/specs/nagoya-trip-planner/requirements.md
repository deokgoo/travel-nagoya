# Requirements Document

## Introduction

나고야 4일 여행 일정을 시각화하고 관리하는 React 앱이다. 사용자가 일정의 미흡한 점(시간 배분, 빠진 항목), 이동 동선의 효율성, 각 장소의 휴무일 여부를 한눈에 확인할 수 있도록 한다. 일정 타임라인 뷰, 영업시간/휴무일 경고, 이동 경로 시각화, 비용 요약, 일정 검증 기능을 제공한다.

## Glossary

- **App**: 나고야 여행 일정 플래너 React 애플리케이션
- **Timeline_View**: 일자별 일정을 시간순으로 표시하는 UI 컴포넌트
- **Schedule_Item**: 하나의 일정 항목 (장소명, 시작시간, 종료시간, 카테고리, 비용 포함)
- **Day_View**: 특정 일자의 전체 일정을 표시하는 화면
- **Warning_Indicator**: 일정 문제점을 시각적으로 알려주는 경고 표시
- **Route_Visualizer**: 일정 항목 간 이동 경로와 소요시간을 표시하는 컴포넌트
- **Cost_Summary**: 일자별 및 전체 여행 비용을 집계하여 표시하는 컴포넌트
- **Schedule_Validator**: 일정의 시간 충돌, 시간 부족, 동선 비효율을 검증하는 모듈
- **Business_Hours_Data**: 각 장소의 영업시간과 휴무일 정보를 담은 데이터
- **Travel_Segment**: 두 일정 항목 사이의 이동 구간 (출발지, 도착지, 이동수단, 소요시간, 비용 포함)

## Requirements

### Requirement 1: 일정 타임라인 뷰

**User Story:** As a 여행자, I want 일자별 일정을 시간순 타임라인으로 확인하고 싶다, so that 하루 일정의 전체 흐름을 한눈에 파악할 수 있다.

#### Acceptance Criteria

1. THE App SHALL 4일간의 일정을 일자별 탭(1일차~4일차, 각 탭에 해당 날짜 표시)으로 구분하여 표시한다
2. WHEN 사용자가 특정 일자 탭을 선택하면, THE Timeline_View SHALL 해당 일자의 모든 Schedule_Item을 시작시간 순서(오름차순)로 표시한다
3. THE Timeline_View SHALL 각 Schedule_Item에 대해 장소명, 시작시간(HH:MM 24시간제), 종료시간(HH:MM 24시간제), 카테고리(식사/관광/쇼핑/이동), 예상 비용(엔화 ¥ 단위)을 표시한다
4. THE Timeline_View SHALL 연속된 두 Schedule_Item 사이에 Travel_Segment 정보(이동수단, 소요시간(분 단위), 이동비용(엔화 ¥ 단위))를 표시한다
5. WHEN App이 최초 로드되면, THE App SHALL 1일차(5월 21일) 탭을 기본으로 선택하여 표시한다
6. IF 선택된 일자에 Schedule_Item이 존재하지 않으면, THEN THE Timeline_View SHALL "등록된 일정이 없습니다" 안내 메시지를 표시한다

### Requirement 2: 영업시간 및 휴무일 표시

**User Story:** As a 여행자, I want 각 장소의 영업시간과 휴무일 정보를 확인하고 싶다, so that 방문 시 닫혀있는 상황을 피할 수 있다.

#### Acceptance Criteria

1. THE App SHALL 각 Schedule_Item에 해당 장소의 방문 요일 기준 영업 시작시간과 종료시간을 "HH:MM~HH:MM" 형식으로 표시한다
2. WHEN Schedule_Item의 방문 요일이 해당 장소의 휴무일과 일치하면, THE Warning_Indicator SHALL 빨간색 경고 아이콘과 "휴무일" 메시지를 해당 Schedule_Item에 표시한다
3. WHEN Schedule_Item의 시작시간이 해당 장소의 영업 시작시간보다 이르거나, Schedule_Item의 종료시간이 해당 장소의 영업 종료시간보다 늦으면, THE Warning_Indicator SHALL 주황색 경고 아이콘과 "영업시간 외" 메시지를 해당 Schedule_Item에 표시한다
4. THE Business_Hours_Data SHALL 각 장소에 대해 요일별 영업시간(시작시간, 종료시간), 정기 휴무일, 특이사항(예약 필수 등)을 포함한다
5. IF 장소의 영업시간 정보가 Business_Hours_Data에 존재하지 않으면, THEN THE App SHALL 회색 물음표 아이콘과 "영업정보 미확인" 메시지를 해당 Schedule_Item에 표시한다
6. IF Schedule_Item의 방문 요일이 휴무일과 일치하면, THEN THE Warning_Indicator SHALL 영업시간 외 경고 대신 휴무일 경고만 표시한다

### Requirement 3: 이동 경로 및 소요시간 시각화

**User Story:** As a 여행자, I want 장소 간 이동 경로와 소요시간을 시각적으로 확인하고 싶다, so that 이동 동선이 효율적인지 판단할 수 있다.

#### Acceptance Criteria

1. THE Route_Visualizer SHALL 연속된 Schedule_Item 사이의 이동수단(전철, 도보, 버스)과 예상 소요시간을 분 단위로 표시한다
2. THE Route_Visualizer SHALL 각 Travel_Segment의 이동 비용을 엔화(¥) 단위로 표시한다
3. IF Travel_Segment의 소요시간이 연속된 두 Schedule_Item 사이의 빈 시간(선행 항목 종료시간과 후행 항목 시작시간의 차이)보다 길면, THEN THE Warning_Indicator SHALL 주황색 경고 아이콘과 "이동시간 부족" 메시지를 표시한다
4. THE Route_Visualizer SHALL 일자별 총 이동시간(분 단위)과 총 이동비용(¥ 단위)을 요약하여 표시한다
5. IF 연속된 두 장소가 동일 최근접 역을 공유하거나 도보 소요시간이 5분 이내이면, THEN THE Route_Visualizer SHALL 해당 구간을 이동수단 "도보"로 표시하고 소요시간을 분 단위로 표시한다
6. IF 연속된 두 Schedule_Item 사이에 Travel_Segment 데이터가 존재하지 않으면, THEN THE Route_Visualizer SHALL 회색 물음표 아이콘과 "이동정보 미등록" 메시지를 해당 구간에 표시한다

### Requirement 4: 비용 요약

**User Story:** As a 여행자, I want 일자별 및 전체 여행 비용을 한눈에 확인하고 싶다, so that 예산을 관리할 수 있다.

#### Acceptance Criteria

1. THE Cost_Summary SHALL 일자별 비용을 카테고리(식사, 관광/입장료, 교통, 쇼핑)별로 분류하여 표시하며, 교통 카테고리에는 Travel_Segment 비용을 포함한다
2. THE Cost_Summary SHALL 일자별 소계와 4일간 전체 총 비용을 표시한다
3. THE Cost_Summary SHALL 각 비용 항목을 엔화(¥) 단위로 천 단위 구분 기호(,)를 포함한 정수로 표시한다
4. WHEN 사용자가 Cost_Summary를 조회하면, THE Cost_Summary SHALL 카테고리별 비율을 시각적 차트(파이 차트 또는 바 차트)로 표시한다
5. IF Schedule_Item의 예상비용이 0이거나 미입력인 경우, THEN THE Cost_Summary SHALL 해당 항목을 비용 집계에서 제외하고 "비용 미정" 표시를 한다

### Requirement 5: 일정 검증 및 경고

**User Story:** As a 여행자, I want 일정의 문제점(시간 부족, 동선 비효율, 시간 충돌)을 자동으로 확인하고 싶다, so that 일정을 개선할 수 있다.

#### Acceptance Criteria

1. WHEN 같은 일자 내 두 Schedule_Item의 시간 범위가 1분 이상 겹치면, THE Schedule_Validator SHALL 해당 Schedule_Item들에 빨간색 경고와 "시간 충돌" 메시지를 표시한다
2. WHEN Schedule_Item의 할당 시간(종료시간 - 시작시간)이 해당 장소의 권장 체류시간보다 30분 이상 짧으면, THE Schedule_Validator SHALL 해당 Schedule_Item에 주황색 경고와 "체류시간 부족" 메시지를 표시한다
3. WHEN 연속된 두 Schedule_Item 사이의 Travel_Segment 소요시간이 두 항목 사이의 빈 시간(다음 항목 시작시간 - 이전 항목 종료시간)보다 길면, THE Schedule_Validator SHALL 해당 Travel_Segment에 주황색 경고와 "이동시간 부족" 메시지를 표시한다
4. WHEN 같은 일자 내에서 연속된 3개 이상의 Schedule_Item이 A→B→A 패턴(이전에 방문한 장소 방향으로 되돌아가는 경로)을 포함하면, THE Schedule_Validator SHALL 해당 구간에 노란색 경고와 "동선 비효율" 메시지를 표시한다
5. THE Schedule_Validator SHALL 일자별 경고 총 개수를 일자 탭에 숫자 뱃지로 표시한다
6. WHEN Schedule_Item의 장소가 Business_Hours_Data에서 사전 예약 필수로 표시된 경우, THE Schedule_Validator SHALL 해당 Schedule_Item에 파란색 정보 아이콘과 "사전 예약 필수" 메시지를 표시한다
7. WHEN Day_View가 표시되면, THE Schedule_Validator SHALL 해당 일자의 모든 Schedule_Item에 대해 검증을 자동 실행하여 결과를 표시한다
8. IF 해당 일자에 검증 경고가 없으면, THEN THE Schedule_Validator SHALL 일자 탭의 뱃지를 표시하지 않는다

### Requirement 6: 일정 데이터 관리

**User Story:** As a 개발자, I want 일정 데이터를 구조화된 형태로 관리하고 싶다, so that 데이터 수정과 확장이 용이하다.

#### Acceptance Criteria

1. THE App SHALL 일정 데이터를 JSON 형식의 정적 데이터 파일로 관리하며, 일정 데이터(Schedule_Item 목록), 영업시간 데이터(Business_Hours_Data), 이동 구간 데이터(Travel_Segment 목록)를 별도의 JSON 파일 또는 별도의 최상위 키로 분리하여 구성한다
2. THE App SHALL 각 Schedule_Item에 대해 고유 ID(데이터 내에서 중복 불가), 일자(YYYY-MM-DD 형식), 시작시간(HH:mm 24시간 형식), 종료시간(HH:mm 24시간 형식), 장소명(최대 50자), 카테고리(식사, 관광, 쇼핑, 이동 중 하나), 예상비용(0 이상의 정수, 엔화 단위), 메모(최대 200자, 빈 문자열 허용) 필드를 포함한다
3. THE App SHALL 각 장소에 대해 Business_Hours_Data를 별도 데이터로 관리하며, 장소명(Schedule_Item의 장소명과 매칭), 요일별 영업시간(HH:mm~HH:mm 형식), 정기 휴무 요일, 특이사항(최대 100자, 예약 필수 등) 필드를 포함한다
4. THE App SHALL Travel_Segment 데이터에 출발지 Schedule_Item ID, 도착지 Schedule_Item ID, 이동수단(전철, 도보, 버스 중 하나), 소요시간(분 단위 양의 정수), 비용(0 이상의 정수, 엔화 단위)을 포함한다
5. IF JSON 데이터 파일의 필수 필드가 누락되었거나 형식이 올바르지 않은 경우, THEN THE App SHALL 데이터 로드 시 해당 오류를 콘솔에 경고 메시지로 출력하고, 오류가 있는 항목을 제외한 나머지 데이터를 정상적으로 표시한다

### Requirement 7: 반응형 UI

**User Story:** As a 여행자, I want 모바일 기기에서도 일정을 편리하게 확인하고 싶다, so that 여행 중에도 일정을 참고할 수 있다.

#### Acceptance Criteria

1. THE App SHALL 모바일(320px~767px)에서는 단일 컬럼 레이아웃, 태블릿(768px~1023px)에서는 2컬럼 레이아웃, 데스크톱(1024px 이상)에서는 사이드바 포함 다중 컬럼 레이아웃으로 표시한다
2. WHILE 화면 너비가 767px 이하인 상태에서, THE App SHALL 일자 탭을 가로 스크롤 가능한 형태로 표시한다
3. THE App SHALL 모든 터치 가능한 요소(버튼, 탭, 링크)의 최소 터치 영역을 44x44px 이상으로 설정한다
4. WHILE 화면 너비가 767px 이하인 상태에서, THE App SHALL 메인 콘텐츠 영역에서 가로 스크롤이 발생하지 않도록 콘텐츠를 조정한다
