import { useState } from 'react';
import type { ScheduleItem } from '../../types/schedule';
import type { TravelSegment } from '../../types/travel';
import type { Warning } from '../../types/warning';
import type { BusinessHoursCheckResult } from '../../types/common';
import { ScheduleCard } from '../ScheduleCard/ScheduleCard';
import { TravelSegmentCard } from '../TravelSegmentCard/TravelSegmentCard';
import { PlaceModal } from '../PlaceModal/PlaceModal';
import styles from './TimelineView.module.css';

export interface TimelineViewProps {
  scheduleItems: ScheduleItem[];
  travelSegments: TravelSegment[];
  warnings: Warning[];
  businessHoursResults: Record<string, BusinessHoursCheckResult>;
}

export function TimelineView({
  scheduleItems,
  travelSegments,
  warnings,
  businessHoursResults,
}: TimelineViewProps) {
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  if (scheduleItems.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <p className={styles.emptyMessage}>등록된 일정이 없습니다</p>
      </div>
    );
  }

  const sortedItems = [...scheduleItems].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <>
      <div className={styles.timeline}>
        {sortedItems.map((item, index) => {
          const itemWarnings = warnings.filter((w) =>
            w.targetItemIds.includes(item.id)
          );
          const businessHoursInfo = businessHoursResults[item.id] ?? null;

          const isLast = index === sortedItems.length - 1;
          const nextItem = isLast ? null : sortedItems[index + 1];

          const segment = nextItem
            ? travelSegments.find(
                (s) => s.fromItemId === item.id && s.toItemId === nextItem.id
              ) ?? null
            : null;

          const segmentWarnings = nextItem
            ? warnings.filter(
                (w) =>
                  w.targetItemIds.includes(item.id) &&
                  w.targetItemIds.includes(nextItem.id)
              )
            : [];

          return (
            <div key={item.id} className={styles.timelineEntry}>
              <ScheduleCard
                item={item}
                warnings={itemWarnings}
                businessHoursInfo={businessHoursInfo}
                onClick={() => setSelectedItem(item)}
              />
              {!isLast && (
                <TravelSegmentCard
                  segment={segment}
                  warnings={segmentWarnings}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Place detail modal */}
      {selectedItem && (
        <PlaceModal
          item={selectedItem}
          businessHoursInfo={businessHoursResults[selectedItem.id] ?? null}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
