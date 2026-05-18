import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyCost, CategoryCost } from '../../types/cost';
import type { Category } from '../../types/schedule';
import { formatCost } from '../../utils/formatters';
import styles from './CostSummaryView.module.css';

export interface CostSummaryViewProps {
  dailyCosts: DailyCost[];
  totalCost: number;
}

const CATEGORY_COLORS: Record<Category | '교통', string> = {
  식사: '#22c55e',
  관광: '#a855f7',
  쇼핑: '#ec4899',
  이동: '#6b7280',
  교통: '#3b82f6',
};

/**
 * Aggregate all daily costs into a single category breakdown for the pie chart.
 */
function aggregateCategories(dailyCosts: DailyCost[]): CategoryCost[] {
  const map = new Map<string, CategoryCost>();

  for (const day of dailyCosts) {
    for (const cat of day.categories) {
      const existing = map.get(cat.category);
      if (existing) {
        existing.amount += cat.amount;
        existing.items.push(...cat.items);
      } else {
        map.set(cat.category, {
          category: cat.category,
          amount: cat.amount,
          items: [...cat.items],
        });
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Collect all items with cost 0 across all days (for "비용 미정" display).
 */
function getUndeterminedItems(dailyCosts: DailyCost[]): { name: string; date: string }[] {
  const result: { name: string; date: string }[] = [];
  for (const day of dailyCosts) {
    for (const cat of day.categories) {
      for (const item of cat.items) {
        if (item.cost === 0) {
          result.push({ name: item.name, date: day.date });
        }
      }
    }
  }
  return result;
}

export function CostSummaryView({ dailyCosts, totalCost }: CostSummaryViewProps) {
  const aggregated = aggregateCategories(dailyCosts);
  const undeterminedItems = getUndeterminedItems(dailyCosts);

  const chartData = aggregated
    .filter((cat) => cat.amount > 0)
    .map((cat) => ({
      name: cat.category,
      value: cat.amount,
    }));

  return (
    <section className={styles.container} aria-label="비용 요약">
      {/* Total cost header */}
      <div className={styles.totalSection}>
        <h2 className={styles.totalLabel}>전체 총 비용</h2>
        <span className={styles.totalAmount}>{formatCost(totalCost)}</span>
      </div>

      {/* Pie chart */}
      {chartData.length > 0 && (
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle}>카테고리별 비율</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name as Category | '교통'] || '#9ca3af'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCost(Number(value))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily breakdown */}
      <div className={styles.dailySection}>
        <h3 className={styles.sectionTitle}>일자별 비용 내역</h3>
        {dailyCosts.map((day) => (
          <div key={day.date} className={styles.dayBlock}>
            <div className={styles.dayHeader}>
              <span className={styles.dayDate}>{day.date}</span>
              <span className={styles.daySubtotal}>소계: {formatCost(day.subtotal)}</span>
            </div>
            {day.categories.length > 0 ? (
              <div className={styles.categoryList}>
                {day.categories.map((cat) => (
                  <div key={cat.category} className={styles.categoryBlock}>
                    <div className={styles.categoryHeader}>
                      <span
                        className={styles.categoryDot}
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[cat.category as Category | '교통'] || '#9ca3af',
                        }}
                      />
                      <span className={styles.categoryName}>{cat.category}</span>
                      <span className={styles.categoryAmount}>
                        {formatCost(cat.amount)}
                      </span>
                    </div>
                    <ul className={styles.itemList}>
                      {cat.items.map((item, idx) => (
                        <li key={`${item.name}-${idx}`} className={styles.item}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemCost}>
                            {item.cost === 0 ? (
                              <span className={styles.undetermined}>비용 미정</span>
                            ) : (
                              formatCost(item.cost)
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>비용 항목 없음</p>
            )}
          </div>
        ))}
      </div>

      {/* Undetermined cost items */}
      {undeterminedItems.length > 0 && (
        <div className={styles.undeterminedSection}>
          <h3 className={styles.sectionTitle}>비용 미정 항목</h3>
          <ul className={styles.undeterminedList}>
            {undeterminedItems.map((item, idx) => (
              <li key={`${item.name}-${idx}`} className={styles.undeterminedItem}>
                <span>{item.name}</span>
                <span className={styles.undeterminedDate}>{item.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
