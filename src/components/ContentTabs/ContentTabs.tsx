import { useState } from 'react';
import styles from './ContentTabs.module.css';

type TabId = 'schedule' | 'map' | 'cost';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'schedule', label: '일정', icon: '📋' },
  { id: 'map', label: '지도', icon: '🗺️' },
  { id: 'cost', label: '비용', icon: '💰' },
];

interface ContentTabsProps {
  scheduleContent: React.ReactNode;
  mapContent: React.ReactNode;
  costContent: React.ReactNode;
}

export function ContentTabs({ scheduleContent, mapContent, costContent }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('schedule');

  return (
    <div className={styles.container}>
      <div className={styles.tabBar} role="tablist" aria-label="콘텐츠 탭">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.content} role="tabpanel">
        {activeTab === 'schedule' && scheduleContent}
        {activeTab === 'map' && mapContent}
        {activeTab === 'cost' && costContent}
      </div>
    </div>
  );
}
