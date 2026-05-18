import styles from './DayTabs.module.css';
import type { DayInfo } from '../../types/app';

export interface DayTabsProps {
  days: DayInfo[];
  selectedDay: string; // YYYY-MM-DD
  warningCounts: Record<string, number>;
  onDaySelect: (date: string) => void;
}

export function DayTabs({
  days,
  selectedDay,
  warningCounts,
  onDaySelect,
}: DayTabsProps) {
  return (
    <nav className={styles.container} aria-label="일자 탭 네비게이션">
      <div className={styles.tabList} role="tablist">
        {days.map((day) => {
          const isSelected = day.date === selectedDay;
          const warningCount = warningCounts[day.date] ?? 0;

          return (
            <button
              key={day.date}
              className={`${styles.tab} ${isSelected ? styles.active : ''}`}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${day.label}${warningCount > 0 ? `, 경고 ${warningCount}건` : ''}`}
              onClick={() => onDaySelect(day.date)}
            >
              <span className={styles.label}>{day.label}</span>
              {warningCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {warningCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
