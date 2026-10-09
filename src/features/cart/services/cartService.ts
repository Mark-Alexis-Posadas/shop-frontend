import { api } from "../../../shared/lib/api";

export interface CartItem {
  product: string;
  quantity: number;
}

export interface Cart {
  user: string;
  items: CartItem[];
}

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const { data } = await api.get<Cart>("/cart");
    return data;
  },

  updateCart: async (items: CartItem[]): Promise<Cart> => {
    const { data } = await api.put<Cart>("/cart", { items });
    return data;
  },
};
