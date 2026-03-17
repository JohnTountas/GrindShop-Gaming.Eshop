/**
 * Shared order contracts mapped to checkout, history, and detail screens.
 */
import type { Product } from './catalog';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  priceAtPurchase: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  stripePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentIntentId?: string;
  guestItems?: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}
