import { Route, Routes, Link } from "react-router-dom";
import MainLayout from "../shared/components/layout/MainLayout";
import PagePlaceholder from "../shared/components/ui/PagePlaceholder";
import ProductListPage from "../features/products/pages/ProductListPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<ProductListPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />

        <Route
          path="cart"
          element={
            <PagePlaceholder
              title="Your Shopping Cart"
              description="Your cart items will appear here."
            />
          }
        />

        <Route
          path="checkout"
          element={
            <PagePlaceholder
              title="Checkout"
              description="Secure checkout is coming soon."
            />
          }
        />

        <Route
          path="orders"
          element={
            <PagePlaceholder
              title="My Orders"
              description="Your order history will appear here."
            />
          }
        />

        <Route
          path="login"
          element={
            <PagePlaceholder
              title="Welcome Back"
              description="Login functionality is coming soon."
            />
          }
        />

        <Route
          path="register"
          element={
            <PagePlaceholder
              title="Create Account"
              description="Registration functionality is coming soon."
            />
          }
        />

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
