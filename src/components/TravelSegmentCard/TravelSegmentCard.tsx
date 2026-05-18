import type { TravelSegment, TransportMode } from '../../types/travel';
import type { Warning } from '../../types/warning';
import { formatCost, formatDuration } from '../../utils/formatters';
import { WarningBadge } from '../WarningBadge/WarningBadge';
import styles from './TravelSegmentCard.module.css';

export interface TravelSegmentCardProps {
  segment: TravelSegment | null;
  warnings: Warning[];
}

const modeIconMap: Record<TransportMode, string> = {
  전철: '🚃',
  도보: '🚶',
  버스: '🚌',
};

export function TravelSegmentCard({ segment, warnings }: TravelSegmentCardProps) {
  const travelTimeWarning = warnings.find((w) => w.type === 'travel-time-shortage');

  return (
    <div className={styles.container} aria-label="이동 구간">
      <div className={styles.connector} aria-hidden="true" />

      {segment === null ? (
        <div className={styles.nullSegment}>
          <WarningBadge type="unknown" message="이동정보 미등록" />
        </div>
      ) : (
        <div className={styles.content}>
          <span className={styles.modeIcon} aria-label={segment.mode}>
            {modeIconMap[segment.mode]}
          </span>
          <span className={styles.duration}>{formatDuration(segment.durationMinutes)}</span>
          {segment.cost > 0 && <span className={styles.cost}>{formatCost(segment.cost)}</span>}
        </div>
      )}

      {travelTimeWarning && (
        <div className={styles.warningContainer}>
          <WarningBadge type="warning" message={travelTimeWarning.message} />
        </div>
      )}
    </div>
  );
}
