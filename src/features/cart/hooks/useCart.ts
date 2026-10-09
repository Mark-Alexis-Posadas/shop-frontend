import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService } from "../services/cartService";
import { useAuthStore } from "../../auth/store/authStore";
import type { CartItem } from "../services/cartService";

export function useCart() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", token],
    queryFn: cartService.getCart,
    enabled: Boolean(token),
  });

  const updateMutation = useMutation({
    mutationFn: cartService.updateCart,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart", token], cart);
    },
  });

  const addToCart = (productId: string) => {
    if (!token) {
      throw new Error("Please log in first.");
    }

    if (!cartQuery.data || updateMutation.isPending) {
      return;
    }

    const items: CartItem[] = cartQuery.data.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    const existingItem = items.find((item) => item.product === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({ product: productId, quantity: 1 });
    }

    updateMutation.mutate(items);
  };

  const removeFromCart = (productId: string) => {
    if (!cartQuery.data || updateMutation.isPending) {
      return;
    }

    const items = cartQuery.data.items
      .filter((item) => item.product !== productId)
      .map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));

    updateMutation.mutate(items);
  };

  return {
    ...cartQuery,
    addToCart,
    removeFromCart,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
