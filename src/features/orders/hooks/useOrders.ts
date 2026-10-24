import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orderService } from "../services/orderService";
import { isAxiosError } from "axios";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.createOrder,
    retry: false,
    onError: async (error) => {
      if (
        isAxiosError(error) &&
        (error.response?.status === 409 || error.response?.status === 400)
      ) {
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    },

    onSuccess: () => {
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

export const useMyOrders = () => {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: orderService.getMyOrders,
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
    mutationFn: orderService.cancelOrder,
    retry: false,
    onSuccess: async (order) => {
      await queryClient.cancelQueries({
        queryKey: ["orders", "detail", order._id],
      });
      queryClient.setQueryData(["orders", "detail", order._id], order);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
};
