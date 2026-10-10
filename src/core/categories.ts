import type { Category } from '@/domain/types';

export const CATEGORY_ORDER: Category[] = [
  'throughput',
  'storage',
  'network',
  'caching',
  'reliability',
  'growth',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  throughput: 'Throughput',
  storage: 'Storage',
  network: 'Network',
  caching: 'Caching',
  reliability: 'Reliability',
  growth: 'Growth',
};

export interface CategoryGroup<T> {
  category: Category;
  items: T[];
}

export function groupByCategory<T extends { category: Category }>(items: T[]): CategoryGroup<T>[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
