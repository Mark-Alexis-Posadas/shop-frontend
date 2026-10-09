import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../../products/utils/product.utils";

const CartPage = () => {
  const {
    data: cart,
    isPending,
    isError,
    error,
    isUpdating,
    updateError,
    changeQuantity,
    removeFromCart,
  } = useCart();

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">Loading your cart...</div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-red-600">
        {error instanceof Error ? error.message : "Failed to load cart."}
      </div>
    );
  }

  const items = cart?.items ?? [];

  const subtotal = items.reduce(
    (total, item) => total + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">Your cart is empty.</p>

          <Link
            to="/products"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {items.map((item) => {
              const product = item.product;

              if (!product) return null;

              const image =
                product.images?.find((img) => img.isPrimary)?.url ??
                product.images?.[0]?.url;

              return (
                <article
                  key={product._id}
                  className="flex flex-col gap-5 rounded-2xl border border-gray-200 p-5 sm:flex-row"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="h-28 w-28 rounded-xl bg-gray-100 object-contain"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                      No image
                    </div>
                  )}

                  <div className="flex-1">
                    <Link
                      to={`/products/${product._id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-2 font-bold">
                      {formatPrice(product.price)}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isUpdating || item.quantity <= 1}
                        onClick={() =>
                          void changeQuantity(
                            product._id,
                            item.quantity - 1,
                          ).catch(() => {})
                        }
                        className="rounded-lg border px-3 py-1 disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="font-semibold">{item.quantity}</span>

                      <button
                        type="button"
                        disabled={isUpdating || item.quantity >= product.stock}
                        onClick={() =>
                          void changeQuantity(
                            product._id,
                            item.quantity + 1,
                          ).catch(() => {})
                        }
                        className="rounded-lg border px-3 py-1 disabled:opacity-40"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          void removeFromCart(product._id).catch(() => {})
                        }
                        className="ml-auto text-sm font-medium text-red-600 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="font-bold">
                    {formatPrice(product.price * item.quantity)}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="mt-6 flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Shipping and other charges will be calculated at checkout.
            </p>

            <Link
              to="/checkout"
              className="mt-6 block rounded-xl bg-indigo-600 px-5 py-3 text-center font-semibold text-white hover:bg-indigo-700"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}

      {updateError && (
        <p role="alert" className="mt-5 text-sm text-red-600">
          {updateError instanceof Error
            ? updateError.message
            : "Failed to update cart."}
        </p>
      )}
    </main>
  );
};

export default CartPage;
