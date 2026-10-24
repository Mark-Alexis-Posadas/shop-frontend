import type { OrderFilters } from "../utils/orderFilters";
import { api } from "../../../shared/lib/api";

import type {
  CreateOrderPayload,
  Order,
  OrderPage,
} from "../types/order.types";

export const orderService = {
  getCheckoutAttempt: async (key: string): Promise<Order> => {
    const { data } = await api.get<Order>(
      `/orders/checkout-attempts/${encodeURIComponent(key)}`,
    );
    return data;
  },
  cancelOrder: async (orderId: string): Promise<Order> => {
    const { data } = await api.post<Order>(`/orders/${orderId}/cancel`, {
      confirmed: true,
    });
    return data;
  },
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post<Order>("/orders", payload);
    return data;
  },

  getMyOrders: async (
    filters: OrderFilters,
    signal?: AbortSignal,
  ): Promise<OrderPage> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );
    const { data } = await api.get<OrderPage>("/orders/my", { params, signal });
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${orderId}`);
    return data;
  },
};
