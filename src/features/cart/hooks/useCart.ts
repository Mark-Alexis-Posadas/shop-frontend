import { useRef } from "react";
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { cartService } from "../services/cartService";
import type { Cart, CartItemInput } from "../services/cartService";
import { useAuthStore } from "../../auth/store/authStore";

export function useCart() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const isUpdatingRef = useRef(false);

  const queryKey = ["cart", token] as const;
  const mutationKey = ["cart-update", token] as const;
  const activeUpdates = useIsMutating({ mutationKey });

  const cartQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => cartService.getCart(signal),
    enabled: Boolean(token),
  });

  const updateMutation = useMutation({
    mutationKey,
    retry: false,
    mutationFn: cartService.updateCart,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey, exact: true });
    },

    onSuccess: async (updatedCart) => {
      if (useAuthStore.getState().token !== token) return;
      await queryClient.cancelQueries({ queryKey, exact: true });
      if (useAuthStore.getState().token !== token) return;
      queryClient.setQueryData<Cart>(queryKey, (current) =>
        current?._id === updatedCart._id &&
        current.version > updatedCart.version
          ? current
          : updatedCart,
      );
    },

    onError: async () => {
      if (useAuthStore.getState().token !== token) return;
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const updateCartItems = async (cart: Cart, items: CartItemInput[]) => {
    if (!token || useAuthStore.getState().token !== token) {
      throw new Error("Please log in first.");
    }

    if (!cartQuery.data) {
      throw new Error("Cart is not ready yet.");
    }

    // Local click guard only. Database revisions protect other hooks/tabs.
    if (isUpdatingRef.current) {
      throw new Error("Cart update already in progress.");
    }

    isUpdatingRef.current = true;

    try {
      return await updateMutation.mutateAsync({
        items,
        cartId: cart._id,
        version: cart.version,
      });
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const getCurrentCart = (): Cart => {
    if (!token || useAuthStore.getState().token !== token)
      throw new Error("Please log in first.");
    const cart = queryClient.getQueryData<Cart>(queryKey);

    if (!cart) {
      throw new Error("Cart is not ready yet.");
    }

    return cart;
  };

  const getItems = (cart: Cart): CartItemInput[] =>
    cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    }));

  const addToCart = async (productId: string, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const cart = getCurrentCart();
    const items = getItems(cart);

    const existingItem = items.find((item) => item.product === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        product: productId,
        quantity,
      });
    }

    return updateCartItems(cart, items);
  };

  const changeQuantity = async (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity.");
    }

    const cart = getCurrentCart();
    const items = getItems(cart).map((item) => ({
      ...item,
      quantity: item.product === productId ? quantity : item.quantity,
    }));

    return updateCartItems(cart, items);
  };

  const removeFromCart = async (productId: string) => {
    const cart = getCurrentCart();
    const items = getItems(cart).filter((item) => item.product !== productId);

    return updateCartItems(cart, items);
  };

  return {
    ...cartQuery,
    addToCart,
    changeQuantity,
    removeFromCart,
    isUpdating: activeUpdates > 0,
    updateError: updateMutation.error,
  };
}
