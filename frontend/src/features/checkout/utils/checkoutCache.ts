/**
 * Cache updates applied after a successful authenticated checkout.
 */
import type { QueryClient } from '@tanstack/react-query';
import { cartKey } from '@/features/cart/queryKeys';
import { orderDetailKey, ordersKey } from '@/features/orders/queryKeys';
import { wishlistProductsKey, storefrontStateKey } from '@/shared/shopping/queryKeys';
import type { Cart, Order, Product } from '@/shared/types';
import type { StorefrontState } from '@/shared/shopping/types';

export async function applySuccessfulCheckoutCacheUpdates(queryClient: QueryClient, order: Order) {
  const purchasedProductIds = new Set(order.items.map((item) => item.productId));

  queryClient.setQueryData<Cart | undefined>(cartKey, (currentCart) => {
    if (!currentCart) {
      return currentCart;
    }

    return {
      ...currentCart,
      items: [],
      total: 0,
      updatedAt: new Date().toISOString(),
    };
  });

  queryClient.setQueryData<StorefrontState | undefined>(storefrontStateKey, (currentState) => {
    if (!currentState) {
      return currentState;
    }

    return {
      ...currentState,
      wishlistProductIds: currentState.wishlistProductIds.filter(
        (productId) => !purchasedProductIds.has(productId)
      ),
    };
  });

  queryClient.setQueryData<Product[] | undefined>(wishlistProductsKey, (currentProducts) => {
    if (!currentProducts) {
      return currentProducts;
    }

    return currentProducts.filter((product) => !purchasedProductIds.has(product.id));
  });

  queryClient.setQueryData<Order[] | undefined>(ordersKey, (currentOrders) => {
    if (!currentOrders) {
      return [order];
    }

    return [order, ...currentOrders.filter((currentOrder) => currentOrder.id !== order.id)];
  });

  queryClient.setQueryData(orderDetailKey(order.id), order);

  await queryClient.invalidateQueries({ queryKey: cartKey });
  await queryClient.invalidateQueries({ queryKey: storefrontStateKey });
  await queryClient.invalidateQueries({ queryKey: wishlistProductsKey });
  await queryClient.invalidateQueries({ queryKey: ordersKey });
}
