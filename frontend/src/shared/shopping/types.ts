import type { Product } from '@/shared/types';

export type ProductLike = Pick<Product, 'id' | 'title' | 'price'> & {
  category?: {
    name?: string;
    slang?: string;
  };
};

export interface StorefrontState {
  wishlistProductIds: string[];
  compareProductIds: string[];
  compareLimit: number;
}

export interface StorefrontToggleResult {
  added: boolean;
  ids: string[];
  reachedLimit: boolean;
}

export interface StorefrontToggleResponse extends StorefrontState {
  added: boolean;
  reachedLimit?: boolean;
}

export interface StorefrontSpecification {
  label: string;
  value: string;
}

export interface ReviewBreakdownItem {
  stars: number;
  count: number;
  percent: number;
}

export interface ReviewSnapshot {
  rating: number;
  totalReviews: number;
  breakdown: ReviewBreakdownItem[];
  quotes: string[];
}
