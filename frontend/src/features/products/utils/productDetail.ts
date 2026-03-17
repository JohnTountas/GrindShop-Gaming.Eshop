/**
 * Helpers for product detail page derivations.
 */
import type { Product } from '@/shared/types';
import { buildReviewSnapshot, type ReviewSnapshot } from '@/shared/shopping';

export function buildProductReviewSummary(product: Product): ReviewSnapshot {
  const reviews = product.reviews ?? [];

  if (reviews.length === 0) {
    return buildReviewSnapshot(product);
  }

  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, item) => sum + Number(item.rating), 0) / Math.max(1, totalReviews);
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((item) => item.rating === stars).length;
    return {
      stars,
      count,
      percent: Math.round((count / totalReviews) * 100),
    };
  });

  return {
    rating: Number(averageRating.toFixed(1)),
    totalReviews,
    breakdown,
    quotes: reviews.slice(0, 3).map((item) => item.comment),
  };
}

export function getRelatedProducts(products: Product[] | undefined, currentProductId: string | undefined) {
  return (products ?? []).filter((item) => item.id !== currentProductId).slice(0, 4);
}
