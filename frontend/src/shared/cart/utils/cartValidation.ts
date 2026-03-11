import type { Product } from '@/shared/types';

// Rejects quantities that are non-numeric or below the minimum allowed cart quantity.
export function ensureValidQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
}

// Rejects cart updates that would exceed the available inventory for a product.
export function ensureStockAvailable(product: Product, quantity: number) {
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }
}
