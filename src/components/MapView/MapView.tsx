import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ScheduleItem } from '@/types/schedule';
import locationsData from '@/data/locations.json';
import styles from './MapView.module.css';

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
  placeName: string;
  searchName: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  recommendation: string | null;
}

interface MapViewProps {
  scheduleItems: ScheduleItem[];
}

const locations: Location[] = locationsData as Location[];

const CATEGORY_COLORS: Record<string, string> = {
  식사: '#22c55e',
  관광: '#a855f7',
  쇼핑: '#ec4899',
  이동: '#6b7280',
};

function getLocationForItem(item: ScheduleItem): Location | undefined {
  return locations.find((loc) => loc.placeName === item.placeName);
}

function createNumberedIcon(index: number, category: string): L.DivIcon {
  const color = CATEGORY_COLORS[category] || '#3b82f6';
  return L.divIcon({
    className: styles.customMarker,
    html: `<div style="background-color:${color};color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function MapView({ scheduleItems }: MapViewProps) {
  const itemsWithLocations = scheduleItems
    .map((item, index) => ({
      item,
      location: getLocationForItem(item),
      index,
    }))
    .filter((entry) => entry.location != null) as {
    item: ScheduleItem;
    location: Location;
    index: number;
  }[];

  if (itemsWithLocations.length === 0) {
    return null;
  }

  // Center map on the average of all points
  const avgLat =
    itemsWithLocations.reduce((sum, e) => sum + e.location.lat, 0) /
    itemsWithLocations.length;
  const avgLng =
    itemsWithLocations.reduce((sum, e) => sum + e.location.lng, 0) /
    itemsWithLocations.length;

  // Route polyline coordinates
  const routeCoords: [number, number][] = itemsWithLocations.map((e) => [
    e.location.lat,
    e.location.lng,
  ]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📍 일정 지도</h3>
      <div className={styles.mapWrapper}>
        <MapContainer
          center={[avgLat, avgLng]}
          zoom={12}
          className={styles.map}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Route line */}
          <Polyline
            positions={routeCoords}
            color="#3b82f6"
            weight={3}
            opacity={0.6}
            dashArray="8 4"
          />
          {/* Markers */}
          {itemsWithLocations.map((entry) => (
            <Marker
              key={entry.item.id}
              position={[entry.location.lat, entry.location.lng]}
              icon={createNumberedIcon(entry.index, entry.item.category)}
            >
              <Popup>
                <strong>{entry.item.placeName}</strong>
                <br />
                {entry.item.startTime} ~ {entry.item.endTime}
                <br />
                <span style={{ color: CATEGORY_COLORS[entry.item.category] }}>
                  {entry.item.category}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {/* Legend: numbered list of places */}
      <div className={styles.legend}>
        <h4 className={styles.legendTitle}>방문 순서</h4>
        <ol className={styles.legendList}>
          {itemsWithLocations.map((entry) => (
            <li key={entry.item.id} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: CATEGORY_COLORS[entry.item.category] || '#3b82f6' }}
              >
                {entry.index + 1}
              </span>
              <span className={styles.legendText}>
                <span className={styles.legendPlace}>{entry.item.placeName}</span>
                <span className={styles.legendTime}>{entry.item.startTime}~{entry.item.endTime}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
