/**
 * Pure catalog helpers for the homepage filter, sort, and compare experiences.
 */
import type { Product } from '@/shared/types';
import { buildTechnicalSpecs, getCompatibilityTags, getProductBrand } from '@/shared/shopping';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { SortOption } from '../types';

type ReviewSnapshotLike = {
  rating: number;
};

export interface HomeComparisonRow {
  label: string;
  values: string[];
}

interface FilterAndSortProductsArgs {
  products: Product[];
  search: string;
  category: string;
  brand: string;
  compatibility: string;
  minPrice: string;
  maxPrice: string;
  onlyStock: boolean;
  sortBy: SortOption;
  reviewById: Map<string, ReviewSnapshotLike>;
}

export function filterAndSortProducts({
  products,
  search,
  category,
  brand,
  compatibility,
  minPrice,
  maxPrice,
  onlyStock,
  sortBy,
  reviewById,
}: FilterAndSortProductsArgs) {
  const query = search.trim().toLowerCase();
  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;

  const filtered = products.filter((product) => {
    const categoryName = product.category?.name ?? '';
    const productBrand = getProductBrand(product);
    const productCompatibility = getCompatibilityTags(product);
    const target = `${product.title} ${product.description} ${categoryName} ${productBrand} ${productCompatibility.join(' ')}`.toLowerCase();

    if (category !== 'all' && product.category?.slang !== category) return false;
    if (brand !== 'all' && productBrand !== brand) return false;
    if (compatibility !== 'all' && !productCompatibility.includes(compatibility)) return false;
    if (typeof min === 'number' && Number.isFinite(min) && Number(product.price) < min) return false;
    if (typeof max === 'number' && Number.isFinite(max) && Number(product.price) > max) return false;
    if (onlyStock && product.stock <= 0) return false;
    if (query && !target.includes(query)) return false;

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'rating') {
      return (reviewById.get(b.id)?.rating ?? 4) - (reviewById.get(a.id)?.rating ?? 4);
    }

    const ratingDiff = (reviewById.get(b.id)?.rating ?? 4) - (reviewById.get(a.id)?.rating ?? 4);
    if (ratingDiff !== 0) return ratingDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getTrendingProducts(
  products: Product[],
  reviewById: Map<string, ReviewSnapshotLike>,
  limit = 4
) {
  return [...products]
    .sort((a, b) => (reviewById.get(b.id)?.rating ?? 4) - (reviewById.get(a.id)?.rating ?? 4))
    .slice(0, limit);
}

export function buildHomeComparisonRows(
  compareProducts: Product[],
  reviewById: Map<string, ReviewSnapshotLike>
): HomeComparisonRow[] {
  if (compareProducts.length < 2) {
    return [];
  }

  const specificationMaps = new Map<string, Map<string, string>>();
  const specificationLabels = new Set<string>();

  compareProducts.forEach((product) => {
    const rawSpecifications =
      product.specifications && product.specifications.length > 0
        ? [...product.specifications]
            .sort((a, b) => a.position - b.position)
            .map((specification) => ({
              label: specification.label,
              value: specification.value,
            }))
        : buildTechnicalSpecs(product);

    const map = new Map<string, string>();
    rawSpecifications.forEach((specification) => {
      map.set(specification.label, specification.value);
      specificationLabels.add(specification.label);
    });
    specificationMaps.set(product.id, map);
  });

  const coreRows: HomeComparisonRow[] = [
    {
      label: 'Price',
      values: compareProducts.map((product) => formatCurrency(Number(product.price))),
    },
    {
      label: 'Category',
      values: compareProducts.map((product) => product.category?.name ?? 'Collection'),
    },
    {
      label: 'Brand',
      values: compareProducts.map((product) => getProductBrand(product)),
    },
    {
      label: 'Rating',
      values: compareProducts.map(
        (product) => `${(reviewById.get(product.id)?.rating ?? 4.7).toFixed(1)} / 5`
      ),
    },
    {
      label: 'Stock',
      values: compareProducts.map((product) =>
        product.stock > 0 ? `${product.stock} available` : 'Out of stock'
      ),
    },
    {
      label: 'Compatibility',
      values: compareProducts.map((product) => getCompatibilityTags(product).join(', ')),
    },
  ];

  const specificationRows = Array.from(specificationLabels)
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({
      label,
      values: compareProducts.map(
        (product) => specificationMaps.get(product.id)?.get(label) ?? 'N/A'
      ),
    }));

  return [...coreRows, ...specificationRows];
}
