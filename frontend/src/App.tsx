/**
 * Top-level frontend route tree and application provider composition.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Home from './features/products/pages/Home';
import ProductDetail from './features/products/pages/ProductDetail';
import Cart from './features/cart/pages/Cart';
import Checkout from './features/checkout/pages/Checkout';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Orders from './features/orders/pages/Orders';
import OrderDetail from './features/orders/pages/OrderDetail';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import Wishlist from './features/wishlist/pages/Wishlist';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// Composes global providers and route definitions for the storefront application.
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            <Route path="checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="orders/:id" element={
              <ProtectedRoute><OrderDetail /></ProtectedRoute>
            } />
            <Route path="wishlist" element={
              <ProtectedRoute><Wishlist /></ProtectedRoute>
            } />
            <Route path="admin/*" element={
              <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
