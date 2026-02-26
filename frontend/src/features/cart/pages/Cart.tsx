/**
 * Shopping cart page for quantity edits, item removal, and totals.
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api/client';
import { Cart as CartType, CartItem } from '@/types';
import { getApiErrorMessage } from '@/lib/api/error';
import { isAuthenticated } from '@/lib/auth/session';

// Formats numeric values into EUR currency output for consistent UI pricing.
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

// Displays cart skeleton placeholders while asynchronous cart data is loading.
function LoadingCart() {
  return (
    <section aria-label="Loading cart" className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-8 w-40" />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="surface-card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="skeleton h-16 w-16 rounded-xl" />
                <div className="min-w-[180px] flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
                <div className="skeleton h-9 w-36 rounded-xl" />
                <div className="skeleton h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
        <div className="surface-card p-5 lg:col-span-4">
          <div className="space-y-3">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Coordinates cart data fetching, quantity mutations, removal actions, and order summary totals.
function Cart() {
  const queryClient = useQueryClient();
  const authed = isAuthenticated();
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');
  const [pendingUpdateItemId, setPendingUpdateItemId] = useState<string | null>(null);
  const [pendingRemoveItemId, setPendingRemoveItemId] = useState<string | null>(null);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get<CartType>('/cart');
      return response.data;
    },
    enabled: authed,
  });

  const updateItemMutation = useMutation({
    mutationFn: async (payload: { itemId: string; quantity: number }) => {
      return api.patch(`/cart/items/${payload.itemId}`, { quantity: payload.quantity });
    },
    onMutate: (payload) => {
      setStatusMessage('');
      setPendingUpdateItemId(payload.itemId);
    },
    onSuccess: async () => {
      setStatusTone('success');
      setStatusMessage('Cart updated');
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      setStatusTone('error');
      setStatusMessage(getApiErrorMessage(error, 'Unable to update cart item'));
    },
    onSettled: () => {
      setPendingUpdateItemId(null);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => api.delete(`/cart/items/${itemId}`),
    onMutate: (itemId) => {
      setStatusMessage('');
      setPendingRemoveItemId(itemId);
    },
    onSuccess: async () => {
      setStatusTone('success');
      setStatusMessage('Item removed from cart');
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      setStatusTone('error');
      setStatusMessage(getApiErrorMessage(error, 'Unable to remove cart item'));
    },
    onSettled: () => {
      setPendingRemoveItemId(null);
    },
  });

  // Calculates the extended line total for a single cart item.
  function itemTotal(item: CartItem) {
    return Number(item.product.price) * item.quantity;
  }

  if (!authed) {
    return (
      <section className="surface-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-primary-900">Your cart is protected</h1>
        <p className="mt-2 text-sm text-primary-600">
          Log in to view saved items, update quantities, and continue to secure checkout.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/login"
            className="rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            Go to login
          </Link>
          <Link
            to="/"
            className="rounded-full border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-800 hover:border-primary-400 hover:text-primary-900"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  if (cartQuery.isLoading) {
    return <LoadingCart />;
  }

  if (cartQuery.isError) {
    return (
      <div role="alert" className="surface-card border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Unable to load your cart</p>
        <p className="mt-1 text-sm">{getApiErrorMessage(cartQuery.error, 'Failed to load cart')}</p>
        <button
          type="button"
          onClick={() => cartQuery.refetch()}
          className="mt-4 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + itemTotal(item), 0);
  const shippingEstimate = subtotal >= 100 || items.length === 0 ? 0 : 3.5;
  const taxEstimate = subtotal * 0.24;
  const orderTotal = subtotal + shippingEstimate + taxEstimate;

  return (
    <section className="space-y-5">
      <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
            Shopping cart
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-primary-900">Review your items</h1>
        </div>
        <p className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
          {itemCount} items
        </p>
      </header>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className={`surface-card border px-4 py-3 text-sm font-semibold ${
            statusTone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {statusMessage}
        </p>
      )}

      {items.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-xl font-semibold text-primary-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-primary-600">
            Add products to your cart and return here to finalize checkout.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => {
              const isUpdating = pendingUpdateItemId === item.id;
              const isRemoving = pendingRemoveItemId === item.id;
              const isBusy = isUpdating || isRemoving;
              const canDecrease = item.quantity > 1 && !isBusy;
              const canIncrease = !isBusy;

              return (
                <article
                  key={item.id}
                  className="surface-card interactive-lift flex flex-wrap items-center gap-4 p-4 sm:p-5"
                >
                  <div className="product-image-frame h-16 w-16 rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        loading="lazy"
                        decoding="async"
                        className="product-image-zoom h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-600">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <h2 className="font-semibold text-primary-900">{item.product.title}</h2>
                    <p className="mt-1 text-sm text-primary-600">
                      {formatCurrency(Number(item.product.price))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary-200 bg-white text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canDecrease}
                      aria-label={`Decrease quantity for ${item.product.title}`}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-primary-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary-200 bg-white text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canIncrease}
                      aria-label={`Increase quantity for ${item.product.title}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItemMutation.mutate(item.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy}
                    >
                      {isRemoving ? 'Removing' : 'Remove'}
                    </button>
                  </div>

                  <p className="ml-auto text-sm font-semibold text-primary-900">
                    {isUpdating ? 'Updating...' : formatCurrency(itemTotal(item))}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="surface-card h-fit p-5 sm:p-6 lg:sticky lg:top-28 lg:col-span-4">
            <h2 className="text-xl font-semibold text-primary-900">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm text-primary-700">
              <div className="flex items-center justify-between">
                <p>Subtotal:</p>
                <p className="font-semibold text-primary-900">{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Estimated shipping:</p>
                <p className="font-semibold text-primary-900">{formatCurrency(shippingEstimate)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Estimated tax: 24%</p>
                <p className="font-semibold text-primary-900">{formatCurrency(taxEstimate)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/80 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-700">Estimated total</p>
                <p className="text-2xl font-bold text-primary-900">{formatCurrency(orderTotal)}</p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-900"
            >
              Continue to checkout
            </Link>
            <Link
              to="/"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900"
            >
              Continue shopping
            </Link>

            <div className="mt-4 rounded-2xl border border-primary-300/70 bg-primary-100/72 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                Accepted payment methods
              </p>
              <p className="mt-1 text-sm font-semibold text-primary-900">
                Visa • Mastercard • PayPal • Apple Pay • Google Pay
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Secure payment
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Fast delivery
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                30-day returns
              </p>
            </div>

            <p className="mt-2 text-xs text-primary-600">
              Shipping policy: same-day dispatch for paid orders before 14:00. Return policy: easy
              returns within 30 days.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
