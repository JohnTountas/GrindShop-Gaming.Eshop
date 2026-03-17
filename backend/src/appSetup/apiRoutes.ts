import type { Express } from 'express';
import authRoutes from '../features/auth/auth.routes';
import productRoutes from '../features/products/product.routes';
import cartRoutes from '../features/cart/cart.routes';
import orderRoutes, { adminRouter as adminOrderRoutes } from '../features/orders/order.routes';
import categoryRoutes from '../features/categories/category.routes';
import shoppingStateRoutes from '../features/shoppingState/shoppingState.routes';
import catalogManagementRoutes from '../features/catalogManagement/catalogManagement.routes';

// Keep route registration flat and explicit here. It makes the public surface
// area easy to audit without hunting through setup code.
export function registerApiFeatureRoutes(expressApplication: Express, apiBasePath: string): void {
  expressApplication.use(`${apiBasePath}/auth`, authRoutes);
  expressApplication.use(`${apiBasePath}/products`, productRoutes);
  expressApplication.use(`${apiBasePath}/cart`, cartRoutes);
  expressApplication.use(`${apiBasePath}/orders`, orderRoutes);
  expressApplication.use(`${apiBasePath}/admin/orders`, adminOrderRoutes);
  expressApplication.use(`${apiBasePath}/admin/catalog`, catalogManagementRoutes);
  expressApplication.use(`${apiBasePath}/categories`, categoryRoutes);
  expressApplication.use(`${apiBasePath}/me`, shoppingStateRoutes);
}

