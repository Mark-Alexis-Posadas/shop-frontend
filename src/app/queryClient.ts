import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failures, error) =>
        !(
          isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) && failures < 1,
      refetchOnWindowFocus: false,
    },
  },
});
