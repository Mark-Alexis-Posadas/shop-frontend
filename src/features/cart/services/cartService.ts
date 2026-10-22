import { api } from "../../../shared/lib/api";
import { isAxiosError } from "axios";
import type { Product } from "../../products/services/productService";

// Payload sent to PUT /api/cart
export interface CartItemInput {
  product: string;
  quantity: number;
}

// Populated product returned by GET /api/cart
export interface CartItem {
  productId: string;
  product: Product | null;
  quantity: number;
}

export interface Cart {
  _id: string | null;
  version: number;
  user: string;
  items: CartItem[];
}

export interface CartUpdate {
  cartId: string | null;
  version: number;
  items: CartItemInput[];
}

export function isUnavailable(item: CartItem): boolean {
  return (
    !item.product ||
    !item.product.isActive ||
    item.quantity > item.product.stock
  );
}

export const cartService = {
  getCart: async (signal?: AbortSignal): Promise<Cart> => {
    const { data } = await api.get<Cart>("/cart", { signal });
    return data;
  },

  updateCart: async (payload: CartUpdate): Promise<Cart> => {
    try {
      const { data } = await api.put<Cart>("/cart", payload);
      return data;
    } catch (error) {
      if (isAxiosError<{ message?: string }>(error)) {
        throw new Error(
          error.response?.data?.message ??
            "Unable to update your cart. Please try again.",
          { cause: error },
        );
      }
      throw error;
    }
  },
};
