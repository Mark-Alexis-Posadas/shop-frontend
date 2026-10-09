import { api } from "../../../shared/lib/api";
import type { Product } from "../../products/services/productService";

// Payload sent to PUT /api/cart
export interface CartItemInput {
  product: string;
  quantity: number;
}

// Populated product returned by GET /api/cart
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
}

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const { data } = await api.get<Cart>("/cart");
    return data;
  },

  updateCart: async (items: CartItemInput[]): Promise<Cart> => {
    const { data } = await api.put<Cart>("/cart", { items });

    return data;
  },
};
