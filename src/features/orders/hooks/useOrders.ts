import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orderService } from "../services/orderService";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.createOrder,

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
