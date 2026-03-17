import { Link } from 'react-router-dom';
import type { Product } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface RelatedProductsSectionProps {
  products: Product[];
}

export function RelatedProductsSection({ products }: RelatedProductsSectionProps) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-xl font-semibold text-primary-900">Related products</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3"
          >
            <div className="product-image-frame rounded-xl">
              <img
                src={item.images[0]}
                alt={item.title}
                className="product-image-zoom h-36 w-full object-cover"
              />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-primary-900">{item.title}</h3>
            <p className="mt-1 text-sm font-semibold text-primary-900">
              {formatCurrency(Number(item.price))}
            </p>
            <Link
              to={`/products/${item.id}`}
              className="catalog-action-button mt-2 inline-flex w-full justify-center rounded-lg border border-primary-400/70 bg-primary-100/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-800"
            >
              View
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
