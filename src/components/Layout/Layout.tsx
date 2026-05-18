import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  header?: ReactNode;
  dayTabs?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
}

export function Layout({ header, dayTabs, children, sidebar }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>{header ?? <h1>나고야 여행 플래너</h1>}</header>

      {dayTabs && <nav className={styles.dayTabs}>{dayTabs}</nav>}

      <div className={styles.content}>
        <main className={styles.main}>{children}</main>

        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
      </div>
    </div>
  );
}
