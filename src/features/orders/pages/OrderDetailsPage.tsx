import { ProductImage } from "../../../shared/components/ui/ProductImage";
import { orderHistoryReturnTo } from "../utils/orderFilters";
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { CancelOrderAction } from "../components/CancelOrderAction";
import { useOrderDetails } from "../hooks/useOrders";
import type { Order, OrderStatus, PaymentStatus } from "../types/order.types";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
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

const ORDER_STEPS = [
  { status: "pending", label: "Order Placed", icon: ShoppingBag },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Package },
] as const;

const OrderTimeline = ({ status }: { status: OrderStatus }) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-start gap-4 rounded-xl border border-red-100 bg-red-50 p-4">
        <XCircle className="h-6 w-6 shrink-0 text-red-600" />
        <div>
          <p className="font-bold text-red-800">Order Cancelled</p>
          <p className="mt-1 text-sm text-red-700">
            This order has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="space-y-0">
      {ORDER_STEPS.map((step, index) => {
        const Icon = step.icon;
        const completed = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ORDER_STEPS.length - 1;

        return (
          <li key={step.status} className="relative flex gap-4">
            {!isLast && (
              <div
                className={`absolute left-[19px] top-10 h-[calc(100%-40px)] w-0.5 ${
                  index < currentIndex ? "bg-indigo-500" : "bg-slate-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                completed
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 pb-9 pt-2">
              <p
                className={`text-sm font-bold ${
                  completed ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step.label}
              </p>

              {isCurrent && (
                <p className="mt-1 text-xs font-medium text-indigo-600">
                  Current status
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const OrderContent = ({ order }: { order: Order }) => {
  const location = useLocation();
  const returnTo = orderHistoryReturnTo(location.state);
  const address = order.shippingAddress;

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50/80 pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          to={returnTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orders
        </Link>

        {/* Header */}
        <div className="mb-8 mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Order Details
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Order Information
            </h1>

            <p className="mt-3 break-all font-mono text-sm text-slate-500">
              #{order._id}
            </p>

            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
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

        <CancelOrderAction key={order._id} order={order} />

        {/* Success message */}
        {order.orderStatus === "pending" && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900">
                Your order has been placed!
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                We've received your order. You can check its status on this
                page.
              </p>
            </div>
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Ordered items */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Items Ordered
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {totalQuantity} item
                  {totalQuantity !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="divide-y divide-slate-100 px-6">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex items-start gap-4 py-5"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {item.imageUrl ? (
                        <ProductImage
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

                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {item.sku}
                      </p>

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
            </section>

            {/* Shipping */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-1 p-6 text-sm leading-6 text-slate-600">
                <p className="font-bold text-slate-900">{address.fullName}</p>
                <p>{address.phone}</p>
                <p>{address.addressLine1}</p>

                {address.addressLine2 && <p>{address.addressLine2}</p>}

                <p>
                  {address.city}, {address.province} {address.postalCode}
                </p>
              </div>
            </section>

            {/* Payment */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Payment Information
                </h2>
              </div>

              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {order.paymentStatus === "paid"
                      ? "Payment completed"
                      : "Payment pending"}
                  </p>
                </div>

                <ShieldCheck className="h-6 w-6 text-indigo-600" />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Timeline */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Order Status
                </h2>
              </div>

              <OrderTimeline status={order.orderStatus} />
            </section>

            {/* Totals */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {order.shippingFee === 0
                      ? "Free"
                      : formatCurrency(order.shippingFee)}
                  </span>
                </div>

                <div className="my-4 border-t border-dashed border-slate-200" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </section>

            <Link
              to="/products"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Continue Shopping
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const returnTo = orderHistoryReturnTo(location.state);

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderDetails(orderId ?? "");

  if (!orderId) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Invalid order</h1>
        <Link
          to={returnTo}
          className="mt-5 inline-block text-sm font-semibold text-indigo-600"
        >
          Back to My Orders
        </Link>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  if (isError) {
    const isNotFound =
      axios.isAxiosError(error) && error.response?.status === 404;

    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          {isNotFound ? (
            <Package className="mx-auto h-14 w-14 text-slate-300" />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-red-400" />
          )}

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {isNotFound ? "Order not found" : "Unable to load order"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isNotFound
              ? "This order doesn't exist or isn't accessible to your account."
              : "Something went wrong while fetching your order. Please try again."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!isNotFound && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            )}

            <Link
              to={returnTo}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Order not found
        </h1>
        <Link
          to={returnTo}
          className="mt-5 inline-block text-sm font-semibold text-indigo-600"
        >
          Back to My Orders
        </Link>
      </main>
    );
  }

  return <OrderContent order={order} />;
};

export default OrderDetailsPage;
