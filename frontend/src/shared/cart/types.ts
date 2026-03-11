import type { Cart } from '@/shared/types';

export type StoredGuestCart = Omit<Cart, 'total'>;

export interface GuestCartSyncResult {
  syncedCount: number;
  remainingCount: number;
}
