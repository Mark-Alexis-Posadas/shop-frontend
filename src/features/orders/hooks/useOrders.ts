import { useAuthStore } from "../../auth/store/authStore";
import { myOrdersKey, type OrderFilters } from "../utils/orderFilters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orderService } from "../services/orderService";
import { isAxiosError } from "axios";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["orders", "create"],
    mutationFn: orderService.createOrder,
    onMutate: () => ({ token: useAuthStore.getState().token }),
    retry: false,
    onError: async (error, _variables, context) => {
      if (context?.token !== useAuthStore.getState().token) return;
      if (
        isAxiosError(error) &&
        (error.response?.status === 409 || error.response?.status === 400)
      ) {
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    },

    onSuccess: (_order, _variables, context) => {
      if (context?.token !== useAuthStore.getState().token) return;
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useMyOrders = (filters: OrderFilters, enabled = true) => {
  return useQuery({
    queryKey: myOrdersKey(filters),
    queryFn: ({ signal }) => orderService.getMyOrders(filters, signal),
    enabled,
  });
};

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: Boolean(orderId),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["orders", "cancel"],
    mutationFn: orderService.cancelOrder,
    onMutate: () => ({ token: useAuthStore.getState().token }),
    retry: false,
    onSuccess: async (order, _variables, context) => {
      if (context?.token !== useAuthStore.getState().token) return;
      await queryClient.cancelQueries({
        queryKey: ["orders", "detail", order._id],
      });
      if (context?.token !== useAuthStore.getState().token) return;
      queryClient.setQueryData(["orders", "detail", order._id], order);
    },
    onSettled: async (_data, _error, _variables, context) => {
      if (context?.token !== useAuthStore.getState().token) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
};
