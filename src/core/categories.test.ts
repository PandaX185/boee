import { CATEGORY_LABELS, CATEGORY_ORDER, groupByCategory } from '@/core/categories';
import type { Category } from '@/domain/types';

describe('categories', () => {
  it('labels every category', () => {
    const categories: Category[] = [
      'throughput',
      'storage',
      'network',
      'caching',
      'reliability',
      'growth',
    ];
    expect(CATEGORY_ORDER).toEqual(categories);
    for (const category of categories) {
      expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0);
    }
  });

  it('groups items in category order and drops empty groups', () => {
    const groups = groupByCategory([
      { category: 'growth' as Category, id: 'g' },
      { category: 'throughput' as Category, id: 't' },
      { category: 'throughput' as Category, id: 't2' },
    ]);
    expect(groups.map((group) => group.category)).toEqual(['throughput', 'growth']);
    expect(groups[0].items.map((item) => item.id)).toEqual(['t', 't2']);
  });
});
