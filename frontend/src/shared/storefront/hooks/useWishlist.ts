import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleWishlistProduct } from '../api/storefrontApi';
import { defaultStorefrontState } from '../constants';
import { storefrontStateKey, wishlistProductsKey } from '../queryKeys';
import type { StorefrontToggleResult } from '../types';
import { useStorefrontState } from './useStorefrontState';

export function useWishlist() {
  const queryClient = useQueryClient();
  const storefrontQuery = useStorefrontState();
  const ids = storefrontQuery.data?.wishlistProductIds ?? defaultStorefrontState.wishlistProductIds;

  const toggleMutation = useMutation({
    mutationFn: toggleWishlistProduct,
    onSuccess: async (data) => {
      queryClient.setQueryData(storefrontStateKey, data);
      await queryClient.invalidateQueries({ queryKey: wishlistProductsKey });
    },
  });

  return {
    ids,
    isLoading: storefrontQuery.isLoading || toggleMutation.isPending,
    async toggle(productId: string): Promise<StorefrontToggleResult> {
      const response = await toggleMutation.mutateAsync(productId);

      return {
        added: response.added,
        ids: response.wishlistProductIds,
        reachedLimit: false,
      };
    },
    clear() {
      // Wishlist is toggled item-by-item in the current UX.
    },
  };
}
