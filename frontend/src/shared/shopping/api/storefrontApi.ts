import api from '@/shared/api/client';
import type { StorefrontState, StorefrontToggleResponse } from '../types';

export async function fetchStorefrontState() {
  return (await api.get<StorefrontState>('/me/storefront')).data;
}

export async function toggleWishlistProduct(productId: string) {
  return (await api.post<StorefrontToggleResponse>('/me/wishlist/toggle', { productId })).data;
}

export async function toggleCompareProduct(productId: string) {
  return (await api.post<StorefrontToggleResponse>('/me/compare/toggle', { productId })).data;
}

export async function clearCompareProducts() {
  return (await api.delete<StorefrontState>('/me/compare')).data;
}

export function buildCompareClearUrl() {
  const compareApiBase = (api.defaults.baseURL ?? import.meta.env.VITE_API_URL ?? '/api').replace(
    /\/$/,
    ''
  );

  return `${compareApiBase}/me/compare`;
}
