import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useMyOrders } from "../hooks/useOrders";
import type { Order, OrderStatus, PaymentStatus } from "../types/order.types";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(date));

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  unpaid: "bg-slate-100 text-slate-700 ring-slate-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const formatStatus = (status: string): string =>
  status.charAt(0).toUpperCase() + status.slice(1);

const OrderCard = ({ order }: { order: Order }) => {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Order header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Order number
          </p>

          <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">
            #{order._id}
          </p>

          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays className="h-4 w-4" />
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${
              orderStatusStyles[order.orderStatus] ??
              "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {formatStatus(order.orderStatus)}
          </span>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
              paymentStatusStyles[order.paymentStatus] ??
              "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {formatStatus(order.paymentStatus)}
          </span>
        </div>
      </div>

      {/* Products */}
      <div className="divide-y divide-slate-100 px-5 sm:px-6">
        {order.items.map((item, index) => (
          <div
            key={`${item.product}-${index}`}
            className="flex items-start gap-4 py-5"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-slate-300" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-slate-900">
                {item.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>

              <p className="mt-2 text-xs text-slate-500">
                {formatCurrency(item.price)} × {item.quantity}
              </p>
            </div>

            <p className="shrink-0 text-right text-sm font-bold text-slate-900">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs text-slate-500">
            {totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
            {" · "}
            {order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : order.paymentMethod}
          </p>

          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {formatCurrency(order.total)}
          </p>
        </div>

        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

const MyOrdersPage = () => {
  const {
    data: orders = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useMyOrders();

  if (isLoading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Loading your orders...</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <Package className="mx-auto h-14 w-14 text-slate-300" />

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Unable to load orders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Something went wrong while fetching your order history.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <ShoppingBag className="h-10 w-10 text-indigo-500" />
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
            No orders yet
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your order history will appear here once you place your first order.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const totalSpent = orders
    .filter((order) => order.orderStatus !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50/80 pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              My Account
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your purchases and review your order history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
            </div>

            <p className="text-sm text-slate-500">Total Orders</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>

            <p className="text-sm text-slate-500">Pending Orders</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Truck className="h-5 w-5 text-emerald-600" />
            </div>

            <p className="text-sm text-slate-500">
              Order Value (Excl. Cancelled)
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        {/* Order list */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Order History</h2>

          <span className="text-sm text-slate-500">
            {orders.length} order
            {orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-5">
          {[...orders]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
        </div>
      </div>
    </main>
  );
};

export default MyOrdersPage;
