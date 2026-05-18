import type { Category } from './schedule';

export interface CategoryCost {
  category: Category | '교통';
  amount: number;
  items: { name: string; cost: number }[];
}

export interface DailyCost {
  date: string;
  categories: CategoryCost[];
  subtotal: number;
}

export interface TotalCost {
  dailyCosts: DailyCost[];
  grandTotal: number;
}
