import { isAxiosError } from "axios";
import { useCancelOrder } from "../hooks/useOrders";
import type { Order } from "../types/order.types";

export function CancelOrderAction({ order }: { order: Order }) {
  const cancellation = useCancelOrder();
  const eligible =
    order.paymentMethod === "COD" &&
    order.paymentStatus === "unpaid" &&
    ["pending", "confirmed"].includes(order.orderStatus);
  const conflict =
    isAxiosError(cancellation.error) &&
    cancellation.error.response?.status === 409;
  return (
    <section
      className="mb-6 space-y-3"
      aria-label="Order cancellation"
      aria-busy={cancellation.isPending}
    >
      {eligible && (
        <button
          type="button"
          disabled={cancellation.isPending}
          className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50"
          onClick={() => {
            if (
              window.confirm(
                "Cancel this order? This cannot be undone. Your cart will not be restored.",
              )
            )
              cancellation.mutate(order._id);
          }}
        >
          {cancellation.isPending ? "Cancelling order?" : "Cancel order"}
        </button>
      )}
      {cancellation.isSuccess && (
        <p role="status" className="text-sm text-emerald-700">
          Your order was cancelled successfully.
        </p>
      )}
      {cancellation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {conflict
            ? "This order can no longer be cancelled. Its latest status has been requested."
            : "Cancellation could not be confirmed. Refresh to check the latest status before trying again."}
        </p>
      )}
    </section>
  );
}
