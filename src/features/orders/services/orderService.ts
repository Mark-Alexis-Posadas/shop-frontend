import { api } from "../../../shared/lib/api";

import type { CreateOrderPayload, Order } from "../types/order.types";

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post<Order>("/orders", payload);
    return data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>("/orders/my");
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${orderId}`);
    return data;
  },
};
