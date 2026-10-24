import { requestErrorMessage } from "../../../shared/lib/requestError";
import { ProductImage } from "../../../shared/components/ui/ProductImage";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";

import { useCart } from "../hooks/useCart";
import { formatPrice } from "../../products/utils/product.utils";
import { isUnavailable } from "../services/cartService";

export default function CartPage() {
  const {
    data: cart,
    isPending,
    isError,
    error,
    isUpdating,
    updateError,
    changeQuantity,
    removeFromCart,
    refetch,
  } = useCart();

  if (isPending) {
    return (
      <main className="min-h-[80vh] bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 h-9 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-28 w-28 animate-pulse rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-9 w-32 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={30} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Unable to load your cart
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {requestErrorMessage(
              error,
              "Unable to load your cart. Please try again.",
            )}
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
          <Link
            to="/products"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const items = cart?.items ?? [];

  const subtotal = items.reduce(
    (total, item) => total + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="min-h-[85vh] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-sm text-slate-400"
        >
          <Link to="/products" className="transition hover:text-indigo-600">
            Products
          </Link>

          <ChevronRight size={15} />

          <span className="font-semibold text-slate-700">Shopping Cart</span>
        </nav>

        {/* Page header */}
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              <ShoppingBag size={14} />
              YOUR SHOPPING BAG
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {totalQuantity === 0
                ? "Your shopping bag is waiting to be filled."
                : `${totalQuantity} ${
                    totalQuantity === 1 ? "item" : "items"
                  } in your cart`}
            </p>
          </div>

          {items.length > 0 && (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty cart */
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="pointer-events-none absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-50 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                <ShoppingCart size={42} strokeWidth={1.6} />
              </div>

              <h2 className="mt-8 text-2xl font-extrabold text-slate-900">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
                Looks like you haven't added anything yet. Explore our
                collection and find something you'll love.
              </p>

              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                Start Shopping
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <section
              aria-label="Cart items"
              className="space-y-5 lg:col-span-2"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-slate-900">Your Items</h2>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                  {items.length} {items.length === 1 ? "product" : "products"}
                </span>
              </div>

              {items.map((item) => {
                const product = item.product;

                if (!product)
                  return (
                    <article
                      key={item.productId}
                      className="rounded-2xl border border-red-200 bg-white p-6"
                    >
                      <p className="font-semibold text-slate-900">
                        Product no longer available
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Remove this item before checkout. Quantity:{" "}
                        {item.quantity}
                      </p>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          void removeFromCart(item.productId).catch(() => {});
                        }}
                        className="mt-3 rounded-xl px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 disabled:opacity-40"
                      >
                        Remove unavailable item
                      </button>
                    </article>
                  );

                const image =
                  product.images?.find((img) => img.isPrimary)?.url ??
                  product.images?.[0]?.url;

                const itemTotal = product.price * item.quantity;
                const atStockLimit = item.quantity >= product.stock;
                const unavailable = !product.isActive || product.stock < 1;
                const exceedsStock = item.quantity > product.stock;

                return (
                  <article
                    key={product._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-100 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      {/* Product image */}
                      <Link
                        to={`/products/${product._id}`}
                        className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 sm:h-36 sm:w-36"
                      >
                        {image ? (
                          <ProductImage
                            src={image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-3 transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <Package size={38} className="text-slate-300" />
                        )}
                      </Link>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                              {product.brand || product.category}
                            </p>

                            <Link
                              to={`/products/${product._id}`}
                              className="text-base font-bold leading-6 text-slate-900 transition hover:text-indigo-600"
                            >
                              {product.name}
                            </Link>

                            <p className="mt-2 text-lg font-extrabold text-indigo-600">
                              {formatPrice(product.price)}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => {
                              void removeFromCart(product._id).catch(() => {});
                            }}
                            aria-label={`Remove ${product.name}`}
                            title="Remove item"
                            className="rounded-xl border border-slate-100 p-2.5 text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Stock */}
                        <div className="mt-3">
                          {unavailable ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                              <AlertCircle size={14} />
                              Currently unavailable
                            </span>
                          ) : exceedsStock ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                              <AlertCircle size={14} />
                              Only {product.stock} available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                              <CheckCircle2 size={14} />
                              In stock
                            </span>
                          )}
                        </div>

                        {/* Quantity and total */}
                        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
                          <div>
                            <p className="mb-2 text-xs font-medium text-slate-400">
                              Quantity
                            </p>

                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <button
                                type="button"
                                disabled={isUpdating || item.quantity <= 1}
                                onClick={() => {
                                  void changeQuantity(
                                    product._id,
                                    item.quantity - 1,
                                  ).catch(() => {});
                                }}
                                aria-label={`Decrease quantity of ${product.name}`}
                                className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Minus size={16} />
                              </button>

                              <span className="flex h-10 min-w-10 items-center justify-center border-x border-slate-200 px-3 text-sm font-bold text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                disabled={
                                  isUpdating || atStockLimit || unavailable
                                }
                                onClick={() => {
                                  void changeQuantity(
                                    product._id,
                                    item.quantity + 1,
                                  ).catch(() => {});
                                }}
                                aria-label={`Increase quantity of ${product.name}`}
                                className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="mb-1 text-xs font-medium text-slate-400">
                              Item total
                            </p>

                            <p className="text-xl font-extrabold text-slate-900">
                              {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Cart update error */}
              {updateError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />

                  <p>
                    {requestErrorMessage(
                      updateError,
                      "Unable to update your cart. Refresh it and try again.",
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="shrink-0 font-semibold underline"
                  >
                    Reload cart
                  </button>
                </div>
              )}

              {isUpdating && (
                <p
                  role="status"
                  className="flex items-center gap-2 px-1 text-xs text-indigo-600"
                >
                  <LoaderCircle size={14} className="animate-spin" />
                  Updating your cart...
                </p>
              )}
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Order Summary
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Review your items before checkout
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal ({totalQuantity}{" "}
                      {totalQuantity === 1 ? "item" : "items"})
                    </span>

                    <span className="font-bold text-slate-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>

                    <span className="text-xs font-medium text-slate-400">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Subtotal
                      </span>

                      <span className="text-2xl font-extrabold text-indigo-600">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Final total may include shipping fees.
                    </p>
                  </div>

                  <Link
                    to="/checkout"
                    aria-disabled={isUpdating || items.some(isUnavailable)}
                    onClick={(e) => {
                      if (isUpdating || items.some(isUnavailable)) {
                        e.preventDefault();
                      }
                    }}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition ${
                      isUpdating || items.some(isUnavailable)
                        ? "cursor-not-allowed bg-indigo-300 shadow-none"
                        : "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
                    }`}
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/products"
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
                  >
                    <ArrowLeft size={16} />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Information cards */}
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <Truck
                    size={19}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Delivery information
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Shipping options and fees will be shown at checkout.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Order review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Review your order details before placing your order.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
