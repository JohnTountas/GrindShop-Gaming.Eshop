export { useStorefrontState } from './hooks/useStorefrontState';
export { useWishlist } from './hooks/useWishlist';
export { useCompare } from './hooks/useCompare';
export { getProductBrand, getCompatibilityTags } from './utils/productMetadata';
export { buildTechnicalSpecs, buildReviewSnapshot } from './utils/productFallbacks';
export type {
  ProductLike,
  ReviewSnapshot,
  StorefrontSpecification,
  StorefrontState,
  StorefrontToggleResponse,
  StorefrontToggleResult,
} from './types';
