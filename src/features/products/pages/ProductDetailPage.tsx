import { useAuthStore } from "../../auth/store/authStore";
import { requestErrorMessage } from "../../../shared/lib/requestError";
import { isAxiosError } from "axios";
import { ProductImage } from "../../../shared/components/ui/ProductImage";
import { useRef, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import { useProduct } from "../hooks/useProducts";
import { useCart } from "../../cart/hooks/useCart";

import {
  formatPrice,
  getDiscountPercentage,
  isLowStock,
} from "../utils/product.utils";

const ProductDetailPage = () => {
  const { productId = "" } = useParams();
  const location = useLocation();
  const candidate: unknown = location.state?.returnTo;
  const returnTo =
    typeof candidate === "string" &&
    /^(?:\/products|\/)(?:\?.*)?$/.test(candidate)
      ? candidate
      : "/products";

  const {
    data: product,
    isPending,
    isError,
    error,
    refetch,
  } = useProduct(productId);

  const cart = useCart();
  const { addToCart } = cart;
  const token = useAuthStore((state) => state.token);
  const addingRef = useRef(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  if (isPending) {
    return (
      <div
        role="status"
        className="mx-auto max-w-7xl px-5 py-20 text-sm text-slate-500 sm:px-8"
      >
        Loading product details...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAxiosError(error) && error.response?.status === 404
              ? "Product unavailable"
              : "Unable to load product"}
          </h1>
          <p role="alert" className="mt-3 leading-6 text-slate-600">
            {isAxiosError(error) && error.response?.status === 404
              ? "This product is no longer available. Browse other products."
              : requestErrorMessage(
                  error,
                  "Unable to load this product. Please try again.",
                )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={returnTo}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Back to products
            </Link>

            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];
  const selectedImage = images[selectedImageIndex] ?? images[0];

  const discount = getDiscountPercentage(product);
  const outOfStock = product.stock === 0;

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, Math.min(value, product.stock)));
  };

  const handleAddToCart = async () => {
    if (
      outOfStock ||
      addingRef.current ||
      !token ||
      cart.isUpdating ||
      cart.isFetching ||
      cart.isPending ||
      cart.isError
    )
      return;
    addingRef.current = true;

    setIsAdding(true);
    setCartMessage("");

    try {
      await addToCart(product._id, Math.min(quantity, product.stock));

      if (useAuthStore.getState().token !== token) return;
      setCartMessage(`${quantity} item(s) added to cart!`);
    } catch (error) {
      if (useAuthStore.getState().token !== token) return;
      setCartMessage(
        requestErrorMessage(
          error,
          "Unable to add this product. Refresh your cart and try again.",
        ),
      );
    } finally {
      addingRef.current = false;
      setIsAdding(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link
            to={returnTo}
            className="rounded hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Products
          </Link>
          <span className="mx-2 text-slate-300" aria-hidden="true">
            /
          </span>
          <span aria-current="page" className="font-medium text-slate-700">
            {product.name}
          </span>
        </nav>

        <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-8">
          {/* Product Gallery */}
          <section
            aria-label="Product images"
            className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"
          >
            <div className="flex h-[22rem] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 sm:h-[30rem]">
              {selectedImage ? (
                <ProductImage
                  src={selectedImage.url}
                  alt={selectedImage.alt || product.name}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <p className="text-sm text-slate-400">No image available</p>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImageIndex === index}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      selectedImageIndex === index
                        ? "border-indigo-600"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <ProductImage
                      src={image.url}
                      alt={image.alt || product.name}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product Information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
              {product.category}
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 md:text-4xl">
              {product.name}
            </h1>

            {product.brand && (
              <p className="mt-3 text-sm text-slate-500">
                Brand: {product.brand}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold tracking-tight text-slate-950">
                {formatPrice(product.price)}
              </span>

              {discount > 0 && product.compareAtPrice != null && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>

                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 leading-7 text-slate-600">
              {product.description}
            </p>

            <div className="mt-6">
              {outOfStock ? (
                <p className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
                  Out of Stock
                </p>
              ) : isLowStock(product) ? (
                <p className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
                  Only {product.stock} items remaining
                </p>
              ) : (
                <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                  In Stock ({product.stock} available)
                </p>
              )}
            </div>

            {!outOfStock && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Quantity
                </p>

                <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-5 py-3 text-slate-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="min-w-12 text-center font-semibold">
                    {Math.min(quantity, product.stock)}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-5 py-3 text-slate-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {!token && !outOfStock ? (
              <div className="mt-8">
                <p className="text-sm text-slate-600">
                  Sign in to add items to your cart. Nothing will be added
                  automatically.
                </p>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="mt-3 inline-flex rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in to add to cart
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleAddToCart()}
                disabled={
                  outOfStock ||
                  isAdding ||
                  cart.isUpdating ||
                  cart.isFetching ||
                  cart.isPending ||
                  cart.isError
                }
                className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {outOfStock
                  ? "Out of Stock"
                  : isAdding
                    ? "Adding..."
                    : cart.isPending || cart.isFetching
                      ? "Loading cart..."
                      : "Add to Cart"}
              </button>
            )}
            {token && cart.isError && (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
              >
                <p>
                  Unable to load your cart. Check your connection and retry.
                </p>
                <button
                  type="button"
                  onClick={() => void cart.refetch()}
                  className="mt-2 rounded font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Retry cart
                </button>
              </div>
            )}

            {cartMessage && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
              >
                {cartMessage}
              </p>
            )}

            <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-500">
              <p>SKU: {product.sku}</p>
              <p className="mt-2">Category: {product.category}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;
