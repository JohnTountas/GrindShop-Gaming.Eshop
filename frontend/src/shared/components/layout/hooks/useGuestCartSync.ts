import { useEffect } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { guestCartHasItems, syncGuestCartToServer } from '@/shared/cart/guestCart';
import { showSuccessMessage } from '@/shared/ui/toast';

// Moves persisted guest-cart lines into the server cart immediately after login.
export function useGuestCartSync(authed: boolean, queryClient: QueryClient) {
  useEffect(() => {
    if (!authed || !guestCartHasItems()) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { syncedCount } = await syncGuestCartToServer();

      if (cancelled || syncedCount === 0) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      showSuccessMessage({
        title: 'Cart synced',
        message: 'Your guest cart is now available in your account.',
        tone: 'success',
        durationMs: 3500,
        actionLabel: 'View cart',
        actionTo: '/cart',
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [authed, queryClient]);
}
