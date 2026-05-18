import type { ScheduleItem } from '../../types/schedule';
import type { Warning } from '../../types/warning';
import type { BusinessHoursCheckResult } from '../../types/common';
import { formatCost } from '../../utils/formatters';
import { WarningBadge } from '../WarningBadge/WarningBadge';
import styles from './ScheduleCard.module.css';

export interface ScheduleCardProps {
  item: ScheduleItem;
  warnings: Warning[];
  businessHoursInfo: BusinessHoursCheckResult | null;
  onClick?: () => void;
}

export function ScheduleCard({ item, warnings, businessHoursInfo, onClick }: ScheduleCardProps) {
  const { placeName, startTime, endTime, category, estimatedCost, memo } = item;

  return (
    <article
      className={styles.card}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {/* Top section: time range + category badge */}
      <div className={styles.topSection}>
        <span className={styles.timeRange}>
          {startTime} ~ {endTime}
        </span>
        <span className={`${styles.categoryBadge} ${styles[`category-${category}`]}`}>
          {category}
        </span>
      </div>

      {/* Middle section: place name + cost */}
      <div className={styles.middleSection}>
        <h3 className={styles.placeName}>{placeName}</h3>
        {estimatedCost > 0 && (
          <span className={styles.cost}>{formatCost(estimatedCost)}</span>
        )}
      </div>

      {/* Bottom section: business hours + memo */}
      <div className={styles.bottomSection}>
        {businessHoursInfo?.hoursDisplay && (
          <span className={styles.businessHours}>
            🕐 {businessHoursInfo.hoursDisplay}
          </span>
        )}
        {memo && <span className={styles.memo}>{memo}</span>}
      </div>

      {/* Warning badges */}
      {warnings.length > 0 && (
        <div className={styles.warnings}>
          {warnings.map((warning) => (
            <WarningBadge
              key={warning.id}
              type={warning.level}
              message={warning.message}
            />
          ))}
        </div>
      )}
    </article>
  );
}
