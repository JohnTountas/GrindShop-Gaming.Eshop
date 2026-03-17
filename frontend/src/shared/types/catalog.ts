/**
 * Shared catalog contracts for products, categories, specifications, and reviews.
 */
export interface ProductSpecification {
  id: string;
  productId: string;
  label: string;
  value: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string | null;
  authorName: string;
  title?: string | null;
  comment: string;
  rating: number;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slang: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  category?: Category;
  specifications?: ProductSpecification[];
  reviews?: ProductReview[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}
