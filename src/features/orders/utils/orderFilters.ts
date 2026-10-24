import type { OrderStatus, PaymentStatus } from "../types/order.types";
export const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];
export const paymentStatuses: PaymentStatus[] = ["unpaid", "paid"];
export interface OrderFilters {
  page: number;
  limit: number;
  orderStatus: OrderStatus | "";
  paymentStatus: PaymentStatus | "";
  sort: "newest" | "oldest";
}
export function readOrderFilters(params: URLSearchParams): {
  filters: OrderFilters;
  error: string;
} {
  const page = params.get("page") ?? "1",
    limit = params.get("limit") ?? "10";
  const orderStatus = params.get("orderStatus") ?? "",
    paymentStatus = params.get("paymentStatus") ?? "",
    sort = params.get("sort") ?? "newest";
  let error = "";
  const allowed = ["page", "limit", "orderStatus", "paymentStatus", "sort"];
  if (
    Array.from(params.keys()).some(
      (key) => !allowed.includes(key) || params.getAll(key).length > 1,
    )
  )
    error = "Unsupported or repeated order filter. Reset filters to continue.";
  if (
    !/^[1-9]\d*$/.test(page) ||
    !/^[1-9]\d*$/.test(limit) ||
    Number(page) > 10000 ||
    Number(limit) > 50 ||
    (Number(page) - 1) * Number(limit) > 10000
  )
    error = "Invalid page or page size. Reset filters to continue.";
  if (orderStatus && !orderStatuses.includes(orderStatus as OrderStatus))
    error = "Choose a valid order status.";
  if (
    paymentStatus &&
    !paymentStatuses.includes(paymentStatus as PaymentStatus)
  )
    error = "Choose a valid payment status.";
  if (sort !== "newest" && sort !== "oldest")
    error = "Choose newest or oldest sorting.";
  return {
    filters: {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderFilters["orderStatus"],
      paymentStatus: paymentStatus as OrderFilters["paymentStatus"],
      sort: sort as OrderFilters["sort"],
    },
    error,
  };
}
export function updateOrderParams(
  current: URLSearchParams,
  changes: Record<string, string>,
) {
  const next = new URLSearchParams(current);
  next.delete("page");
  for (const [key, value] of Object.entries(changes)) {
    if (
      !value ||
      (key === "page" && value === "1") ||
      (key === "sort" && value === "newest")
    )
      next.delete(key);
    else next.set(key, value);
  }
  return next;
}
export function myOrdersKey(filters: OrderFilters) {
  return ["orders", "my", filters] as const;
}
export function orderHistoryReturnTo(state: unknown): string {
  if (
    state &&
    typeof state === "object" &&
    "returnTo" in state &&
    typeof state.returnTo === "string" &&
    /^\/orders(?:\?.*)?$/.test(state.returnTo)
  )
    return state.returnTo;
  return "/orders";
}
