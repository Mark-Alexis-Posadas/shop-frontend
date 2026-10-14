import { Route, Routes, Link } from "react-router-dom";

import MainLayout from "../shared/components/layout/MainLayout";

// Product Pages
import ProductListPage from "../features/products/pages/ProductListPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";

// Auth Pages
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

// Cart Pages
import CartPage from "../features/cart/pages/CartPage";

// Order Pages

import CheckoutPage from "../features/checkout/pages/CheckoutPage";
import OrderDetailsPage from "../features/orders/pages/OrderDetailsPage";
import MyOrdersPage from "../features/orders/pages/MyOrdersPage";

// Route Guards
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<ProductListPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />

        {/* Authentication Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />

          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailsPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <section className="px-6 py-24 text-center">
              <h1 className="text-6xl font-bold">404</h1>
              <p className="mt-4 text-gray-500">Page not found.</p>
              <Link to="/" className="mt-6 inline-block text-indigo-600">
                Return Home
              </Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRouter;
