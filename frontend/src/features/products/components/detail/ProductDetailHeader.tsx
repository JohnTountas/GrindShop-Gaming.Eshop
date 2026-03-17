import { Link } from 'react-router-dom';
import type { Product } from '@/shared/types';
import { getProductBrand } from '@/shared/shopping';

interface ProductDetailHeaderProps {
  product: Product;
}

export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  return (
    <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          Product detail
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary-900 sm:text-3xl">
          {product.title}
        </h1>
        <p className="mt-1 text-sm text-primary-600">
          {getProductBrand(product)} | {product.category?.name ?? 'Gaming'}
        </p>
      </div>
      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
        <Link
          to="/"
          className="rounded-full border border-primary-400/70 bg-primary-100/72 px-4 py-2.5 text-center text-sm font-semibold text-primary-800"
        >
          Continue shopping
        </Link>
        <Link
          to="/cart"
          className="rounded-full bg-primary-800 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-neon"
        >
          View cart
        </Link>
      </div>
    </header>
  );
}
