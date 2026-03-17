import type { Product } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface MobilePurchaseBarProps {
  product: Product;
  inStock: boolean;
  isCartActionPending: boolean;
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function MobilePurchaseBar({
  product,
  inStock,
  isCartActionPending,
  isAddingToCart,
  isBuyingNow,
  onAddToCart,
  onBuyNow,
}: MobilePurchaseBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-300/70 bg-primary-50/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary-600">
            {product.title}
          </p>
          <p className="text-lg font-bold text-primary-900">
            {formatCurrency(Number(product.price))}
          </p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!inStock || isCartActionPending}
            className="catalog-action-button rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isAddingToCart ? 'Adding...' : 'Add to cart'}
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            disabled={!inStock || isCartActionPending}
            className="catalog-action-button rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2.5 text-sm font-semibold text-primary-800 disabled:opacity-60"
          >
            {isBuyingNow ? 'Checkout...' : 'Buy now'}
          </button>
        </div>
      </div>
    </div>
  );
}
