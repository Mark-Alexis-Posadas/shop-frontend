import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartService } from "../services/cartService";
import type { CartItemInput } from "../services/cartService";
import { useAuthStore } from "../../auth/store/authStore";

export function useCart() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const isUpdatingRef = useRef(false);

  const queryKey = ["cart", token] as const;

  const cartQuery = useQuery({
    queryKey,
    queryFn: cartService.getCart,
    enabled: Boolean(token),
  });

  const updateMutation = useMutation({
    mutationFn: cartService.updateCart,

    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKey, updatedCart);
    },

    onError: () => {
      void queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const updateCartItems = async (items: CartItemInput[]) => {
    if (!token) {
      throw new Error("Please log in first.");
    }

    if (!cartQuery.data) {
      throw new Error("Cart is not ready yet.");
    }

    // Prevent rapid clicks from overlapping mutations.
    if (isUpdatingRef.current) {
      throw new Error("Cart update already in progress.");
    }

    isUpdatingRef.current = true;

    try {
      return await updateMutation.mutateAsync(items);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const getCurrentItems = (): CartItemInput[] => {
    const cart = queryClient.getQueryData<typeof cartQuery.data>(queryKey);

    if (!cart) {
      throw new Error("Cart is not ready yet.");
    }

    return cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const items = getCurrentItems();

    const existingItem = items.find((item) => item.product === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        product: productId,
        quantity,
      });
    }

    return updateCartItems(items);
  };

  const changeQuantity = async (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const items = getCurrentItems().map((item) => ({
      ...item,
      quantity: item.product === productId ? quantity : item.quantity,
    }));

    return updateCartItems(items);
  };

  const removeFromCart = async (productId: string) => {
    const items = getCurrentItems().filter(
      (item) => item.product !== productId,
    );

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
