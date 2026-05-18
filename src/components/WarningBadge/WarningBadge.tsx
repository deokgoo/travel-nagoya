import styles from './WarningBadge.module.css';

export interface WarningBadgeProps {
  type: 'error' | 'warning' | 'info' | 'unknown';
  message: string;
}

const iconMap: Record<WarningBadgeProps['type'], string> = {
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  unknown: '❓',
};

export function WarningBadge({ type, message }: WarningBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[type]}`} role="status">
      <span className={styles.icon} aria-hidden="true">
        {iconMap[type]}
      </span>
      <span className={styles.message}>{message}</span>
    </span>
  );
}
