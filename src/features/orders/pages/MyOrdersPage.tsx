import {
  orderStatuses,
  paymentStatuses,
  readOrderFilters,
  updateOrderParams,
} from "../utils/orderFilters";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  const location = useLocation();
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
          state={{ returnTo: location.pathname + location.search }}
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
  const [params, setParams] = useSearchParams();
  const { filters, error } = readOrderFilters(params);
  const { data, isLoading, isError, isFetching, refetch } = useMyOrders(
    filters,
    !error,
  );
  const orders = data?.items ?? [];
  const change = (changes: Record<string, string>) =>
    setParams((current) => updateOrderParams(current, changes));
  const totalPages = data?.totalPages ?? 0;
  const lastPage = Math.min(
    totalPages,
    10000,
    Math.floor(10000 / filters.limit) + 1,
  );
  const pages = Array.from(
    new Set([1, filters.page - 1, filters.page, filters.page + 1, lastPage]),
  )
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((a, b) => a - b);
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
            disabled={isFetching || Boolean(error)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700">
            Order status
            <select
              value={filters.orderStatus}
              onChange={(event) => change({ orderStatus: event.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 p-2.5 focus:outline-indigo-500"
            >
              <option value="">All statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Payment status
            <select
              value={filters.paymentStatus}
              onChange={(event) =>
                change({ paymentStatus: event.target.value })
              }
              className="mt-2 w-full rounded-xl border border-slate-300 p-2.5 focus:outline-indigo-500"
            >
              <option value="">All payments</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Sort by
            <select
              value={filters.sort}
              onChange={(event) => change({ sort: event.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 p-2.5 focus:outline-indigo-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setParams({})}
            className="self-end rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-indigo-700 focus-visible:outline-2"
          >
            Reset Filters
          </button>
        </div>
        {error && (
          <p role="alert" className="mb-6 text-red-700">
            {error}
          </p>
        )}
        {!error && isLoading && (
          <p role="status" className="mb-6 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your orders...
          </p>
        )}
        {!error && isError && (
          <div role="alert" className="mb-6">
            <p className="text-red-700">Unable to load orders.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        )}
        {!error && !isLoading && !isError && (
          <>
            {orders.length === 0 && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold">No orders on this page</h2>
                <p className="mt-2 text-slate-600">
                  No orders match this page and filters. Reset filters or choose
                  an earlier page.
                </p>
                <Link
                  to="/products"
                  className="mt-4 inline-flex items-center gap-2 text-indigo-700"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
            {/* Summary */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" />
                </div>

                <p className="text-sm text-slate-500">Matching Orders</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {data?.total ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Clock3 className="h-5 w-5 text-amber-600" />
                </div>

                <p className="text-sm text-slate-500">Pending on This Page</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {pendingOrders}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>

                <p className="text-sm text-slate-500">
                  Page Value (Excl. Cancelled)
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>

            {/* Order list */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Order History
              </h2>

              <span
                role="status"
                aria-live="polite"
                className="text-sm text-slate-500"
              >
                {data?.total ?? 0} matching orders | Page {filters.page} of{" "}
                {Math.max(1, totalPages)}
              </span>
            </div>

            <div className="space-y-5" aria-busy={isFetching}>
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
            {totalPages > lastPage && (
              <p className="mt-5 text-sm text-slate-600">
                Narrow your filters to browse beyond the first 10,000 results.
              </p>
            )}
            {totalPages > 0 && (
              <nav
                aria-label="Order pages"
                className="mt-6 flex flex-wrap justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={filters.page <= 1}
                  onClick={() => change({ page: String(filters.page - 1) })}
                  className="rounded-lg border px-3 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                {pages.map((page, index) => (
                  <span key={page} className="inline-flex items-center gap-2">
                    {index > 0 && page - pages[index - 1] > 1 && (
                      <span aria-hidden="true">...</span>
                    )}
                    <button
                      type="button"
                      aria-label={`Go to page ${page}`}
                      aria-current={page === filters.page ? "page" : undefined}
                      onClick={() => change({ page: String(page) })}
                      className={`rounded-lg border px-3 py-2 ${page === filters.page ? "bg-indigo-600 text-white" : "bg-white"}`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  disabled={filters.page >= lastPage}
                  onClick={() => change({ page: String(filters.page + 1) })}
                  className="rounded-lg border px-3 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default MyOrdersPage;
