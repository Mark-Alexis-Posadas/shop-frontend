import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function CartPage() {
  const {
    data: cart,
    isPending,
    isError,
    isUpdating,
    updateError,
    removeFromCart,
  } = useCart();

  if (isPending) {
    return <p className="px-6 py-20 text-center">Loading cart...</p>;
  }

  if (isError) {
    return (
      <p className="px-6 py-20 text-center text-red-600">
        Failed to load cart.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      {!cart?.items.length ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <p>Your cart is empty.</p>
          <Link to="/products" className="mt-4 inline-block text-indigo-600">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.product}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-semibold">Product: {item.product}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <button
                disabled={isUpdating}
                onClick={() => removeFromCart(item.product)}
                className="text-sm font-semibold text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}

          {updateError && (
            <p role="alert" className="text-red-600">
              Cart update failed. Please try again.
            </p>
          )}

          <Link
            to="/checkout"
            className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}
    </section>
  );
}
