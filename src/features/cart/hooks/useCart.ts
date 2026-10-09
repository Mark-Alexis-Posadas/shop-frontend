import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartService } from "../services/cartService";
import type { CartItemInput } from "../services/cartService";
import { useAuthStore } from "../../auth/store/authStore";

export function useCart() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const queryKey = ["cart", token] as const;

  const cartQuery = useQuery({
    queryKey,
    queryFn: cartService.getCart,
    enabled: Boolean(token),
  });

  const updateMutation = useMutation({
    mutationFn: cartService.updateCart,

    onSuccess: (cart) => {
      queryClient.setQueryData(queryKey, cart);
    },
  });

  const updateCartItems = async (items: CartItemInput[]) => {
    if (!token) {
      throw new Error("Please log in first.");
    }

    // Avoid replacing a cart that is still loading.
    if (!cartQuery.data) {
      throw new Error("Cart is not ready yet.");
    }

    if (updateMutation.isPending) {
      throw new Error("Cart update already in progress.");
    }

    return updateMutation.mutateAsync(items);
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const currentItems: CartItemInput[] = (cartQuery.data?.items ?? []).map(
      (item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }),
    );

    const existingItem = currentItems.find(
      (item) => item.product === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({
        product: productId,
        quantity,
      });
    }

    return updateCartItems(currentItems);
  };

  const changeQuantity = async (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const items: CartItemInput[] = (cartQuery.data?.items ?? []).map(
      (item) => ({
        product: item.product._id,
        quantity: item.product._id === productId ? quantity : item.quantity,
      }),
    );

    return updateCartItems(items);
  };

  const removeFromCart = async (productId: string) => {
    const items: CartItemInput[] = (cartQuery.data?.items ?? [])
      .filter((item) => item.product._id !== productId)
      .map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

    return updateCartItems(items);
  };

  return {
    ...cartQuery,
    addToCart,
    changeQuantity,
    removeFromCart,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
