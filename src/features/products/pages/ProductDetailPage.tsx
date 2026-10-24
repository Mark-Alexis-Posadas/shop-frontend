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
      <div className="mx-auto max-w-7xl px-6 py-20">
        Loading product details...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-2xl font-bold">
          {isAxiosError(error) && error.response?.status === 404
            ? "Product unavailable"
            : "Unable to load product"}
        </h1>
        <p role="alert" className="mt-3 text-slate-600">
          {isAxiosError(error) && error.response?.status === 404
            ? "This product is no longer available. Browse other products."
            : requestErrorMessage(
                error,
                "Unable to load this product. Please try again.",
              )}
        </p>
        <Link
          to={returnTo}
          className="mt-4 block font-semibold text-indigo-600"
        >
          Back to products
        </Link>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Try Again
        </button>
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
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 text-sm text-gray-500">
        <Link to={returnTo} className="hover:text-indigo-600">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Product Gallery */}
        <section>
          <div className="flex h-96 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
            {selectedImage ? (
              <ProductImage
                src={selectedImage.url}
                alt={selectedImage.alt || product.name}
                className="h-full w-full object-contain p-6"
              />
            ) : (
              <p className="text-gray-400">No Image Available</p>
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
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    selectedImageIndex === index
                      ? "border-indigo-600"
                      : "border-gray-200"
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
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
            {product.name}
          </h1>

          {product.brand && (
            <p className="mt-3 text-gray-500">Brand: {product.brand}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>

            {discount > 0 && product.compareAtPrice != null && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>

                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 leading-7 text-gray-600">{product.description}</p>

          <div className="mt-6">
            {outOfStock ? (
              <p className="font-semibold text-red-600">Out of Stock</p>
            ) : isLowStock(product) ? (
              <p className="font-semibold text-orange-600">
                Only {product.stock} items remaining
              </p>
            ) : (
              <p className="font-semibold text-green-600">
                In Stock ({product.stock} available)
              </p>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold">Quantity</p>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-300">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-5 py-3 hover:bg-gray-100 disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-12 text-center font-semibold">
                  {Math.min(quantity, product.stock)}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="px-5 py-3 hover:bg-gray-100 disabled:opacity-40"
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
                className="mt-3 inline-flex rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white focus-visible:outline-2"
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
              className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
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
            <div role="alert" className="mt-3 text-sm text-red-700">
              <p>Unable to load your cart. Check your connection and retry.</p>
              <button
                type="button"
                onClick={() => void cart.refetch()}
                className="mt-2 font-semibold underline"
              >
                Retry cart
              </button>
            </div>
          )}

          {cartMessage && (
            <p role="status" className="mt-3 text-sm text-gray-700">
              {cartMessage}
            </p>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6 text-sm text-gray-500">
            <p>SKU: {product.sku}</p>
            <p className="mt-2">Category: {product.category}</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetailPage;
