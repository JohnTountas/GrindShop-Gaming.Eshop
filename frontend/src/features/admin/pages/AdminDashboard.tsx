/**
 * Premium admin dashboard for order control and product spec/review management.
 */
import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/client';
import { Order, Product, ProductReview, ProductSpecification } from '@/types';
import { getApiErrorMessage } from '@/lib/api/error';

interface AdminOrder extends Order {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface AdminProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminProductContent extends Product {
  specifications: ProductSpecification[];
  reviews: ProductReview[];
}

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

const EMPTY_ORDERS: AdminOrder[] = [];
const EMPTY_ADMIN_PRODUCTS: Product[] = [];

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'border-amber-300/70 bg-amber-900/30 text-amber-200',
  PAID: 'border-sky-300/70 bg-sky-900/30 text-sky-200',
  SHIPPED: 'border-emerald-300/70 bg-emerald-900/30 text-emerald-200',
  CANCELLED: 'border-red-300/70 bg-red-900/30 text-red-200',
};

// Formats numeric values into EUR currency output for consistent UI pricing.
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value);
}

// Coordinates order operations and product-content management for administrators.
function AdminDashboard() {
  const queryClient = useQueryClient();

  // Product targeting + operator feedback.
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Specification form state.
  const [specLabel, setSpecLabel] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [specPosition, setSpecPosition] = useState('0');

  // Review form state.
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewVerified, setReviewVerified] = useState(true);

  // Dashboard data queries.
  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get<AdminOrder[]>('/admin/orders')).data,
  });

  const productsQuery = useQuery({
    queryKey: ['admin-products', productSearch],
    queryFn: async () =>
      (
        await api.get<AdminProductsResponse>('/admin/catalog/products', {
          params: {
            limit: 120,
            search: productSearch || undefined,
          },
        })
      ).data,
  });

  const productContentQuery = useQuery({
    queryKey: ['admin-product-content', selectedProductId],
    queryFn: async () =>
      (await api.get<AdminProductContent>(`/admin/catalog/products/${selectedProductId}/content`))
        .data,
    enabled: Boolean(selectedProductId),
  });

  // Order lifecycle mutation.
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (payload: { orderId: string; status: OrderStatus }) =>
      api.patch(`/admin/orders/${payload.orderId}/status`, { status: payload.status }),
    onSuccess: async () => {
      setStatusMessage('Order status updated successfully.');
      await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => {
      setStatusMessage(getApiErrorMessage(error, 'Failed to update order status'));
    },
  });

  // Specification CRUD mutations.
  const createSpecMutation = useMutation({
    mutationFn: async () =>
      api.post(`/admin/catalog/products/${selectedProductId}/specifications`, {
        label: specLabel,
        value: specValue,
        position: Number(specPosition) || 0,
      }),
    onSuccess: async () => {
      setStatusMessage('Specification created.');
      setSpecLabel('');
      setSpecValue('');
      setSpecPosition('0');
      await queryClient.invalidateQueries({
        queryKey: ['admin-product-content', selectedProductId],
      });
    },
    onError: (error) =>
      setStatusMessage(getApiErrorMessage(error, 'Failed to create specification')),
  });

  const updateSpecMutation = useMutation({
    mutationFn: async (payload: {
      specificationId: string;
      label: string;
      value: string;
      position: number;
    }) =>
      api.patch(`/admin/catalog/specifications/${payload.specificationId}`, {
        label: payload.label,
        value: payload.value,
        position: payload.position,
      }),
    onSuccess: async () => {
      setStatusMessage('Specification updated.');
      await queryClient.invalidateQueries({
        queryKey: ['admin-product-content', selectedProductId],
      });
    },
    onError: (error) =>
      setStatusMessage(getApiErrorMessage(error, 'Failed to update specification')),
  });

  const deleteSpecMutation = useMutation({
    mutationFn: async (specificationId: string) =>
      api.delete(`/admin/catalog/specifications/${specificationId}`),
    onSuccess: async () => {
      setStatusMessage('Specification deleted.');
      await queryClient.invalidateQueries({
        queryKey: ['admin-product-content', selectedProductId],
      });
    },
    onError: (error) =>
      setStatusMessage(getApiErrorMessage(error, 'Failed to delete specification')),
  });

  // Review CRUD mutations.
  const createReviewMutation = useMutation({
    mutationFn: async () =>
      api.post(`/admin/catalog/products/${selectedProductId}/reviews`, {
        authorName: reviewAuthor,
        title: reviewTitle || undefined,
        comment: reviewComment,
        rating: Number(reviewRating),
        verifiedPurchase: reviewVerified,
      }),
    onSuccess: async () => {
      setStatusMessage('Review created.');
      setReviewAuthor('');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating('5');
      setReviewVerified(true);
      await queryClient.invalidateQueries({
        queryKey: ['admin-product-content', selectedProductId],
      });
    },
    onError: (error) => setStatusMessage(getApiErrorMessage(error, 'Failed to create review')),
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (payload: {
      reviewId: string;
      authorName: string;
      title: string;
      comment: string;
      rating: number;
      verifiedPurchase: boolean;
    }) =>
      api.patch(`/admin/catalog/reviews/${payload.reviewId}`, {
        authorName: payload.authorName,
        title: payload.title || undefined,
        comment: payload.comment,
        rating: payload.rating,
        verifiedPurchase: payload.verifiedPurchase,
      }),
    onSuccess: async () => {
      setStatusMessage('Review updated.');
      await queryClient.invalidateQueries({
        queryKey: ['admin-product-content', selectedProductId],
      });
    },
    onError: (error) => setStatusMessage(getApiErrorMessage(error, 'Failed to update review')),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => api.delete(`/admin/catalog/reviews/${reviewId}`),
    onSuccess: async () => {
      setStatusMessage('Review deleted.');
      await queryClient.invalidateQueries({
        queryKey: ['admin-product-content', selectedProductId],
      });
    },
    onError: (error) => setStatusMessage(getApiErrorMessage(error, 'Failed to delete review')),
  });

  const orders = ordersQuery.data ?? EMPTY_ORDERS;
  const products = productsQuery.data?.products ?? EMPTY_ADMIN_PRODUCTS;
  const selectedProduct = productContentQuery.data;

  // Headline KPI cards.
  const pending = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders]
  );
  const paid = useMemo(() => orders.filter((order) => order.status === 'PAID').length, [orders]);
  const shipped = useMemo(
    () => orders.filter((order) => order.status === 'SHIPPED').length,
    [orders]
  );
  const revenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total), 0),
    [orders]
  );

  // Validates inputs and submits a new specification for the selected product.
  function createSpecification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProductId || !specLabel.trim() || !specValue.trim()) {
      setStatusMessage('Select a product and provide specification label/value.');
      return;
    }
    createSpecMutation.mutate();
  }

  // Validates inputs and submits a new review for the selected product.
  function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProductId || !reviewAuthor.trim() || !reviewComment.trim()) {
      setStatusMessage('Select a product and provide review author/comment.');
      return;
    }
    createReviewMutation.mutate();
  }

  if (ordersQuery.isLoading || productsQuery.isLoading) {
    return <p className="text-sm text-primary-600">Loading admin data...</p>;
  }

  if (ordersQuery.isError || productsQuery.isError) {
    return (
      <div className="surface-card border border-red-300/70 bg-red-900/20 p-4 text-red-100">
        {getApiErrorMessage(
          ordersQuery.error || productsQuery.error,
          'Failed to load admin dashboard'
        )}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          Admin control center
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-primary-900">Storefront Operations</h1>
        <p className="mt-2 text-sm text-primary-600">
          Manage order statuses and maintain real product specifications/reviews from one dashboard.
        </p>
      </header>

      {statusMessage && (
        <p className="surface-card border border-accent-700/45 bg-accent-700/10 p-3 text-sm font-semibold text-primary-900">
          {statusMessage}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Pending
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{pending}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Paid</p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{paid}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Shipped
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{shipped}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{formatCurrency(revenue)}</p>
        </article>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-xl font-semibold text-primary-900">Recent Orders</h2>
        <div className="mt-4 space-y-2">
          {orders.slice(0, 10).map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-primary-900">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-primary-600">
                    {order.user?.email ?? 'Customer'} | {formatCurrency(Number(order.total))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status as OrderStatus]}`}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateOrderStatusMutation.mutate({
                        orderId: order.id,
                        status: event.target.value as OrderStatus,
                      })
                    }
                    className="rounded-lg border border-primary-300/70 bg-primary-100/75 px-2 py-1 text-xs font-semibold text-primary-900"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="surface-card space-y-3 p-5 xl:sticky xl:top-28">
          <h2 className="text-xl font-semibold text-primary-900">Catalog Management</h2>
          <input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          />
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-primary-600">
            {productsQuery.data?.pagination.total ?? 0} products available for management.
          </p>
        </aside>

        <div className="space-y-5">
          {!selectedProductId && (
            <div className="surface-card p-5 text-sm text-primary-600">
              Select a product to edit technical specifications and reviews.
            </div>
          )}

          {selectedProductId && productContentQuery.isLoading && (
            <div className="surface-card p-5 text-sm text-primary-600">
              Loading product content...
            </div>
          )}

          {selectedProductId && productContentQuery.isError && (
            <div className="surface-card border border-red-300/70 bg-red-900/20 p-5 text-red-100">
              {getApiErrorMessage(productContentQuery.error, 'Failed to load product content')}
            </div>
          )}

          {selectedProduct && (
            <>
              <section className="surface-card p-5">
                <h3 className="text-xl font-semibold text-primary-900">{selectedProduct.title}</h3>
                <p className="mt-1 text-sm text-primary-600">
                  {selectedProduct.category?.name} | {formatCurrency(Number(selectedProduct.price))}
                </p>
              </section>

              <section className="surface-card p-5">
                <h3 className="text-lg font-semibold text-primary-900">Technical Specifications</h3>
                <form
                  onSubmit={createSpecification}
                  className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_90px_140px]"
                >
                  <input
                    value={specLabel}
                    onChange={(event) => setSpecLabel(event.target.value)}
                    placeholder="Label (e.g. CPU)"
                    className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                  />
                  <input
                    value={specValue}
                    onChange={(event) => setSpecValue(event.target.value)}
                    placeholder="Value"
                    className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                  />
                  <input
                    value={specPosition}
                    onChange={(event) => setSpecPosition(event.target.value)}
                    type="number"
                    min={0}
                    placeholder="Position"
                    className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                  />
                  <button
                    type="submit"
                    disabled={createSpecMutation.isPending}
                    className="rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Add spec
                  </button>
                </form>

                <div className="mt-3 space-y-2">
                  {selectedProduct.specifications.map((specification) => (
                    <SpecificationRow
                      key={specification.id}
                      specification={specification}
                      onSave={(payload) => updateSpecMutation.mutate(payload)}
                      onDelete={(idToDelete) => deleteSpecMutation.mutate(idToDelete)}
                    />
                  ))}
                  {selectedProduct.specifications.length === 0 && (
                    <p className="text-sm text-primary-600">No specifications yet.</p>
                  )}
                </div>
              </section>

              <section className="surface-card p-5">
                <h3 className="text-lg font-semibold text-primary-900">Product Reviews</h3>
                <form onSubmit={createReview} className="mt-3 space-y-2">
                  <div className="grid gap-2 md:grid-cols-3">
                    <input
                      value={reviewAuthor}
                      onChange={(event) => setReviewAuthor(event.target.value)}
                      placeholder="Author name"
                      className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                    />
                    <input
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      placeholder="Title (optional)"
                      className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                    />
                    <input
                      value={reviewRating}
                      onChange={(event) => setReviewRating(event.target.value)}
                      type="number"
                      min={1}
                      max={5}
                      className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                    />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Review comment"
                    rows={3}
                    className="w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm text-primary-900"
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-primary-700">
                    <input
                      type="checkbox"
                      checked={reviewVerified}
                      onChange={(event) => setReviewVerified(event.target.checked)}
                    />
                    Verified purchase
                  </label>
                  <button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    className="rounded-xl bg-primary-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Add review
                  </button>
                </form>

                <div className="mt-3 space-y-2">
                  {selectedProduct.reviews.map((review) => (
                    <ReviewRow
                      key={review.id}
                      review={review}
                      onSave={(payload) => updateReviewMutation.mutate(payload)}
                      onDelete={(idToDelete) => deleteReviewMutation.mutate(idToDelete)}
                    />
                  ))}
                  {selectedProduct.reviews.length === 0 && (
                    <p className="text-sm text-primary-600">No reviews yet.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </section>
  );
}

// Inline editor row for updating or deleting one product specification.
function SpecificationRow({
  specification,
  onSave,
  onDelete,
}: {
  specification: ProductSpecification;
  onSave: (payload: {
    specificationId: string;
    label: string;
    value: string;
    position: number;
  }) => void;
  onDelete: (specificationId: string) => void;
}) {
  const [label, setLabel] = useState(specification.label);
  const [value, setValue] = useState(specification.value);
  const [position, setPosition] = useState(String(specification.position));

  return (
    <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_90px_auto_auto]">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          type="number"
          min={0}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <button
          type="button"
          onClick={() =>
            onSave({
              specificationId: specification.id,
              label,
              value,
              position: Number(position) || 0,
            })
          }
          className="rounded-lg bg-primary-800 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => onDelete(specification.id)}
          className="rounded-lg border border-red-300/70 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Inline editor row for updating or deleting one product review.
function ReviewRow({
  review,
  onSave,
  onDelete,
}: {
  review: ProductReview;
  onSave: (payload: {
    reviewId: string;
    authorName: string;
    title: string;
    comment: string;
    rating: number;
    verifiedPurchase: boolean;
  }) => void;
  onDelete: (reviewId: string) => void;
}) {
  const [authorName, setAuthorName] = useState(review.authorName);
  const [title, setTitle] = useState(review.title ?? '');
  const [comment, setComment] = useState(review.comment);
  const [rating, setRating] = useState(String(review.rating));
  const [verifiedPurchase, setVerifiedPurchase] = useState(review.verifiedPurchase);

  return (
    <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <input
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
        <input
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          type="number"
          min={1}
          max={5}
          className="rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
        />
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg border border-primary-300/70 bg-primary-100/72 px-2 py-1.5 text-xs text-primary-900"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-xs text-primary-700">
          <input
            type="checkbox"
            checked={verifiedPurchase}
            onChange={(event) => setVerifiedPurchase(event.target.checked)}
          />
          Verified purchase
        </label>
        <button
          type="button"
          onClick={() =>
            onSave({
              reviewId: review.id,
              authorName,
              title,
              comment,
              rating: Number(rating) || 1,
              verifiedPurchase,
            })
          }
          className="rounded-lg bg-primary-800 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => onDelete(review.id)}
          className="rounded-lg border border-red-300/70 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
