import type { TravelSummary } from '../../types/common';
import type { Warning } from '../../types/warning';
import { formatCost, formatDuration } from '../../utils/formatters';
import { WarningBadge } from '../WarningBadge/WarningBadge';
import styles from './Sidebar.module.css';

interface SidebarProps {
  travelSummary: TravelSummary;
  warnings: Warning[];
  dayLabel: string;
}

export function Sidebar({ travelSummary, warnings, dayLabel }: SidebarProps) {
  return (
    <div className={styles.sidebar}>
      <section className={styles.section} aria-labelledby="travel-summary-heading">
        <h2 id="travel-summary-heading" className={styles.sectionTitle}>
          이동 요약
        </h2>
        <p className={styles.dayLabel}>{dayLabel}</p>
        <dl className={styles.summaryList}>
          <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>총 이동시간</dt>
            <dd className={styles.summaryValue}>
              {formatDuration(travelSummary.totalDurationMinutes)}
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>총 이동비용</dt>
            <dd className={styles.summaryValue}>{formatCost(travelSummary.totalCost)}</dd>
          </div>
          <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>이동 구간 수</dt>
            <dd className={styles.summaryValue}>{travelSummary.segmentCount}구간</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="warning-list-heading">
        <h2 id="warning-list-heading" className={styles.sectionTitle}>
          경고 목록
          {warnings.length > 0 && (
            <span className={styles.warningCount}>{warnings.length}</span>
          )}
        </h2>
        {warnings.length === 0 ? (
          <p className={styles.noWarnings}>경고 없음 ✅</p>
        ) : (
          <ul className={styles.warningList}>
            {warnings.map((warning) => (
              <li key={warning.id} className={styles.warningItem}>
                <WarningBadge type={warning.level} message={warning.message} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
