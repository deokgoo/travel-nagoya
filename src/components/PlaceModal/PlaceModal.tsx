import { useEffect } from 'react';
import type { ScheduleItem } from '@/types/schedule';
import type { BusinessHoursCheckResult } from '@/types/common';
import locationsData from '@/data/locations.json';
import { formatCost } from '@/utils/formatters';
import styles from './PlaceModal.module.css';

interface Location {
  placeName: string;
  searchName: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  recommendation: string | null;
}

const locations: Location[] = locationsData as Location[];

interface PlaceModalProps {
  item: ScheduleItem;
  businessHoursInfo: BusinessHoursCheckResult | null;
  onClose: () => void;
}

function getGoogleMapsUrl(item: ScheduleItem): string {
  const location = locations.find((loc) => loc.placeName === item.placeName);
  if (location?.searchName) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.searchName)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.placeName + ' 名古屋')}`;
}

function getGoogleMapsDirectionsUrl(item: ScheduleItem): string {
  const location = locations.find((loc) => loc.placeName === item.placeName);
  if (location?.searchName) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.searchName)}&travelmode=transit`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.placeName + ' 名古屋')}&travelmode=transit`;
}

export function PlaceModal({ item, businessHoursInfo, onClose }: PlaceModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const location = locations.find((loc) => loc.placeName === item.placeName);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={item.placeName}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{item.placeName}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Image */}
        {location?.imageUrl && (
          <div className={styles.imageWrapper}>
            <img src={location.imageUrl} alt={item.placeName} className={styles.image} />
          </div>
        )}

        {/* Recommendation */}
        {location?.recommendation && (
          <div className={styles.recommendation}>
            {location.recommendation}
          </div>
        )}

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.label}>시간</span>
            <span className={styles.value}>{item.startTime} ~ {item.endTime}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>카테고리</span>
            <span className={styles.value}>{item.category}</span>
          </div>
          {item.estimatedCost > 0 && (
            <div className={styles.infoRow}>
              <span className={styles.label}>예상 비용</span>
              <span className={styles.value}>{formatCost(item.estimatedCost)}</span>
            </div>
          )}
          {businessHoursInfo?.hoursDisplay && (
            <div className={styles.infoRow}>
              <span className={styles.label}>영업시간</span>
              <span className={styles.value}>{businessHoursInfo.hoursDisplay}</span>
            </div>
          )}
          {businessHoursInfo?.notes && (
            <div className={styles.infoRow}>
              <span className={styles.label}>참고</span>
              <span className={styles.value}>{businessHoursInfo.notes}</span>
            </div>
          )}
          {item.memo && (
            <div className={styles.infoRow}>
              <span className={styles.label}>메모</span>
              <span className={styles.value}>{item.memo}</span>
            </div>
          )}
        </div>

        {/* Google Maps buttons */}
        <div className={styles.actions}>
          <a
            href={getGoogleMapsUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapBtn}
          >
            📍 구글 지도에서 보기
          </a>
          <a
            href={getGoogleMapsDirectionsUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsBtn}
          >
            🧭 길찾기 (대중교통)
          </a>
        </div>
      </div>
    </div>
  );
}
