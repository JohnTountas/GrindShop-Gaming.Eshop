import { Link } from 'react-router-dom';
import type { Product } from '@/shared/types';
import { BRAND_NAME, BRAND_TAGLINE } from '@/shared/brand/identity';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface HomeHeroProps {
  hero?: Product;
  onAddToCart: (product: Product) => void;
}

export function HomeHero({ hero, onAddToCart }: HomeHeroProps) {
  return (
    <header className="surface-card grid gap-5 p-5 sm:gap-6 sm:p-6 lg:grid-cols-12 lg:p-8">
      <div className="lg:col-span-7">
        <p className="inline-flex rounded-full border border-accent-700/60 bg-primary-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          Esports-grade marketplace
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-primary-900 sm:text-4xl md:text-5xl">
          Build your edge with tournament-ready gear
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-primary-600 sm:text-base">
          {BRAND_NAME} delivers verified performance hardware with trusted delivery and clean
          checkout. {BRAND_TAGLINE}.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              document.getElementById('catalog-results')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="rounded-full bg-primary-800 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-neon hover:bg-primary-500"
          >
            Shop now
          </button>
        </div>
      </div>

      <aside className="surface-card border-primary-300/70 bg-primary-100/76 p-4 sm:p-5 lg:col-span-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          Featured product
        </p>
        {hero ? (
          <>
            <div className="product-image-frame mt-3 rounded-2xl border border-primary-300/70">
              <img
                src={hero.images[0]}
                alt={hero.title}
                className="product-image-zoom h-48 w-full object-cover sm:h-52"
              />
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-primary-900">{hero.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-primary-600">{hero.description}</p>
            <p className="mt-3 text-2xl font-bold text-primary-900">
              {formatCurrency(Number(hero.price))}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link
                to={`/products/${hero.id}`}
                className="catalog-action-button rounded-xl border border-primary-400/70 bg-primary-100/72 px-4 py-2.5 text-center text-sm font-semibold text-primary-800"
              >
                View details
              </Link>
              <button
                type="button"
                onClick={() => onAddToCart(hero)}
                className="catalog-action-button rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500"
              >
                Add to cart
              </button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-primary-600">Loading featured item...</p>
        )}
      </aside>
    </header>
  );
}
