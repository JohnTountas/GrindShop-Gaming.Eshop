import { describe, expect, it } from 'vitest';
import type { Product } from '@/shared/types';
import { buildHomeComparisonRows, filterAndSortProducts, getTrendingProducts } from './homeCatalog';

function buildProduct(overrides: Partial<Product> = {}): Product {
  const id = overrides.id ?? 'product-1';

  return {
    id,
    title: overrides.title ?? `Product ${id}`,
    description: overrides.description ?? 'Tournament-ready gear',
    price: overrides.price ?? 100,
    images: overrides.images ?? ['/image.jpg'],
    stock: overrides.stock ?? 5,
    categoryId: overrides.categoryId ?? 'category-1',
    category: overrides.category ?? { id: 'category-1', name: 'Mouse', slang: 'Mouse' },
    specifications: overrides.specifications ?? [
      {
        id: `spec-${id}`,
        productId: id,
        label: 'Sensor',
        value: 'Optical',
        position: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    reviews: overrides.reviews ?? [],
    featured: overrides.featured ?? false,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
  };
}

describe('homeCatalog helpers', () => {
  it('filters and sorts visible products by price', () => {
    const products = [
      buildProduct({ id: 'a', title: 'Alpha Mouse', price: 200 }),
      buildProduct({ id: 'b', title: 'Bravo Mouse', price: 100 }),
    ];

    const visible = filterAndSortProducts({
      products,
      search: 'mouse',
      category: 'all',
      brand: 'all',
      compatibility: 'all',
      minPrice: '',
      maxPrice: '',
      onlyStock: false,
      sortBy: 'price-asc',
      reviewById: new Map(),
    });

    expect(visible.map((product) => product.id)).toEqual(['b', 'a']);
  });

  it('returns highest-rated products as trending', () => {
    const products = [buildProduct({ id: 'a' }), buildProduct({ id: 'b' })];
    const reviewById = new Map([
      ['a', { rating: 4.1 }],
      ['b', { rating: 4.8 }],
    ]);

    expect(getTrendingProducts(products, reviewById).map((product) => product.id)).toEqual([
      'b',
      'a',
    ]);
  });

  it('builds comparison rows for compared products', () => {
    const products = [
      buildProduct({ id: 'a', price: 150, title: 'Alpha Mouse' }),
      buildProduct({ id: 'b', price: 180, title: 'Bravo Mouse' }),
    ];

    const rows = buildHomeComparisonRows(
      products,
      new Map([
        ['a', { rating: 4.5 }],
        ['b', { rating: 4.9 }],
      ])
    );

    expect(rows.find((row) => row.label === 'Price')?.values).toHaveLength(2);
    expect(rows.find((row) => row.label === 'Sensor')?.values).toEqual(['Optical', 'Optical']);
  });
});
